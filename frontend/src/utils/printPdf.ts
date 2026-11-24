import { PAYMENT_METHODS } from '../data/kwaboData';
import type { InvoiceItem, RequestItem, RequestStatus } from '../types';

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDateFr = (iso?: string | null): string => {
  if (!iso) return '–';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '–';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatShortDateFr = (iso?: string | null): string => {
  if (!iso) return '–';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '–';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const BASE_PRINT_STYLES = `
  @page {
    size: A4;
    margin: 14mm;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  html, body {
    background: #ffffff;
    color: #0d1d2b;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 13px;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .doc {
    max-width: 780px;
    margin: 0 auto;
    padding: 20px 24px 28px;
  }
  .header-band {
    background: linear-gradient(135deg, #084d82 0%, #006191 100%);
    color: #ffffff;
    border-radius: 14px;
    padding: 24px 28px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    border-bottom: 4px solid #f7c531;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand-mark {
    width: 44px;
    height: 44px;
    border-radius: 11px;
    background: #f7c531;
    color: #084d82;
    font-family: Georgia, "Times New Roman", serif;
    font-weight: 700;
    font-size: 24px;
    line-height: 44px;
    text-align: center;
    flex-shrink: 0;
  }
  .brand-name {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.02em;
    line-height: 1.1;
  }
  .brand-dot {
    color: #f7c531;
  }
  .brand-tag {
    font-size: 11.5px;
    color: rgba(255, 255, 255, 0.82);
    margin-top: 3px;
  }
  .doc-meta-top {
    text-align: right;
  }
  .doc-kicker {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #ffdf93;
    margin-bottom: 4px;
  }
  .doc-number {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 21px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.2;
  }
  .doc-date {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.82);
    margin-top: 4px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 11px;
    border-radius: 999px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.02em;
    border: 1px solid transparent;
  }
  .pill-paid { background: #e3efff; color: #006191; border-color: #9fcaff; }
  .pill-due { background: #ffdf93; color: #765b00; border-color: #f2c02c; }
  .pill-refunded { background: #d1e4ff; color: #004b71; border-color: #8fcdff; }
  .pill-cancelled { background: #ffdad6; color: #93000a; border-color: #ba1a1a; }
  .pill-neutral { background: #edf4ff; color: #3f4850; border-color: #d0e3f5; }
  .footer {
    margin-top: 28px;
    padding-top: 14px;
    border-top: 1px solid #d0e3f5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    font-size: 11px;
    color: #4c657a;
  }
  .footer strong {
    color: #006191;
  }
  .print-hint {
    margin-top: 18px;
    text-align: center;
  }
  .print-btn {
    background: #006191;
    color: #ffffff;
    border: none;
    border-radius: 999px;
    padding: 9px 18px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  @media print {
    .doc {
      max-width: none;
      padding: 0;
    }
    .no-print {
      display: none !important;
    }
  }
`;

const openPrintWindow = (title: string, bodyHtml: string, extraCss: string): boolean => {
  const win = window.open('', '_blank', 'width=860,height=920');
  if (!win) return false;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>${BASE_PRINT_STYLES}\n${extraCss}</style>
</head>
<body>
  <main class="doc">
    ${bodyHtml}
    <div class="print-hint no-print">
      <button type="button" class="print-btn" onclick="window.print()">Imprimer / Enregistrer en PDF</button>
    </div>
  </main>
  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.print(); }, 180);
    });
  </script>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
};

export interface PrintInvoiceOptions {
  invoice: InvoiceItem;
  clientName: string;
  clientEmail?: string | null;
  clientCountry?: string | null;
}

export const printInvoicePdf = ({
  invoice,
  clientName,
  clientEmail,
  clientCountry,
}: PrintInvoiceOptions): boolean => {
  const invNum = invoice.number || invoice.id;
  const methodLabel = invoice.method ? PAYMENT_METHODS[invoice.method]?.label ?? invoice.method : '–';
  const amountText = formatCurrency(invoice.amount);

  const statusMap: Record<InvoiceItem['status'], { label: string; cls: string }> = {
    paid: { label: '✓ Payée', cls: 'pill-paid' },
    due: { label: '⏳ À payer', cls: 'pill-due' },
    refunded: { label: '↺ Remboursée', cls: 'pill-refunded' },
    cancelled: { label: '✕ Annulée', cls: 'pill-cancelled' },
  };
  const statusInfo = statusMap[invoice.status] ?? { label: invoice.status, cls: 'pill-neutral' };
  const isPaid = invoice.status === 'paid';
  const isRefunded = invoice.status === 'refunded';
  const docKicker = isPaid
    ? 'Reçu de paiement officiel'
    : isRefunded
      ? 'Reçu de remboursement'
      : 'Facture officielle';
  const docTitle = isPaid
    ? `Reçu de paiement ${invNum} — BeniLink`
    : `Facture ${invNum} — BeniLink`;

  const extraCss = `
    .receipt-banner {
      margin-top: 18px;
      background: linear-gradient(135deg, #edf4ff 0%, #f7f9ff 100%);
      border: 1.5px solid #9fcaff;
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .receipt-banner-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .receipt-check {
      width: 34px;
      height: 34px;
      border-radius: 999px;
      background: #006191;
      color: #ffffff;
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .receipt-banner-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #084d82;
    }
    .receipt-banner-sub {
      font-size: 11.5px;
      color: #4c657a;
      margin-top: 2px;
    }
    .receipt-banner-amount {
      text-align: right;
    }
    .receipt-banner-amount small {
      display: block;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #4c657a;
      font-weight: 700;
    }
    .receipt-banner-amount strong {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 20px;
      color: #006191;
    }
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 20px;
    }
    .party-card {
      background: #f7f9ff;
      border: 1px solid #d0e3f5;
      border-radius: 10px;
      padding: 14px 16px;
    }
    .party-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #4c657a;
      margin-bottom: 6px;
    }
    .party-title {
      font-size: 15px;
      font-weight: 700;
      color: #0d1d2b;
      margin-bottom: 3px;
    }
    .party-sub {
      font-size: 12px;
      color: #3f4850;
      line-height: 1.5;
    }
    .meta-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 16px;
      padding: 13px 16px;
      background: #ffffff;
      border: 1px solid #d0e3f5;
      border-radius: 10px;
    }
    .meta-item dt {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #4c657a;
      margin-bottom: 3px;
    }
    .meta-item dd {
      font-size: 12.5px;
      font-weight: 600;
      color: #0d1d2b;
    }
    .table-wrap {
      margin-top: 20px;
      border: 1px solid #d0e3f5;
      border-radius: 10px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead th {
      background: #edf4ff;
      color: #006191;
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      text-align: left;
      padding: 11px 14px;
      border-bottom: 1px solid #d0e3f5;
    }
    thead th.num, tbody td.num {
      text-align: right;
    }
    tbody td {
      padding: 15px 14px;
      vertical-align: top;
      border-bottom: 1px solid #e3efff;
      font-size: 13px;
    }
    tbody tr:last-child td {
      border-bottom: none;
    }
    .item-title {
      font-weight: 700;
      color: #0d1d2b;
      font-size: 14px;
    }
    .item-sub {
      font-size: 12px;
      color: #4c657a;
      margin-top: 3px;
    }
    .summary-row {
      margin-top: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
    }
    .note-box {
      flex: 1;
      background: #f7f9ff;
      border: 1px solid #d0e3f5;
      border-radius: 10px;
      padding: 12px 15px;
      font-size: 11.5px;
      color: #3f4850;
    }
    .note-box strong {
      display: block;
      color: #0d1d2b;
      margin-bottom: 3px;
      font-size: 12px;
    }
    .totals-box {
      width: 280px;
      background: #edf4ff;
      border: 1.5px solid #9fcaff;
      border-radius: 12px;
      padding: 14px 18px;
    }
    .totals-line {
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
      color: #3f4850;
      margin-bottom: 6px;
    }
    .totals-grand {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-top: 1.5px solid #9fcaff;
      padding-top: 10px;
      margin-top: 8px;
    }
    .totals-grand span {
      font-size: 13px;
      font-weight: 700;
      color: #0d1d2b;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .totals-grand strong {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 24px;
      font-weight: 700;
      color: #006191;
    }
    .stamp {
      display: inline-block;
      margin-top: 8px;
      padding: 3px 9px;
      border: 1.5px solid #006191;
      border-radius: 6px;
      color: #006191;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
  `;

  const missionLine = invoice.request
    ? `${escapeHtml(invoice.request.title)} · Réf. ${escapeHtml(invoice.request.tracking)}`
    : `Référence facture ${escapeHtml(invNum)}`;

  const bodyHtml = `
    <header class="header-band">
      <div class="brand">
        <div style="background:#ffffff;border-radius:10px;padding:6px 12px;display:inline-flex;align-items:center;">
          <img src="${window.location.origin}/assets/benilink-logo.png" alt="BeniLink" style="height:28px;width:auto;display:block;object-fit:contain;" />
        </div>
        <div class="brand-tag">Trust Hub Diaspora · Services de confiance au Bénin</div>
      </div>
      <div class="doc-meta-top">
        <div class="doc-kicker">${docKicker}</div>
        <div class="doc-number">${escapeHtml(invNum)}</div>
        <div class="doc-date">
          ${isPaid && invoice.paidAt
            ? `Payée le ${escapeHtml(formatDateFr(invoice.paidAt))}`
            : `Émise le ${escapeHtml(formatDateFr(invoice.createdAt))}`}
        </div>
      </div>
    </header>

    ${isPaid ? `
    <section class="receipt-banner">
      <div class="receipt-banner-left">
        <div class="receipt-check">✓</div>
        <div>
          <div class="receipt-banner-title">Paiement confirmé — Reçu officiel</div>
          <div class="receipt-banner-sub">Réglé par ${escapeHtml(methodLabel)}${invoice.paidAt ? ` le ${escapeHtml(formatDateFr(invoice.paidAt))}` : ''}</div>
        </div>
      </div>
      <div class="receipt-banner-amount">
        <small>Montant acquitté</small>
        <strong>${escapeHtml(amountText)}</strong>
      </div>
    </section>
    ` : ''}

    <section class="parties">
      <div class="party-card">
        <div class="party-label">Émetteur</div>
        <div class="party-title">BeniLink Services</div>
        <div class="party-sub">
          Haie Vive, Cotonou — République du Bénin<br />
          contact@benilink.bj · Plateforme vérifiée
        </div>
      </div>
      <div class="party-card">
        <div class="party-label">Facturé à</div>
        <div class="party-title">${escapeHtml(clientName || 'Client BeniLink')}</div>
        <div class="party-sub">
          ${clientEmail ? `${escapeHtml(clientEmail)}<br />` : ''}
          ${clientCountry ? `${escapeHtml(clientCountry)}` : 'Client Diaspora'}
        </div>
      </div>
    </section>

    <dl class="meta-strip">
      <div class="meta-item">
        <dt>Statut</dt>
        <dd><span class="pill ${statusInfo.cls}">${escapeHtml(statusInfo.label)}</span></dd>
      </div>
      <div class="meta-item">
        <dt>Date d'émission</dt>
        <dd>${escapeHtml(formatShortDateFr(invoice.createdAt))}</dd>
      </div>
      <div class="meta-item">
        <dt>${invoice.paidAt ? 'Réglée le' : 'Échéance'}</dt>
        <dd>${invoice.paidAt ? escapeHtml(formatShortDateFr(invoice.paidAt)) : 'À réception'}</dd>
      </div>
      <div class="meta-item">
        <dt>Moyen de paiement</dt>
        <dd>${escapeHtml(methodLabel)}</dd>
      </div>
    </dl>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Désignation de la prestation</th>
            <th>Référence</th>
            <th class="num">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="item-title">${escapeHtml(invoice.label)}</div>
              <div class="item-sub">${missionLine}</div>
            </td>
            <td>${escapeHtml(invoice.request?.tracking || invNum)}</td>
            <td class="num"><strong>${escapeHtml(amountText)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <section class="summary-row">
      <div class="note-box">
        <strong>Informations &amp; sécurité</strong>
        ${invoice.status === 'paid'
          ? 'Règlement confirmé. Ce justificatif vaut reçu de paiement pour votre dossier BeniLink.'
          : invoice.status === 'due'
            ? 'Facture en attente de règlement. Réglez directement depuis votre espace client BeniLink (Carte, Mobile Money ou Wise).'
            : invoice.status === 'refunded'
              ? 'Cette facture a fait l\'objet d\'un remboursement intégral vers votre moyen de paiement.'
              : 'Cette facture a été annulée et ne donne lieu à aucun prélèvement.'}
        ${invoice.status === 'paid' ? '<div><span class="stamp">Acquittée</span></div>' : ''}
      </div>
      <div class="totals-box">
        <div class="totals-line">
          <span>Sous-total prestation</span>
          <span>${escapeHtml(amountText)}</span>
        </div>
        <div class="totals-line">
          <span>Frais de dossier</span>
          <span>Inclus</span>
        </div>
        <div class="totals-grand">
          <span>Total TTC</span>
          <strong>${escapeHtml(amountText)}</strong>
        </div>
      </div>
    </section>

    <footer class="footer">
      <span><strong>BeniLink Services</strong> · Trust Hub Diaspora · Cotonou, Bénin.</span>
      <span>Document généré automatiquement · Aucune donnée bancaire stockée.</span>
    </footer>
  `;

  return openPrintWindow(docTitle, bodyHtml, extraCss);
};

export interface PrintRequestsOptions {
  requests: RequestItem[];
  clientName: string;
  filterLabel?: string;
  searchQuery?: string;
}

const REQUEST_STATUS_MAP: Record<RequestStatus, { label: string; cls: string }> = {
  pending: { label: 'En attente', cls: 'pill-due' },
  active: { label: 'En cours', cls: 'pill-paid' },
  done: { label: 'Terminée', cls: 'pill-neutral' },
  cancelled: { label: 'Annulée', cls: 'pill-cancelled' },
};

export const printRequestsPdf = ({
  requests,
  clientName,
  filterLabel = 'Toutes',
  searchQuery,
}: PrintRequestsOptions): boolean => {
  const generatedAt = formatDateFr(new Date().toISOString());
  const counts = requests.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    { pending: 0, active: 0, done: 0, cancelled: 0 } as Record<RequestStatus, number>
  );

  const extraCss = `
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 18px;
    }
    .kpi-box {
      border: 1px solid #dde4df;
      border-radius: 10px;
      padding: 11px 13px;
      background: #f9faf8;
    }
    .kpi-label {
      font-size: 10.5px;
      color: #5f6f64;
      font-weight: 600;
    }
    .kpi-value {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 20px;
      font-weight: 700;
      color: #006191;
      margin-top: 2px;
    }
    .filter-bar {
      margin-top: 14px;
      font-size: 12px;
      color: #4c657a;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }
    .table-wrap {
      margin-top: 14px;
      border: 1px solid #d0e3f5;
      border-radius: 10px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead th {
      background: #edf4ff;
      color: #006191;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      text-align: left;
      padding: 10px 11px;
      border-bottom: 1px solid #d0e3f5;
    }
    tbody td {
      padding: 10px 11px;
      border-bottom: 1px solid #e3efff;
      font-size: 12px;
      vertical-align: top;
    }
    tbody tr:nth-child(even) {
      background: #f7f9ff;
    }
    tbody tr:last-child td {
      border-bottom: none;
    }
    tbody tr {
      break-inside: avoid;
    }
    .req-title {
      font-weight: 700;
      color: #16241a;
    }
    .req-sub {
      font-size: 11px;
      color: #5f6f64;
      margin-top: 2px;
    }
    .urgent-tag {
      display: inline-block;
      margin-top: 3px;
      font-size: 10px;
      font-weight: 700;
      color: #991b1b;
    }
    .empty-msg {
      padding: 28px;
      text-align: center;
      color: #5f6f64;
    }
  `;

  const rowsHtml = requests.length
    ? requests
        .map((r) => {
          const st = REQUEST_STATUS_MAP[r.status] ?? { label: r.status, cls: 'pill-neutral' };
          const serviceName = r.serviceName || r.service?.name || 'Service BeniLink';
          const amountDisplay = r.quote ? formatCurrency(r.quote.amount) : r.budget || 'Sur devis';
          return `
            <tr>
              <td><strong>${escapeHtml(r.tracking)}</strong></td>
              <td>
                <div class="req-title">${escapeHtml(r.title)}</div>
                <div class="req-sub">${escapeHtml(serviceName)}</div>
                ${r.urgency === 'urgent' ? '<div class="urgent-tag">⚡ Priorité urgente</div>' : ''}
              </td>
              <td>${escapeHtml(r.city || '–')}</td>
              <td>${escapeHtml(formatShortDateFr(r.createdAt))}</td>
              <td><span class="pill ${st.cls}">${escapeHtml(st.label)}</span></td>
              <td><strong>${escapeHtml(amountDisplay)}</strong></td>
            </tr>
          `;
        })
        .join('')
    : `<tr><td colspan="6" class="empty-msg">Aucune demande ne correspond aux critères sélectionnés.</td></tr>`;

  const bodyHtml = `
    <header class="header-band">
      <div class="brand">
        <div style="background:#ffffff;border-radius:10px;padding:6px 12px;display:inline-flex;align-items:center;">
          <img src="${window.location.origin}/assets/benilink-logo.png" alt="BeniLink" style="height:28px;width:auto;display:block;object-fit:contain;" />
        </div>
        <div class="brand-tag">Trust Hub Diaspora · Services de confiance au Bénin</div>
      </div>
      <div class="doc-meta-top">
        <div class="doc-kicker">Relevé de demandes</div>
        <div class="doc-number">${escapeHtml(clientName || 'Client BeniLink')}</div>
        <div class="doc-date">Exporté le ${escapeHtml(generatedAt)}</div>
      </div>
    </header>

    <section class="kpi-grid">
      <div class="kpi-box">
        <div class="kpi-label">Demandes exportées</div>
        <div class="kpi-value">${requests.length}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">En attente</div>
        <div class="kpi-value">${counts.pending}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">En cours</div>
        <div class="kpi-value">${counts.active}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Terminées</div>
        <div class="kpi-value">${counts.done}</div>
      </div>
    </section>

    <div class="filter-bar">
      <span><strong>Filtre appliqué :</strong> ${escapeHtml(filterLabel)}</span>
      ${searchQuery ? `<span><strong>Recherche :</strong> « ${escapeHtml(searchQuery)} »</span>` : ''}
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Référence</th>
            <th>Demande &amp; Service</th>
            <th>Ville</th>
            <th>Date</th>
            <th>Statut</th>
            <th>Budget / Devis</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>

    <footer class="footer">
      <span><strong>BeniLink Services</strong> · Cotonou, Bénin · contact@benilink.bj</span>
      <span>Relevé personnel — Espace client BeniLink</span>
    </footer>
  `;

  return openPrintWindow('Relevé de mes demandes — BeniLink', bodyHtml, extraCss);
};

