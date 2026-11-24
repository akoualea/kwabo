import React from 'react';
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  Printer,
  CreditCard,
  Smartphone,
  Landmark,
  ShieldCheck,
  Calendar,
  Hash,
  User as UserIcon,
  FileText,
  X,
} from 'lucide-react';
import type { InvoiceItem } from '../../types';
import { PAYMENT_METHODS } from '../../data/kwaboData';

interface InvoiceReceiptDrawerProps {
  invoice: InvoiceItem | null;
  clientName: string;
  clientEmail?: string | null;
  clientCountry?: string | null;
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onPrint: (invoice: InvoiceItem) => void;
  onPay?: (invoice: InvoiceItem) => void;
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDateLong = (iso?: string | null) => {
  if (!iso) return '–';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '–';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getMethodIcon = (method?: string | null) => {
  if (method === 'momo') return Smartphone;
  if (method === 'wise') return Landmark;
  return CreditCard;
};

export const InvoiceReceiptDrawer: React.FC<InvoiceReceiptDrawerProps> = ({
  invoice,
  clientName,
  clientEmail,
  clientCountry,
  closeButtonRef,
  onClose,
  onPrint,
  onPay,
}) => {
  const open = invoice !== null;

  const statusConfig = {
    paid: {
      kicker: 'Reçu de paiement',
      badge: 'Paiement confirmé',
      badgeCls: 'bg-[#e3efff] text-[#006191] border-[#9fcaff]',
      amountLabel: 'Montant réglé TTC',
      amountBoxCls: 'bg-gradient-to-br from-[#f7f9ff] to-[#e3efff] border-[#d0e3f5]',
      amountTextCls: 'text-[#006191]',
      Icon: CheckCircle2,
    },
    due: {
      kicker: 'Facture à régler',
      badge: 'En attente de règlement',
      badgeCls: 'bg-[#ffdf93] text-[#765b00] border-[#f2c02c]',
      amountLabel: 'Montant à payer TTC',
      amountBoxCls: 'bg-gradient-to-br from-[#fffdf5] to-[#ffdf93]/40 border-[#f2c02c]',
      amountTextCls: 'text-[#765b00]',
      Icon: Clock,
    },
    refunded: {
      kicker: 'Reçu de remboursement',
      badge: 'Remboursée',
      badgeCls: 'bg-[#d1e4ff] text-[#004b71] border-[#8fcdff]',
      amountLabel: 'Montant remboursé TTC',
      amountBoxCls: 'bg-gradient-to-br from-[#f7f9ff] to-[#d1e4ff] border-[#8fcdff]',
      amountTextCls: 'text-[#004b71]',
      Icon: RotateCcw,
    },
    cancelled: {
      kicker: 'Facture annulée',
      badge: 'Annulée',
      badgeCls: 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]/30',
      amountLabel: 'Montant annulé',
      amountBoxCls: 'bg-[#f7f9ff] border-[#d0e3f5]',
      amountTextCls: 'text-[#4c657a]',
      Icon: XCircle,
    },
  } as const;

  return (
    <>
      <div
        className={`drawer-overlay${open ? ' open' : ''}`}
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        className={`drawer${open ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={invoice ? `Reçu ${invoice.number || invoice.id}` : 'Détail du reçu'}
      >
        {invoice && (() => {
          const cfg = statusConfig[invoice.status] ?? statusConfig.due;
          const StatusIcon = cfg.Icon;
          const MethodIcon = getMethodIcon(invoice.method);
          const invNum = invoice.number || invoice.id;
          const methodLabel = invoice.method ? PAYMENT_METHODS[invoice.method]?.label ?? invoice.method : '–';
          const isPaid = invoice.status === 'paid';

          return (
            <div className="flex min-h-full flex-col bg-[#f7f9ff]">
              {/* Header band */}
              <div className="relative bg-gradient-to-br from-[#084d82] to-[#006191] px-6 pb-6 pt-5 text-white border-b-4 border-[#f7c531]">
                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label="Fermer"
                  onClick={onClose}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/90 transition hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white px-2.5 py-1.5 shadow-sm">
                    <img
                      src="/assets/benilink-logo.png"
                      alt="BeniLink"
                      className="h-7 w-auto object-contain"
                    />
                  </div>
                  <div className="text-[11px] text-[#cbe6ff]">
                    Trust Hub Diaspora · Cotonou
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ffdf93]">
                      {cfg.kicker}
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-white">
                      {invNum}
                    </h2>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${cfg.badgeCls}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    <span>{cfg.badge}</span>
                  </span>
                </div>
              </div>

              {/* Body receipt sheet */}
              <div className="flex-1 space-y-4 p-5">
                {/* Highlighted Amount Receipt Card */}
                <div className={`rounded-2xl border p-4 shadow-sm ${cfg.amountBoxCls}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#4c657a]">
                        {cfg.amountLabel}
                      </p>
                      <p className={`mt-1 font-display text-3xl font-bold tracking-tight tnum ${cfg.amountTextCls}`}>
                        {formatMoney(invoice.amount)}
                      </p>
                    </div>
                    {isPaid && (
                      <span className="rounded-lg border-2 border-[#006191] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#006191]">
                        Acquitté
                      </span>
                    )}
                  </div>
                  {isPaid && invoice.paidAt && (
                    <p className="mt-2.5 border-t border-[#d0e3f5] pt-2 text-xs font-medium text-[#006191]">
                      Règlement validé le {formatDateLong(invoice.paidAt)} via {methodLabel}
                    </p>
                  )}
                </div>

                {/* Perforated-style Details Card */}
                <div className="rounded-2xl border border-[#d0e3f5] bg-white p-4 shadow-sm space-y-3.5">
                  <div className="border-b border-dashed border-[#d0e3f5] pb-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#4c657a]">
                      <FileText className="h-3.5 w-3.5 text-[#006191]" />
                      <span>Prestation réglée</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-[#0d1d2b]">
                      {invoice.label}
                    </p>
                    {invoice.request && (
                      <p className="mt-0.5 text-xs text-[#4c657a]">
                        Mission : {invoice.request.title} ({invoice.request.tracking})
                      </p>
                    )}
                  </div>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
                    <div>
                      <dt className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-[#4c657a]">
                        <UserIcon className="h-3 w-3" /> Client
                      </dt>
                      <dd className="mt-0.5 font-semibold text-[#0d1d2b]">{clientName}</dd>
                      {(clientEmail || clientCountry) && (
                        <dd className="mt-0.5 text-[11px] text-[#4c657a] break-all">
                          {clientEmail || clientCountry}
                        </dd>
                      )}
                    </div>

                    <div>
                      <dt className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-[#4c657a]">
                        <Hash className="h-3 w-3" /> Référence
                      </dt>
                      <dd className="mt-0.5 font-semibold text-[#0d1d2b]">
                        {invoice.request?.tracking || invNum}
                      </dd>
                    </div>

                    <div>
                      <dt className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-[#4c657a]">
                        <Calendar className="h-3 w-3" /> Date d'émission
                      </dt>
                      <dd className="mt-0.5 font-semibold text-[#0d1d2b]">
                        {formatDateLong(invoice.createdAt)}
                      </dd>
                    </div>

                    <div>
                      <dt className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-[#4c657a]">
                        <MethodIcon className="h-3 w-3" /> Moyen
                      </dt>
                      <dd className="mt-0.5 font-semibold text-[#0d1d2b]">{methodLabel}</dd>
                    </div>
                  </dl>
                </div>

                {/* Security / Official Notice */}
                <div className="flex items-start gap-2.5 rounded-2xl border border-[#d0e3f5] bg-white/90 p-3.5 text-xs text-[#4c657a]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#006191]" />
                  <p className="leading-relaxed">
                    {isPaid
                      ? 'Justificatif officiel BeniLink Services. Ce reçu atteste du règlement complet de la prestation.'
                      : 'Document généré par BeniLink Services. Aucune donnée bancaire n’est conservée sur la plateforme.'}
                  </p>
                </div>
              </div>

              {/* Sticky Footer Actions */}
              <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2.5 border-t border-[#d0e3f5] bg-white px-5 py-3.5">
                {invoice.status === 'due' && onPay && (
                  <button
                    type="button"
                    onClick={() => onPay(invoice)}
                    className="btn btn-gold btn-sm mr-auto"
                  >
                    Régler maintenant
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onPrint(invoice)}
                  className="btn btn-ghost btn-sm"
                >
                  <Printer className="h-4 w-4" />
                  <span>{isPaid ? 'Télécharger le reçu PDF' : 'Imprimer ou PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-primary btn-sm"
                >
                  Fermer
                </button>
              </div>
            </div>
          );
        })()}
      </aside>
    </>
  );
};

