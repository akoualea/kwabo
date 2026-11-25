import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, ClipboardList, Download, FileText, User as UserIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api, ApiError } from '../../services/api';
import { mapAudit } from '../../services/mappers';
import { AuditItem } from '../../types';
import { Icon } from '../common/Icon';
import {
  ArchivedDailyReport,
  downloadCsvFile,
  downloadDailyReportText,
  getArchivedDailyReports,
  subscribeInternalOps,
} from '../../utils/internalOps';

export const AdminAudit: React.FC = () => {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'logs' | 'reports'>('logs');

  // Activity logs state
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Daily reports archive state
  const [dailyReports, setDailyReports] = useState<ArchivedDailyReport[]>([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterActor, setFilterActor] = useState('all');

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 250);
    return () => window.clearTimeout(t);
  }, [query]);

  const loadAudit = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<any>('/admin/audit', {
        params: {
          q: debouncedQuery || undefined,
          page,
          per_page: 50,
        },
      });
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const mapped = rawList.map(mapAudit);
      setAuditLogs(mapped);
      setLastPage(Number(res?.meta?.last_page ?? 1));
      setTotal(Number(res?.meta?.total ?? mapped.length));
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : "Impossible de charger le journal d'audit.", 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page, addToast]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  useEffect(() => {
    const syncReports = () => setDailyReports(getArchivedDailyReports());
    syncReports();
    const unsub = subscribeInternalOps(syncReports);

    let cancelled = false;
    api<any>('/admin/daily-reports')
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (list.length > 0) {
          const mapped: ArchivedDailyReport[] = list.map((r: any) => ({
            id: String(r.id),
            date: r.date || (r.created_at ? String(r.created_at).slice(0, 10) : ''),
            actorId: String(r.user_id ?? r.author?.id ?? r.actor_id ?? r.id),
            actorName:
              r.author?.full_name ||
              r.actor_name ||
              `${r.author?.first_name ?? ''} ${r.author?.last_name ?? ''}`.trim() ||
              'Collaborateur',
            actorRole: r.author?.role || r.actor_role || 'Équipe',
            submittedAt: r.submitted_at || r.created_at || new Date().toISOString(),
            activityCount: Number(r.actions_count ?? r.activity_count ?? (Array.isArray(r.activities) ? r.activities.length : 0)),
            note: r.note || '',
            activities: Array.isArray(r.activities) ? r.activities : [],
          }));
          setDailyReports(mapped);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const actorOptions = useMemo(() => {
    const unique = new Map<string, string>();
    dailyReports.forEach((r) => unique.set(r.actorId, `${r.actorName} (${r.actorRole})`));
    return Array.from(unique.entries());
  }, [dailyReports]);

  const filteredReports = useMemo(() => {
    return dailyReports.filter((r) => {
      const matchDate = !filterDate || r.date === filterDate;
      const matchActor = filterActor === 'all' || r.actorId === filterActor;
      return matchDate && matchActor;
    });
  }, [dailyReports, filterDate, filterActor]);

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleExportAuditCsv = () => {
    if (auditLogs.length === 0) {
      addToast('Aucune entrée à exporter.', 'info');
      return;
    }
    const rows = auditLogs.map((log) => [
      new Date(log.at).toLocaleString('fr-FR'),
      log.actor,
      log.text,
    ]);
    downloadCsvFile(
      `journal-activite-benilink-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Date et heure', 'Acteur', 'Action'],
      rows
    );
    addToast("Journal d'activité téléchargé (CSV).", 'success');
  };

  const handleExportReportsCsv = () => {
    if (filteredReports.length === 0) {
      addToast('Aucun rapport journalier à exporter.', 'info');
      return;
    }
    const rows = filteredReports.map((r) => [
      r.date,
      r.actorName,
      r.actorRole,
      String(r.activityCount),
      new Date(r.submittedAt).toLocaleString('fr-FR'),
      r.note || '',
      r.activities.map((a) => `${new Date(a.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} ${a.action}`).join(' | '),
    ]);
    downloadCsvFile(
      `archives-rapports-journaliers-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Date', 'Acteur', 'Rôle', 'Nb actions', 'Transmis le', 'Observation', 'Détail des activités'],
      rows
    );
    addToast('Archives des rapports téléchargées (CSV).', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`btn btn-sm ${activeTab === 'logs' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          <span>Journal d'activité ({total})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`btn btn-sm ${activeTab === 'reports' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          <span>Rapports journaliers &amp; Archives ({dailyReports.length})</span>
        </button>
      </div>

      {activeTab === 'logs' ? (
        <section className="card">
          <div className="card-head flex-wrap gap-2">
            <div>
              <h2>Journal des opérations</h2>
              <span className="muted small-text">{total} entrées enregistrées</span>
            </div>
            <button
              type="button"
              onClick={handleExportAuditCsv}
              className="btn btn-ghost btn-sm"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Télécharger (CSV)</span>
            </button>
          </div>
          <p className="muted mb-4">
            Traçabilité complète des actions : créations de demandes, attributions d'agents, devis émis, documents déposés et règlements.
          </p>

          <div className="search-wrap mb-4">
            <Icon name="magnifying-glass" size={16} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une action, un auteur ou un dossier…"
              aria-label="Filtrer le journal des opérations"
            />
          </div>

          {loading ? (
            <div className="empty">Chargement du journal…</div>
          ) : auditLogs.length === 0 ? (
            <div className="empty">Aucune entrée trouvée.</div>
          ) : (
            <ol className="timeline">
              {auditLogs.map((log) => (
                <li key={log.id}>
                  <strong>{log.text}</strong>
                  <small>
                    {log.actor} · {formatDateTime(log.at)}
                  </small>
                </li>
              ))}
            </ol>
          )}

          {lastPage > 1 && (
            <div className="pager mt-4">
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Précédent
              </button>
              <span className="muted small-text">
                Page {page} / {lastPage}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              >
                Suivant
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="card">
          <div className="card-head flex-wrap gap-2">
            <div>
              <h2>Rapports journaliers &amp; Archives</h2>
              <span className="muted small-text">
                {filteredReports.length} rapport{filteredReports.length > 1 ? 's' : ''} archivé{filteredReports.length > 1 ? 's' : ''}
              </span>
            </div>
            <button
              type="button"
              onClick={handleExportReportsCsv}
              className="btn btn-ghost btn-sm"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Exporter archives (CSV)</span>
            </button>
          </div>
          <p className="muted mb-4 text-xs sm:text-sm">
            Chaque acteur opérationnel clique sur <strong>Rapport journalier</strong> en fin de journée pour transmettre et archiver automatiquement le récapitulatif de ses actions. Filtrez ci-dessous par date ou par acteur.
          </p>

          {/* Filters by Date and Actor */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="archive-date" className="mb-1 flex items-center gap-1.5 text-xs font-semibold muted">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Filtrer par date</span>
              </label>
              <input
                id="archive-date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="archive-actor" className="mb-1 flex items-center gap-1.5 text-xs font-semibold muted">
                <UserIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Filtrer par acteur</span>
              </label>
              <select
                id="archive-actor"
                value={filterActor}
                onChange={(e) => setFilterActor(e.target.value)}
              >
                <option value="all">Tous les acteurs</option>
                {actorOptions.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              {(filterDate || filterActor !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterDate('');
                    setFilterActor('all');
                  }}
                  className="btn btn-ghost btn-sm w-full"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="empty">
              Aucun rapport journalier archivé pour ces critères. Cliquez sur <strong>Rapport journalier</strong> dans le menu latéral pour générer et archiver un premier rapport.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <article
                  key={report.id}
                  className="rounded-2xl border border-[#d0e3f5] bg-[#f7f9ff] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d0e3f5] pb-3">
                    <div>
                      <strong className="text-sm text-[#0d1d2b]">
                        {report.actorName}{' '}
                        <span className="badge badge-neutral ml-1">{report.actorRole}</span>
                      </strong>
                      <p className="mt-0.5 text-xs muted">
                        Journée du <strong>{report.date}</strong> · Transmis le{' '}
                        {new Date(report.submittedAt).toLocaleString('fr-FR')} · {report.activityCount} action
                        {report.activityCount > 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadDailyReportText(report)}
                      className="btn btn-ghost btn-sm"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      <span>Télécharger (.txt)</span>
                    </button>
                  </div>

                  {report.note && (
                    <p className="mt-2.5 rounded-xl border border-[#d0e3f5] bg-white px-3 py-2 text-xs text-[#0d1d2b]">
                      <strong>Observation :</strong> {report.note}
                    </p>
                  )}

                  {report.activities.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {report.activities.map((act) => (
                        <li
                          key={act.id}
                          className="flex items-start justify-between gap-3 rounded-lg border border-[#d0e3f5] bg-white px-3 py-1.5 text-xs"
                        >
                          <span className="text-[#0d1d2b]">
                            {act.action}
                            {act.details ? <span className="muted"> — {act.details}</span> : null}
                          </span>
                          <span className="shrink-0 font-mono text-[11px] muted">
                            {new Date(act.at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
