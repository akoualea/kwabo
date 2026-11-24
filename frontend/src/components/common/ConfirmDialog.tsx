import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ConfirmDialog: React.FC = () => {
  const { confirmState, resolveConfirm } = useApp();

  useEffect(() => {
    if (!confirmState) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resolveConfirm(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmState, resolveConfirm]);

  if (!confirmState) return null;

  const variant = confirmState.variant ?? 'danger';
  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  const iconBg = isDanger
    ? 'bg-[#ffdad6] text-[#93000a]'
    : isWarning
      ? 'bg-[#ffdf93] text-[#765b00]'
      : 'bg-[#e3efff] text-[#006191]';

  const confirmBtnStyle = isDanger
    ? 'bg-[#ba1a1a] hover:bg-[#93000a] text-white shadow-sm'
    : isWarning
      ? 'bg-[#f7c531] hover:bg-[#e0a410] text-[#10202e] shadow-sm'
      : 'bg-[#006191] hover:bg-[#084d82] text-white shadow-sm';

  return (
    <div
      className="fixed inset-0 z-[2147483646] flex items-center justify-center bg-[#084d82]/45 backdrop-blur-[3px] p-4"
      role="presentation"
      onClick={() => resolveConfirm(false)}
    >
      <style>{`
        @keyframes kwConfirmIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="kw-confirm-title"
        aria-describedby="kw-confirm-desc"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'kwConfirmIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        className="w-full max-w-[440px] rounded-3xl border border-[#d0e3f5] bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
            {isDanger || isWarning ? (
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            ) : (
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2
                id="kw-confirm-title"
                className="font-display text-lg font-semibold leading-snug text-[#1a1f1b]"
              >
                {confirmState.title}
              </h2>
              <button
                type="button"
                onClick={() => resolveConfirm(false)}
                aria-label="Fermer"
                className="rounded-lg p-1 text-[#56635b] transition hover:bg-[#eef1ef] hover:text-[#1a1f1b]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p
              id="kw-confirm-desc"
              className="mt-2 text-sm leading-relaxed text-[#56635b]"
            >
              {confirmState.message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap-reverse items-center justify-end gap-2.5">
          <button
            type="button"
            autoFocus
            onClick={() => resolveConfirm(false)}
            className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-[#d0e3f5] bg-white px-5 text-sm font-semibold text-[#3f4850] transition hover:border-[#006191] hover:bg-[#edf4ff] hover:text-[#006191]"
          >
            {confirmState.cancelLabel || 'Annuler'}
          </button>
          <button
            type="button"
            onClick={() => resolveConfirm(true)}
            className={`inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full px-5 text-sm font-semibold transition ${confirmBtnStyle}`}
          >
            {!isDanger && !isWarning && <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
            <span>{confirmState.confirmLabel || 'Confirmer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

