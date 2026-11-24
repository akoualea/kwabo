import { formatConvertedMoney, getUserCurrency } from '../data/worldCountries';

/* =========================================================
   1. Service Turnaround / SLA Management (§9)
   ========================================================= */

const SLA_STORAGE_KEY = 'benilink_service_sla_v1';
const CONTRACTS_STORAGE_KEY = 'benilink_contracts_v1';

const DEFAULT_SLA_DAYS: Record<string, number> = {
  'suivi-chantier': 3,
  'verification-fonciere': 7,
  'gestion-locative': 5,
  'sante-proches': 2,
  'frais-scolaires': 2,
  'courses-famille': 2,
  'actes-anip': 5,
  'demarches-notariales': 10,
  'creation-entreprise': 7,
  'livraison-locale': 2,
  'dedouanement-colis': 5,
  'evenements-ceremonies': 7,
};

const DEFAULT_SLA_BY_CAT: Record<string, number> = {
  immobilier: 5,
  famille: 2,
  demarches: 6,
  logistique: 3,
};

function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage error
  }
}

export function getServiceSlaDays(slugOrId?: string, category?: string): number {
  const overrides = readStore<Record<string, number>>(SLA_STORAGE_KEY, {});
  if (slugOrId && overrides[slugOrId]) return overrides[slugOrId];
  if (slugOrId && DEFAULT_SLA_DAYS[slugOrId]) return DEFAULT_SLA_DAYS[slugOrId];
  if (category && DEFAULT_SLA_BY_CAT[category]) return DEFAULT_SLA_BY_CAT[category];
  return 5;
}

export function setServiceSlaDays(slugOrId: string, days: number): void {
  const safeDays = Math.max(1, Math.min(90, Math.round(days)));
  const overrides = readStore<Record<string, number>>(SLA_STORAGE_KEY, {});
  overrides[slugOrId] = safeDays;
  writeStore(SLA_STORAGE_KEY, overrides);
}

export function formatSlaLabel(days: number): string {
  if (days <= 1) return '24h ouvrées';
  if (days === 2) return '48h ouvrées';
  return `${days} jours ouvrés`;
}

export function computeSlaProgress(createdAtIso: string, estimatedDays: number, status: string) {
  const created = new Date(createdAtIso);
  const target = new Date(created.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const totalMs = Math.max(1, target.getTime() - created.getTime());
  const elapsedMs = Math.max(0, now.getTime() - created.getTime());
  const percent = status === 'done' ? 100 : Math.min(100, Math.round((elapsedMs / totalMs) * 100));
  const daysRemaining = Math.ceil((target.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  const isLate = status !== 'done' && status !== 'cancelled' && daysRemaining < 0;

  return {
    targetDate: target.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    percent,
    daysRemaining,
    isLate,
  };
}

/* =========================================================
   2. Contract Generation & Gmail Copy (§8)
   ========================================================= */

export interface AcceptedContract {
  id: string;
  requestId: string;
  tracking: string;
  serviceTitle: string;
  city: string;
  clientName: string;
  clientEmail: string;
  amountEur: number;
  currency: string;
  formattedAmount: string;
  slaLabel: string;
  acceptedAt: string;
}

export function getContractForRequest(requestId: string): AcceptedContract | null {
  const map = readStore<Record<string, AcceptedContract>>(CONTRACTS_STORAGE_KEY, {});
  return map[requestId] || null;
}

export function acceptAndGenerateContract(params: {
  requestId: string;
  tracking: string;
  serviceTitle: string;
  city: string;
  clientName: string;
  clientEmail: string;
  amountEur: number;
  slaDays: number;
}): AcceptedContract {
  const currency = getUserCurrency();
  const contract: AcceptedContract = {
    id: `CTR-${params.tracking || params.requestId}-${Date.now().toString().slice(-4)}`,
    requestId: params.requestId,
    tracking: params.tracking,
    serviceTitle: params.serviceTitle,
    city: params.city,
    clientName: params.clientName,
    clientEmail: params.clientEmail,
    amountEur: params.amountEur,
    currency,
    formattedAmount: formatConvertedMoney(params.amountEur, currency),
    slaLabel: formatSlaLabel(params.slaDays),
    acceptedAt: new Date().toISOString(),
  };

  const map = readStore<Record<string, AcceptedContract>>(CONTRACTS_STORAGE_KEY, {});
  map[params.requestId] = contract;
  writeStore(CONTRACTS_STORAGE_KEY, map);
  return contract;
}

export function openPrintableContract(contract: AcceptedContract): void {
  const acceptedDate = new Date(contract.acceptedAt).toLocaleString('fr-FR');
  const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Contrat BeniLink — ${contract.id}</title>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; color: #0d1d2b; margin: 40px; line-height: 1.6; }
    .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #006191; padding-bottom: 16px; margin-bottom: 24px; }
    h1 { color: #006191; font-size: 22px; margin: 0; }
    .meta { font-size: 13px; color: #4c657a; }
    .box { background: #f7f9ff; border: 1px solid #d0e3f5; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px; }
    .sig { margin-top: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .sig-box { border: 1px dashed #006191; border-radius: 10px; padding: 14px; font-size: 13px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="head">
    <div>
      <h1>CONTRAT DE PRESTATION DE SERVICES — BENILINK</h1>
      <div class="meta">Référence contrat : <strong>${contract.id}</strong> · Dossier : <strong>${contract.tracking}</strong></div>
    </div>
    <button class="no-print" onclick="window.print()" style="background:#006191;color:#fff;border:0;padding:10px 18px;border-radius:999px;font-weight:700;cursor:pointer;">Imprimer / PDF</button>
  </div>

  <div class="box">
    <div class="grid">
      <div><strong>Prestataire :</strong> BeniLink Global (Cotonou, Bénin — contact@benilink.bj)</div>
      <div><strong>Client :</strong> ${contract.clientName} (${contract.clientEmail})</div>
      <div><strong>Prestation :</strong> ${contract.serviceTitle}</div>
      <div><strong>Commune d'intervention :</strong> ${contract.city}</div>
      <div><strong>Montant convenu :</strong> ${contract.formattedAmount} (${contract.amountEur} € réf.)</div>
      <div><strong>Délai annoncé :</strong> ${contract.slaLabel}</div>
    </div>
  </div>

  <h3>Engagements contractuels</h3>
  <ol>
    <li><strong>Exécution &amp; Preuves :</strong> BeniLink s'engage à exécuter la prestation dans le délai annoncé (${contract.slaLabel}) avec preuves horodatées (photos, vidéos 360° et reçus scannés).</li>
    <li><strong>Confidentialité &amp; Communication :</strong> L'ensemble des échanges est piloté exclusivement par l'Administration centrale BeniLink. Aucune transaction hors plateforme n'est autorisée.</li>
    <li><strong>Acceptation électronique :</strong> Le présent contrat a été accepté électroniquement par le client le ${acceptedDate}. Une copie est conservée par le client et par l'administration BeniLink.</li>
  </ol>

  <div class="sig">
    <div class="sig-box">
      <strong>Pour le Client</strong><br/>
      ${contract.clientName}<br/>
      Accepté électroniquement le ${acceptedDate}
    </div>
    <div class="sig-box">
      <strong>Pour BeniLink Global</strong><br/>
      Administration Centrale — Cotonou, Bénin<br/>
      contact@benilink.bj
    </div>
  </div>
</body>
</html>`;

  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
  }
}

export function openGmailContractCopy(contract: AcceptedContract): void {
  const adminEmail = 'contact@benilink.bj';
  const to = [contract.clientEmail, adminEmail].filter(Boolean).join(',');
  const subject = `[BeniLink] Contrat de prestation ${contract.id} — ${contract.serviceTitle}`;
  const body = [
    `Bonjour ${contract.clientName},`,
    ``,
    `Suite à votre acceptation du devis, voici la copie récapitulative de votre contrat BeniLink (copie transmise au client et à l'administration) :`,
    ``,
    `- Référence contrat : ${contract.id}`,
    `- Dossier : ${contract.tracking}`,
    `- Prestation : ${contract.serviceTitle}`,
    `- Commune : ${contract.city}`,
    `- Montant convenu : ${contract.formattedAmount} (${contract.amountEur} € réf.)`,
    `- Délai de réalisation annoncé : ${contract.slaLabel}`,
    `- Date d'acceptation : ${new Date(contract.acceptedAt).toLocaleString('fr-FR')}`,
    ``,
    `Cordialement,`,
    `L'Administration Centrale BeniLink — ${adminEmail}`,
  ].join('\n');

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(gmailUrl, '_blank', 'noopener,noreferrer');
}
