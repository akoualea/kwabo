import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  Flag,
  PauseCircle,
  PlayCircle,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { formatConvertedMoney, useCurrency } from '../../data/worldCountries';
import {
  BENILINK_ROLE_META,
  generateDefaultInstallments,
  getProvidersAndPartners,
  getRequestWorkflow,
  INTERNAL_STAGE_META,
  InternalStage,
  PAYMENT_MODALITY_LABELS,
  PaymentModality,
  postTeamRoomMessage,
  QuoteLineItem,
  RequestWorkflowState,
  resolveRealBeniLinkRole,
  saveRequestWorkflow,
  subscribeWorkflow,
  TeamOpinion,
} from '../../utils/benilinkWorkflow';
import { recordActivity } from '../../utils/internalOps';

interface Props {
  requestId: string;
  tracking: string;
  serviceName: string;
  city: string;
  status: string;
  docsCount: number;
}

export const RequestWorkflowPanel: React.FC<Props> = ({
  requestId,
  tracking,
  serviceName,
  city,
  status,
  docsCount,
}) => {
  const { role, currentUser, addToast } = useApp();
  const { currency } = useCurrency();
  const isOperator = role === 'OPERATOR';
  const subRole = resolveRealBeniLinkRole(currentUser?.rawRole, role);

  const [wf, setWf] = useState<RequestWorkflowState>(() =>
    getRequestWorkflow(requestId, { tracking, serviceName, city, status })
  );
  const [panelTab, setPanelTab] = useState<'circuit' | 'workorder' | 'quote' | 'validation'>('circuit');

  // New quote line inputs (Super Admin)
  const [lineLabel, setLineLabel] = useState(serviceName);
  const [lineQty, setLineQty] = useState(1);
  const [lineProviderCost, setLineProviderCost] = useState(100);
  const [lineMarginPct, setLineMarginPct] = useState(25);

  // New milestone inputs
  const [msTitle, setMsTitle] = useState('');
  const [msTrigger, setMsTrigger] = useState('50 % d’avancement');

  // Opinion inputs
  const [opinionRole, setOpinionRole] = useState<TeamOpinion['role']>('admin_general');
  const [opinionComment, setOpinionComment] = useState('');

  const providers = getProvidersAndPartners();

  useEffect(() => {
    const sync = () =>
      setWf(getRequestWorkflow(requestId, { tracking, serviceName, city, status }));
    sync();
    return subscribeWorkflow(sync);
  }, [requestId, tracking, serviceName, city, status]);

  const actorName =
    `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() ||
    currentUser?.email ||
    'Collaborateur';

  const commitWorkflow = (next: RequestWorkflowState, logAction?: string) => {
    setWf(next);
    saveRequestWorkflow(next);
    if (logAction && currentUser) {
      recordActivity({
        actorId: currentUser.id,
        actorName,
        actorRole: BENILINK_ROLE_META[subRole]?.label || role,
        action: logAction,
        details: `${tracking} · ${serviceName}`,
      });
    }
  };

  /* =========================================================
     AGENT / LIVREUR VIEW — STRICTLY ZERO CLIENT DATA OR PRICES
     ========================================================= */
  if (isOperator) {
    const handleAgentComplete = () => {
      if (docsCount === 0) {
        addToast(
          'Veuillez joindre au moins une preuve (photo, vidéo ou reçu) dans Documents avant de déclarer la mission terminée.',
          'warning'
        );
        return;
      }
      const next: RequestWorkflowState = {
        ...wf,
        internalStage: 'en_revue',
        progressPct: 100,
        agentCompletedAt: new Date().toISOString(),
      };
      commitWorkflow(next, 'Mission déclarée terminée par l’agent (équipe notifiée)');
      api(`/requests/${requestId}/completion`, { method: 'POST', body: { completed: true } }).catch(() => {});
      postTeamRoomMessage({
        roomId: requestId,
        roomLabel: `Dossier ${tracking} · ${serviceName}`,
        senderName: actorName,
        senderRoleLabel: BENILINK_ROLE_META[subRole]?.label || 'Agent terrain',
        body: `Mission ${wf.workOrder.internalRef} déclarée terminée avec ${docsCount} preuve(s). Merci aux 3 responsables de donner leur avis.`,
      });
      addToast('Mission déclarée terminée : toute l’équipe est prévenue en même temps.', 'success');
    };

    return (
      <section className="card mb-5">
        <div className="card-head flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-[#006191]" aria-hidden="true" />
            <h2>Fiche de travail confidentielle — {wf.workOrder.internalRef}</h2>
          </div>
          <span className="badge badge-green">Avancement : {wf.progressPct}%</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-[#d0e3f5] bg-[#f7f9ff] p-3">
            <span className="block muted">Service</span>
            <strong className="text-[#0d1d2b]">{wf.workOrder.serviceName}</strong>
          </div>
          <div className="rounded-xl border border-[#d0e3f5] bg-[#f7f9ff] p-3">
            <span className="block muted">Lieu d’intervention</span>
            <strong className="text-[#0d1d2b]">{wf.workOrder.location}</strong>
          </div>
          <div className="rounded-xl border border-[#d0e3f5] bg-[#f7f9ff] p-3">
            <span className="block muted">Échéance prévue</span>
            <strong className="text-[#0d1d2b]">{wf.workOrder.dueDate || 'Selon planning'}</strong>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-[#d0e3f5] bg-[#f7f9ff] p-3 text-xs">
          <strong className="block text-[#0d1d2b] mb-1">Instructions du Responsable des prestations</strong>
          <p className="muted">
            {wf.workOrder.instructions ||
              'Exécutez la mission sur place, déposez vos preuves (photos, vidéos, reçus) dans la section Documents ci-dessous, puis cliquez sur « Mission terminée ».'}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs muted">
            Preuves déposées : <strong>{docsCount}</strong> (minimum 1 requise pour clôturer)
          </span>
          {wf.agentCompletedAt ? (
            <span className="badge badge-green">
              Déclarée terminée le {new Date(wf.agentCompletedAt).toLocaleString('fr-FR')}
            </span>
          ) : (
            <button type="button" onClick={handleAgentComplete} className="btn btn-gold btn-sm">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Mission terminée (prévenir l’équipe)</span>
            </button>
          )}
        </div>
      </section>
    );
  }

  /* =========================================================
     ADMIN / RESPONSABLES VIEW — FULL v1.2 CIRCUIT
     ========================================================= */
  const totalProviderCost = wf.quoteLines.reduce((s, l) => s + l.qty * l.providerCost, 0);
  const totalClientPrice = wf.quoteLines.reduce((s, l) => s + l.clientPrice, 0);

  const handleAcknowledge = () => {
    const next: RequestWorkflowState = {
      ...wf,
      internalStage: 'accuse_envoye',
      acknowledgedAt: new Date().toISOString(),
    };
    commitWorkflow(next, 'Accusé de réception envoyé au client');
    api(`/requests/${requestId}/acknowledge`, { method: 'POST' }).catch(() => {});
    addToast('Accusé de réception envoyé au client.', 'success');
  };

  const handleHandoff = () => {
    const next: RequestWorkflowState = {
      ...wf,
      internalStage: 'consultation_prestataires',
      handoffAt: new Date().toISOString(),
    };
    commitWorkflow(next, 'Handoff vers le groupe d’équipe (consultation prestataires)');
    api(`/requests/${requestId}/handoff`, { method: 'POST' }).catch(() => {});
    postTeamRoomMessage({
      roomId: 'general',
      roomLabel: 'Groupe général de l’équipe',
      senderName: actorName,
      senderRoleLabel: 'Super Admin',
      body: `Nouvelle demande ${tracking} (${serviceName} — ${city}). Merci à l’Administrateur général, au Responsable clientèle et au Responsable des prestations de consulter nos prestataires pour le chiffrage.`,
    });
    postTeamRoomMessage({
      roomId: requestId,
      roomLabel: `Dossier ${tracking} · ${serviceName}`,
      senderName: actorName,
      senderRoleLabel: 'Super Admin',
      body: `Fil mission ouvert pour ${tracking} (${serviceName} à ${city}).`,
    });
    addToast('Équipe informée dans le Groupe de discussion (Handoff effectué).', 'success');
  };

  const handleToggleSuspend = () => {
    const isSuspended = wf.internalStage === 'suspendue';
    const next: RequestWorkflowState = {
      ...wf,
      internalStage: isSuspended ? 'en_cours' : 'suspendue',
    };
    commitWorkflow(next, isSuspended ? 'Mission reprise' : 'Mission suspendue (impayé)');
    api(`/requests/${requestId}/${isSuspended ? 'resume' : 'suspend'}`, { method: 'POST' }).catch(() => {});
    addToast(isSuspended ? 'Mission reprise.' : 'Mission suspendue (statut client : En attente de paiement).', 'info');
  };

  const handleAddQuoteLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lineLabel.trim() || lineProviderCost <= 0) return;
    const computedClient = Math.round(lineQty * lineProviderCost * (1 + lineMarginPct / 100));
    const newLine: QuoteLineItem = {
      id: `ql-${Date.now()}`,
      label: lineLabel.trim(),
      qty: Math.max(1, lineQty),
      providerCost: lineProviderCost,
      marginPct: lineMarginPct,
      clientPrice: computedClient,
    };
    const nextLines = [...wf.quoteLines, newLine];
    const nextTotal = nextLines.reduce((s, l) => s + l.clientPrice, 0);
    const next: RequestWorkflowState = {
      ...wf,
      internalStage: 'devis_en_preparation',
      quoteLines: nextLines,
      installments: generateDefaultInstallments(nextTotal, wf.paymentModality),
    };
    commitWorkflow(next, `Ligne ajoutée au devis (${newLine.label})`);
    api(`/admin/requests/${requestId}/quote`, {
      method: 'POST',
      body: {
        currency,
        label: `Devis ${serviceName}`,
        amount: nextTotal,
        items: nextLines.map((l) => ({
          description: l.label,
          quantity: l.qty,
          unit_price: Math.round(l.clientPrice / Math.max(1, l.qty)),
        })),
      },
    }).catch(() => {});
    setLineLabel('');
  };

  const handleChangeModality = (modality: PaymentModality) => {
    const next: RequestWorkflowState = {
      ...wf,
      paymentModality: modality,
      installments: generateDefaultInstallments(totalClientPrice, modality),
    };
    commitWorkflow(next, `Modalité de paiement définie : ${PAYMENT_MODALITY_LABELS[modality]}`);
  };

  const handleSendReminder = (instId: string) => {
    const nextInstallments = wf.installments.map((inst) =>
      inst.id === instId
        ? { ...inst, remindersSent: Math.min(3, inst.remindersSent + 1), status: 'en_retard' as const }
        : inst
    );
    commitWorkflow({ ...wf, installments: nextInstallments }, 'Relance de paiement envoyée au client');
    addToast('Relance de paiement enregistrée.', 'info');
  };

  const handleMarkInstallmentPaid = (instId: string) => {
    const nextInstallments = wf.installments.map((inst) =>
      inst.id === instId
        ? { ...inst, status: 'paye' as const, paidAt: new Date().toISOString(), paidManually: true }
        : inst
    );
    commitWorkflow({ ...wf, installments: nextInstallments }, 'Échéance marquée payée manuellement (Super Admin)');
    api(`/installments/${instId}/mark-paid`, { method: 'POST' }).catch(() => {});
    addToast('Échéance marquée payée manuellement.', 'success');
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msTitle.trim()) return;
    const next = {
      ...wf,
      milestones: [
        ...wf.milestones,
        {
          id: `ms-${Date.now()}`,
          title: msTitle.trim(),
          triggerType: 'jalon' as const,
          triggerValue: msTrigger.trim() || 'Jalon atteint',
          reached: false,
        },
      ],
    };
    commitWorkflow(next, `Jalon ajouté : ${msTitle.trim()}`);
    setMsTitle('');
  };

  const handleReachMilestone = (msId: string) => {
    const next = {
      ...wf,
      milestones: wf.milestones.map((m) =>
        m.id === msId ? { ...m, reached: true, reachedAt: new Date().toISOString() } : m
      ),
    };
    commitWorkflow(next, 'Jalon déclaré atteint (notification paiement envoyée au client)');
    api(`/requests/${requestId}/milestones/${msId}/reach`, { method: 'POST' }).catch(() => {});
    addToast('Jalon atteint : le client est notifié qu’il peut régler l’échéance.', 'success');
  };

  const handleSubmitOpinion = (decision: 'approuve' | 'a_reprendre') => {
    const filtered = wf.opinions.filter((o) => o.role !== opinionRole);
    const nextOpinions: TeamOpinion[] = [
      ...filtered,
      {
        role: opinionRole,
        authorName: actorName,
        decision,
        comment: opinionComment.trim() || undefined,
        at: new Date().toISOString(),
      },
    ];
    const allThreeApproved =
      nextOpinions.length >= 3 && nextOpinions.every((o) => o.decision === 'approuve');
    const next: RequestWorkflowState = {
      ...wf,
      opinions: nextOpinions,
      internalStage: allThreeApproved ? 'validee' : 'en_revue',
    };
    commitWorkflow(
      next,
      `Avis ${BENILINK_ROLE_META[opinionRole].label} : ${decision === 'approuve' ? 'Approuvé' : 'À reprendre'}`
    );
    api(`/requests/${requestId}/team-opinions`, {
      method: 'POST',
      body: { role: opinionRole, decision, comment: opinionComment.trim() },
    }).catch(() => {});
    setOpinionComment('');
    addToast('Avis enregistré.', 'success');
  };

  const handleFinalClose = () => {
    const next: RequestWorkflowState = {
      ...wf,
      internalStage: 'terminee',
      progressPct: 100,
      closedAt: new Date().toISOString(),
    };
    commitWorkflow(next, 'Mission clôturée et client informé (Super Admin)');
    api(`/requests/${requestId}/close`, { method: 'POST' }).catch(() => {});
    addToast('Mission clôturée et client informé !', 'success');
  };

  const stageMeta = INTERNAL_STAGE_META[wf.internalStage];
  const threeOpinionsGiven = wf.opinions.length >= 3;

  return (
    <section className="card mb-5">
      <div className="card-head flex-wrap gap-2">
        <div>
          <h2>Circuit interne BeniLink (v1.2)</h2>
          <p className="text-xs muted">
            Étape interne : <strong>{stageMeta.label}</strong> · Vue client :{' '}
            <span className={`badge badge-${stageMeta.color}`}>{stageMeta.clientLabel}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setPanelTab('circuit')}
            className={`btn btn-sm ${panelTab === 'circuit' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Circuit &amp; Handoff</span>
          </button>
          <button
            type="button"
            onClick={() => setPanelTab('workorder')}
            className={`btn btn-sm ${panelTab === 'workorder' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Fiche de travail &amp; Jalons</span>
          </button>
          <button
            type="button"
            onClick={() => setPanelTab('quote')}
            className={`btn btn-sm ${panelTab === 'quote' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Devis &amp; Échéances</span>
          </button>
          <button
            type="button"
            onClick={() => setPanelTab('validation')}
            className={`btn btn-sm ${panelTab === 'validation' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Avis ({wf.opinions.length}/3) &amp; Clôture</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Circuit 16 étapes & Handoff */}
      {panelTab === 'circuit' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="internal-stage-sel" className="mb-1 block text-xs font-bold muted">
                Étape interne du dossier
              </label>
              <select
                id="internal-stage-sel"
                value={wf.internalStage}
                onChange={(e) =>
                  commitWorkflow(
                    { ...wf, internalStage: e.target.value as InternalStage },
                    `Étape interne changée → ${INTERNAL_STAGE_META[e.target.value as InternalStage].label}`
                  )
                }
              >
                {(Object.keys(INTERNAL_STAGE_META) as InternalStage[]).map((k) => (
                  <option key={k} value={k}>
                    {INTERNAL_STAGE_META[k].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <button type="button" onClick={handleAcknowledge} className="btn btn-ghost btn-sm">
                <Bell className="h-4 w-4" aria-hidden="true" />
                <span>{wf.acknowledgedAt ? 'Accusé envoyé ✓' : 'Envoyer accusé de réception'}</span>
              </button>
              <button type="button" onClick={handleHandoff} className="btn btn-primary btn-sm">
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>{wf.handoffAt ? 'Équipe informée ✓' : 'Informer l’équipe (Handoff)'}</span>
              </button>
              <button type="button" onClick={handleToggleSuspend} className="btn btn-danger-ghost btn-sm">
                {wf.internalStage === 'suspendue' ? (
                  <>
                    <PlayCircle className="h-4 w-4" aria-hidden="true" />
                    <span>Reprendre</span>
                  </>
                ) : (
                  <>
                    <PauseCircle className="h-4 w-4" aria-hidden="true" />
                    <span>Suspendre</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Fiche de travail (sans donnée client) & Jalons */}
      {panelTab === 'workorder' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="field !mb-0">
              <label htmlFor="wo-ref">Référence interne</label>
              <input
                id="wo-ref"
                value={wf.workOrder.internalRef}
                onChange={(e) =>
                  commitWorkflow({ ...wf, workOrder: { ...wf.workOrder, internalRef: e.target.value } })
                }
              />
            </div>
            <div className="field !mb-0">
              <label htmlFor="wo-loc">Lieu d’intervention (sans nom client)</label>
              <input
                id="wo-loc"
                value={wf.workOrder.location}
                onChange={(e) =>
                  commitWorkflow({ ...wf, workOrder: { ...wf.workOrder, location: e.target.value } })
                }
              />
            </div>
            <div className="field !mb-0">
              <label htmlFor="wo-due">Échéance cible</label>
              <input
                id="wo-due"
                type="date"
                value={wf.workOrder.dueDate}
                onChange={(e) =>
                  commitWorkflow({ ...wf, workOrder: { ...wf.workOrder, dueDate: e.target.value } })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="field !mb-0">
              <label htmlFor="wo-prov">Prestataire technique (fiche sans compte)</label>
              <select
                id="wo-prov"
                value={wf.workOrder.assignedProviderId || ''}
                onChange={(e) => {
                  const found = providers.find((p) => p.id === e.target.value);
                  commitWorkflow(
                    {
                      ...wf,
                      workOrder: {
                        ...wf.workOrder,
                        assignedProviderId: found?.id,
                        assignedProviderName: found?.name,
                      },
                    },
                    found ? `Prestataire rattaché : ${found.name}` : undefined
                  );
                }}
              >
                <option value="">— Aucun prestataire rattaché —</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.kind})
                  </option>
                ))}
              </select>
            </div>
            <div className="field !mb-0">
              <label htmlFor="wo-prog">Avancement déclaré (Responsable des prestations) : {wf.progressPct}%</label>
              <input
                id="wo-prog"
                type="range"
                min={0}
                max={100}
                step={5}
                value={wf.progressPct}
                onChange={(e) => {
                  const pct = Number(e.target.value);
                  commitWorkflow({ ...wf, progressPct: pct });
                  api(`/requests/${requestId}/progress`, { method: 'POST', body: { percent: pct } }).catch(() => {});
                }}
              />
            </div>
          </div>

          <div className="field !mb-0">
            <label htmlFor="wo-inst">Instructions pour l’agent (zéro donnée personnelle client)</label>
            <textarea
              id="wo-inst"
              rows={2}
              value={wf.workOrder.instructions}
              onChange={(e) =>
                commitWorkflow({ ...wf, workOrder: { ...wf.workOrder, instructions: e.target.value } })
              }
              placeholder="Décrivez uniquement les tâches terrain attendues et les preuves à rapporter…"
            />
          </div>

          {/* Jalons */}
          <div className="rounded-xl border border-[#d0e3f5] bg-[#f7f9ff] p-3.5 space-y-3">
            <strong className="flex items-center gap-1.5 text-xs text-[#0d1d2b]">
              <Flag className="h-4 w-4 text-[#006191]" aria-hidden="true" />
              Jalons de la mission ({wf.milestones.length})
            </strong>
            <form onSubmit={handleAddMilestone} className="flex flex-wrap gap-2">
              <input
                type="text"
                value={msTitle}
                onChange={(e) => setMsTitle(e.target.value)}
                placeholder="Ex. Fondations terminées"
                className="flex-1 min-w-[160px]"
              />
              <input
                type="text"
                value={msTrigger}
                onChange={(e) => setMsTrigger(e.target.value)}
                placeholder="Déclencheur (ex. 50 %)"
                className="w-44"
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Ajouter</span>
              </button>
            </form>
            {wf.milestones.length > 0 && (
              <ul className="space-y-1.5">
                {wf.milestones.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#d0e3f5] bg-white px-3 py-2 text-xs"
                  >
                    <span>
                      <strong>{m.title}</strong> <span className="muted">({m.triggerValue})</span>
                    </span>
                    {m.reached ? (
                      <span className="badge badge-green">Atteint ✓</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReachMilestone(m.id)}
                        className="btn btn-gold btn-sm"
                      >
                        Déclarer atteint
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Éditeur avancé de devis & Échéances FedaPay */}
      {panelTab === 'quote' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="field !mb-0">
              <label htmlFor="q-modality">Modalité de paiement convenue (5 modèles)</label>
              <select
                id="q-modality"
                value={wf.paymentModality}
                onChange={(e) => handleChangeModality(e.target.value as PaymentModality)}
              >
                {(Object.keys(PAYMENT_MODALITY_LABELS) as PaymentModality[]).map((m) => (
                  <option key={m} value={m}>
                    {PAYMENT_MODALITY_LABELS[m]}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-xl border border-[#d0e3f5] bg-[#f7f9ff] p-3 text-xs">
              <div className="flex justify-between">
                <span className="muted">Coût prestataires (interne Super Admin) :</span>
                <strong>{formatConvertedMoney(totalProviderCost, currency)}</strong>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="font-bold text-[#006191]">Prix final client :</span>
                <strong className="text-[#006191]">{formatConvertedMoney(totalClientPrice, currency)}</strong>
              </div>
            </div>
          </div>

          <form onSubmit={handleAddQuoteLine} className="grid grid-cols-1 gap-2 sm:grid-cols-5">
            <input
              type="text"
              placeholder="Prestation"
              value={lineLabel}
              onChange={(e) => setLineLabel(e.target.value)}
              className="sm:col-span-2"
            />
            <input
              type="number"
              min={1}
              value={lineProviderCost}
              onChange={(e) => setLineProviderCost(Number(e.target.value))}
              placeholder="Coût prest. (€)"
              title="Coût prestataire (€)"
            />
            <input
              type="number"
              min={0}
              max={200}
              value={lineMarginPct}
              onChange={(e) => setLineMarginPct(Number(e.target.value))}
              placeholder="% BeniLink"
              title="Pourcentage entreprise (%)"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Ligne</span>
            </button>
          </form>

          {wf.quoteLines.length > 0 && (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Prestation</th>
                    <th>Coût prest. (interne)</th>
                    <th>% BeniLink (interne)</th>
                    <th>Prix client</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {wf.quoteLines.map((l) => (
                    <tr key={l.id}>
                      <td>{l.label}</td>
                      <td>{formatConvertedMoney(l.providerCost, currency)}</td>
                      <td>{l.marginPct}%</td>
                      <td><strong>{formatConvertedMoney(l.clientPrice, currency)}</strong></td>
                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            const nextLines = wf.quoteLines.filter((x) => x.id !== l.id);
                            const nextTot = nextLines.reduce((s, x) => s + x.clientPrice, 0);
                            commitWorkflow({
                              ...wf,
                              quoteLines: nextLines,
                              installments: generateDefaultInstallments(nextTot, wf.paymentModality),
                            });
                          }}
                          className="icon-btn"
                          aria-label="Supprimer la ligne"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Installments list */}
          {wf.installments.length > 0 && (
            <div className="space-y-2">
              <strong className="block text-xs text-[#0d1d2b]">
                Échéances FedaPay ({wf.installments.length}) — Relances &amp; Paiement manuel Super Admin
              </strong>
              {wf.installments.map((inst) => (
                <div
                  key={inst.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#d0e3f5] bg-[#f7f9ff] px-3.5 py-2.5 text-xs"
                >
                  <div>
                    <strong>{inst.label}</strong> ·{' '}
                    <span className="font-bold text-[#006191]">
                      {formatConvertedMoney(inst.amountEur, currency)}
                    </span>
                    <span className="block text-[11px] muted">
                      Déclencheur : {inst.triggerLabel} · Relances : {inst.remindersSent}/3
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {inst.status === 'paye' ? (
                      <span className="badge badge-green">
                        Payée {inst.paidManually ? '(manuel)' : '(FedaPay)'}
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSendReminder(inst.id)}
                          className="btn btn-ghost btn-sm"
                        >
                          Relancer ({inst.remindersSent}/3)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkInstallmentPaid(inst.id)}
                          className="btn btn-gold btn-sm"
                        >
                          Marquer payée
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Avis des 3 responsables & Clôture Super Admin */}
      {panelTab === 'validation' && (
        <div className="space-y-4">
          <p className="text-xs muted">
            En fin de mission, chacun des 3 responsables (Administrateur général, Responsable clientèle, Responsable des prestations) donne son avis. Le Super Admin ne peut clôturer et informer le client qu’une fois les 3 avis rendus (§7 v1.0).
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(['admin_general', 'responsable_clientele', 'responsable_prestations'] as const).map((rKey) => {
              const op = wf.opinions.find((o) => o.role === rKey);
              return (
                <div key={rKey} className="rounded-xl border border-[#d0e3f5] bg-[#f7f9ff] p-3 text-xs">
                  <strong className="block text-[#0d1d2b]">{BENILINK_ROLE_META[rKey].label}</strong>
                  {op ? (
                    <>
                      <span className={`badge mt-1.5 ${op.decision === 'approuve' ? 'badge-green' : 'badge-red'}`}>
                        {op.decision === 'approuve' ? 'Approuvé' : 'À reprendre'}
                      </span>
                      {op.comment && <p className="mt-1.5 muted">{op.comment}</p>}
                    </>
                  ) : (
                    <span className="mt-1.5 inline-block muted">En attente d’avis</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-[#d0e3f5] bg-white p-3.5 space-y-2.5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <select
                value={opinionRole}
                onChange={(e) => setOpinionRole(e.target.value as TeamOpinion['role'])}
              >
                <option value="admin_general">Administrateur général</option>
                <option value="responsable_clientele">Responsable clientèle</option>
                <option value="responsable_prestations">Responsable des prestations</option>
              </select>
              <input
                type="text"
                value={opinionComment}
                onChange={(e) => setOpinionComment(e.target.value)}
                placeholder="Commentaire facultatif…"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSubmitOpinion('approuve')}
                className="btn btn-primary btn-sm"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>Approuver</span>
              </button>
              <button
                type="button"
                onClick={() => handleSubmitOpinion('a_reprendre')}
                className="btn btn-danger-ghost btn-sm"
              >
                À reprendre
              </button>
              <button
                type="button"
                disabled={!threeOpinionsGiven || Boolean(wf.closedAt)}
                onClick={handleFinalClose}
                className="btn btn-gold btn-sm ml-auto"
                title={
                  threeOpinionsGiven
                    ? 'Clôturer et informer le client'
                    : 'Disponible une fois les 3 avis rendus'
                }
              >
                {wf.closedAt ? 'Clôturée & client informé ✓' : 'Clôturer & informer le client (Super Admin)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
