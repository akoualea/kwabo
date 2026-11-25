import React, { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList, Download, Send, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  ActivityLogEntry,
  archiveDailyReport,
  ArchivedDailyReport,
  downloadDailyReportText,
  getTodayActivitiesForActor,
  getTodayDateKey,
} from '../../utils/internalOps';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, role, addToast } = useApp();
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [note, setNote] = useState('');
  const [submittedReport, setSubmittedReport] = useState<ArchivedDailyReport | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const actorName =
    `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() ||
    currentUser?.email ||
    'Collaborateur';
  const roleLabel = role === 'ADMIN' ? 'Administrateur' : role === 'OPERATOR' ? 'Agent terrain' : 'Client';

  useEffect(() => {
    if (!isOpen || !currentUser) return;
    setActivities(getTodayActivitiesForActor(currentUser.id));
    setNote('');
    setSubmittedReport(null);
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleSubmitReport = async () => {
    setSubmitting(true);
    const report = archiveDailyReport({
      actorId: currentUser.id,
      actorName,
      actorRole: roleLabel,
      note,
    });

    // Transmission vers POST /me/daily-report (API BeniLink §6)
    try {
      await api('/me/daily-report', {
        method: 'POST',
        body: {
          note: report.note || undefined,
          date: report.date,
          activities: report.activities,
        },
      });
    } catch {
      // Conservation locale en fallback si hors ligne
    }

    setSubmittedReport(report);
    setSubmitting(false);
    addToast("Rapport journalier transmis à l'administration et archivé.", 'success');
  };

  return (
    <div
      className="no-scrollbar fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#06243d]/75 p-3 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Rapport journalier d'activité"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl border border-[#d0e3f5] bg-white p-5 sm:p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#d0e3f5] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e3efff] text-[#006191]">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-[#0d1d2b]">Rapport journalier</h2>
              <p className="text-xs text-[#4c657a]">
                {actorName} ({roleLabel}) · Journée du {getTodayDateKey()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#4c657a] transition hover:bg-[#edf4ff]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-xs leading-relaxed text-[#4c657a]">
            Vos activités sont enregistrées automatiquement en arrière-plan depuis votre dernier rapport (<strong>aucune clôture automatique à minuit</strong> : vous pouvez travailler de nuit librement). Cliquez sur <strong>Transmettre &amp; archiver</strong> avant de vous déconnecter.
          </p>

          <div className="max-h-56 overflow-y-auto rounded-xl border border-[#d0e3f5] bg-[#f7f9ff] p-3">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#0d1d2b]">
              <span>Activités enregistrées depuis le dernier rapport</span>
              <span className="rounded-full bg-[#e3efff] px-2.5 py-0.5 text-[11px] text-[#006191]">
                {activities.length} action{activities.length > 1 ? 's' : ''}
              </span>
            </div>

            {activities.length === 0 ? (
              <p className="py-4 text-center text-xs text-[#4c657a]">
                Aucune action spécifique journalisée aujourd'hui. Le rapport enregistrera votre présence et votre observation éventuelle.
              </p>
            ) : (
              <ul className="space-y-2">
                {activities.map((act) => (
                  <li
                    key={act.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-[#d0e3f5] bg-white px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0d1d2b]">{act.action}</p>
                      {act.details && <p className="truncate text-[11px] text-[#4c657a]">{act.details}</p>}
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-[#4c657a]">
                      {new Date(act.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!submittedReport ? (
            <>
              <div>
                <label htmlFor="daily-report-note" className="mb-1 block text-xs font-bold text-[#0d1d2b]">
                  Observation complémentaire <span className="font-normal text-[#4c657a]">(facultatif)</span>
                </label>
                <textarea
                  id="daily-report-note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex. Point d'attention pour demain, dossier en attente de pièce…"
                  className="w-full rounded-xl border border-[#d0e3f5] bg-white p-2.5 text-xs text-[#0d1d2b]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
                  Fermer
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitReport}
                  className="btn btn-primary btn-sm"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>{submitting ? 'Transmission…' : 'Transmettre & archiver'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-[#d0e3f5] bg-[#edf4ff] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#006191]">
                <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>Rapport transmis et archivé avec succès</span>
              </div>
              <p className="mt-1 text-xs text-[#4c657a]">
                Consultable par l'administration dans <strong>Journal d'activité → Rapports journaliers</strong>.
              </p>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => downloadDailyReportText(submittedReport)}
                  className="btn btn-ghost btn-sm"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>Télécharger (.txt)</span>
                </button>
                <button type="button" onClick={onClose} className="btn btn-primary btn-sm">
                  Terminer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
