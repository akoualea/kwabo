import { getUserCurrency } from '../data/worldCountries';

/* =========================================================
   BeniLink v1.2 Complete Frontend Workflow Store
   API-first with seamless localStorage fallback until
   the backend deploys the 7-role & v1.2 routes.
   ========================================================= */

export type BeniLinkRole =
  | 'super_admin'
  | 'admin_general'
  | 'responsable_clientele'
  | 'responsable_prestations'
  | 'agent'
  | 'etudiant_livreur'
  | 'client';

export const BENILINK_ROLE_META: Record<
  BeniLinkRole,
  { label: string; short: string; description: string }
> = {
  super_admin: {
    label: 'Super Admin',
    short: 'Super Admin',
    description: 'Seul interlocuteur du client ; devis, handoff équipe, relances/suspension, clôture.',
  },
  admin_general: {
    label: 'Administrateur général',
    short: 'Admin général',
    description: 'Pilote les opérations et les équipes ; avis de fin de mission.',
  },
  responsable_clientele: {
    label: 'Responsable clientèle',
    short: 'Resp. clientèle',
    description: 'Suit le dossier côté clientèle ; informe le Responsable des prestations ; avis final.',
  },
  responsable_prestations: {
    label: 'Responsable des prestations',
    short: 'Resp. prestations',
    description: 'Gère prestataires/partenaires, fiche de travail, affectations, jalons & avancement.',
  },
  agent: {
    label: 'Agent terrain',
    short: 'Agent',
    description: 'Reçoit la fiche de travail (sans donnée client), dépose les preuves et déclare fin.',
  },
  etudiant_livreur: {
    label: 'Étudiant livreur',
    short: 'Livreur',
    description: 'Réalise les livraisons locales (sans donnée client) avec preuve photo.',
  },
  client: {
    label: 'Client',
    short: 'Client',
    description: 'Échange uniquement avec le Super Admin, valide devis/contrat et suit ses échéances.',
  },
};

/**
 * Resolves the strict real BeniLink role from the authenticated backend user's rawRole.
 * Never falls back to a fake client-side role switcher.
 */
export function resolveRealBeniLinkRole(
  rawRole?: string | null,
  fallbackAppRole?: 'VISITOR' | 'USER' | 'ADMIN' | 'OPERATOR'
): BeniLinkRole {
  const r = String(rawRole || '').toLowerCase().trim();
  if (
    r === 'super_admin' ||
    r === 'admin_general' ||
    r === 'responsable_clientele' ||
    r === 'responsable_prestations' ||
    r === 'agent' ||
    r === 'etudiant_livreur' ||
    r === 'client'
  ) {
    return r;
  }
  if (r === 'admin') return 'super_admin';
  if (r === 'operator') return 'agent';
  if (fallbackAppRole === 'ADMIN') return 'super_admin';
  if (fallbackAppRole === 'OPERATOR') return 'agent';
  return 'client';
}

/**
 * Strict RBAC view permissions for the 4 management roles (aligned with API.md §4–§7).
 */
export function canAccessAdminView(realRole: BeniLinkRole, viewId: string): boolean {
  if (realRole === 'super_admin') return true;

  switch (viewId) {
    case 'admin-dashboard':
    case 'admin-requests':
    case 'admin-request-detail':
    case 'admin-team-chat':
    case 'admin-internal-messages':
      return (
        realRole === 'admin_general' ||
        realRole === 'responsable_clientele' ||
        realRole === 'responsable_prestations'
      );

    case 'admin-providers':
      return realRole === 'responsable_prestations'; // + super_admin (already true above)

    case 'admin-messages':
      return false; // Réservé exclusivement au super_admin

    case 'admin-kpis':
    case 'admin-invoices':
    case 'admin-team':
    case 'admin-audit':
      return realRole === 'admin_general';

    case 'admin-clients':
    case 'admin-reviews':
    case 'admin-referrals':
      return realRole === 'admin_general' || realRole === 'responsable_clientele';

    case 'admin-catalog':
      return realRole === 'admin_general' || realRole === 'responsable_prestations';

    default:
      return false;
  }
}

export function canEditProvidersPartners(realRole: BeniLinkRole): boolean {
  return realRole === 'super_admin' || realRole === 'responsable_prestations';
}

export function canViewDailyReportsArchives(realRole: BeniLinkRole): boolean {
  return realRole === 'super_admin';
}

export function getCreatableTeamRoles(realRole: BeniLinkRole): BeniLinkRole[] {
  if (realRole === 'super_admin') {
    return [
      'admin_general',
      'responsable_clientele',
      'responsable_prestations',
      'agent',
      'etudiant_livreur',
      'super_admin',
    ];
  }
  if (realRole === 'admin_general') {
    return ['agent', 'etudiant_livreur'];
  }
  return [];
}

export type InternalStage =
  | 'nouvelle'
  | 'en_discussion'
  | 'accuse_envoye'
  | 'consultation_prestataires'
  | 'devis_en_preparation'
  | 'devis_envoye'
  | 'devis_accepte'
  | 'en_cours'
  | 'terminee_par_agent'
  | 'en_revue'
  | 'validee'
  | 'suspendue'
  | 'terminee'
  | 'annulee';

export const INTERNAL_STAGE_META: Record<
  InternalStage,
  { label: string; clientLabel: string; color: 'neutral' | 'gold' | 'green' | 'red' }
> = {
  nouvelle: { label: '1. Nouvelle demande', clientLabel: 'En attente', color: 'neutral' },
  en_discussion: { label: '2. En discussion (Super Admin ↔ Client)', clientLabel: 'En attente', color: 'neutral' },
  accuse_envoye: { label: '3. Accusé de réception envoyé', clientLabel: 'En attente', color: 'neutral' },
  consultation_prestataires: { label: '4. Consultation équipe & prestataires', clientLabel: 'En attente', color: 'gold' },
  devis_en_preparation: { label: '5. Devis en préparation', clientLabel: 'En attente', color: 'gold' },
  devis_envoye: { label: '6. Devis envoyé au client', clientLabel: 'En attente', color: 'gold' },
  devis_accepte: { label: '7. Devis accepté & contrat généré', clientLabel: 'En attente', color: 'green' },
  en_cours: { label: '8. Mission en cours', clientLabel: 'En cours', color: 'green' },
  terminee_par_agent: { label: '9. Terminée par l’agent (équipe notifiée)', clientLabel: 'En cours', color: 'gold' },
  en_revue: { label: '10. En revue (avis des 3 responsables)', clientLabel: 'En cours', color: 'gold' },
  validee: { label: '11. Validée par l’équipe (prête à clôturer)', clientLabel: 'En cours', color: 'green' },
  suspendue: { label: 'Suspendue (impayé)', clientLabel: 'En attente de paiement', color: 'red' },
  terminee: { label: '12. Clôturée (client informé)', clientLabel: 'Terminée', color: 'green' },
  annulee: { label: 'Annulée', clientLabel: 'Annulée', color: 'red' },
};

export type PaymentModality =
  | 'tout_au_debut'
  | 'tout_a_la_fin'
  | 'moitie_moitie'
  | 'mensuel'
  | 'par_etapes';

export const PAYMENT_MODALITY_LABELS: Record<PaymentModality, string> = {
  tout_au_debut: 'Tout au début (100 % avant démarrage)',
  tout_a_la_fin: 'Tout à la fin (100 % en fin de mission)',
  moitie_moitie: 'Moitié / moitié (50 % à 50 % d’avancement, 50 % à la fin)',
  mensuel: 'Mensuel (montant fixe chaque mois)',
  par_etapes: 'Par étapes / jalons convenus',
};

export interface QuoteLineItem {
  id: string;
  label: string;
  qty: number;
  providerCost: number; // Visible ONLY to Super Admin
  marginPct: number; // Variable %, visible ONLY to Super Admin
  clientPrice: number; // Computed: qty * providerCost * (1 + marginPct/100)
}

export interface QuoteMilestone {
  id: string;
  title: string;
  triggerType: 'acceptation' | 'pourcentage' | 'jalon' | 'date' | 'fin';
  triggerValue: string; // e.g., "50%", "Fondations terminées", "Fin de mission"
  reached: boolean;
  reachedAt?: string;
  proofNote?: string;
}

export interface PaymentInstallment {
  id: string;
  label: string;
  percent: number;
  amountEur: number;
  currency: string;
  triggerLabel: string;
  status: 'a_payer' | 'paye' | 'en_retard';
  remindersSent: number; // 0..3
  paidAt?: string;
  paidManually?: boolean;
}

export interface WorkOrder {
  internalRef: string;
  serviceName: string;
  location: string;
  dueDate: string;
  instructions: string;
  assignedProviderId?: string;
  assignedProviderName?: string;
  assignedDelivererName?: string;
}

export interface TeamOpinion {
  role: 'admin_general' | 'responsable_clientele' | 'responsable_prestations';
  authorName: string;
  decision: 'approuve' | 'a_reprendre';
  comment?: string;
  at: string;
}

export interface RequestWorkflowState {
  requestId: string;
  internalStage: InternalStage;
  acknowledgedAt?: string;
  handoffAt?: string;
  progressPct: number;
  workOrder: WorkOrder;
  paymentModality: PaymentModality;
  quoteLines: QuoteLineItem[];
  quoteValidityDate?: string;
  milestones: QuoteMilestone[];
  installments: PaymentInstallment[];
  agentCompletedAt?: string;
  opinions: TeamOpinion[];
  closedAt?: string;
}

export interface TeamRoomMessage {
  id: string;
  roomId: string; // 'general' or requestId
  roomLabel: string;
  senderName: string;
  senderRoleLabel: string;
  body: string;
  at: string;
}

export interface ProviderPartnerFiche {
  id: string;
  kind: 'prestataire' | 'partenaire';
  name: string;
  contact: string;
  country: string;
  city: string;
  specialties: string;
  notes?: string;
  createdAt: string;
}

const WORKFLOWS_KEY = 'benilink_v12_workflows_v1';
const TEAM_ROOMS_KEY = 'benilink_v12_team_rooms_v1';
const PROVIDERS_KEY = 'benilink_v12_providers_partners_v1';
const ACTIVE_SUBROLE_KEY = 'benilink_v12_active_subrole';
const WF_EVENT = 'benilink-workflow-update';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(WF_EVENT, { detail: { key } }));
  } catch {
    // Ignore storage error
  }
}

export function subscribeWorkflow(listener: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (
      e.key === WORKFLOWS_KEY ||
      e.key === TEAM_ROOMS_KEY ||
      e.key === PROVIDERS_KEY ||
      e.key === ACTIVE_SUBROLE_KEY
    ) {
      listener();
    }
  };
  window.addEventListener(WF_EVENT, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(WF_EVENT, listener);
    window.removeEventListener('storage', onStorage);
  };
}

/* ---------- Active Sub-role Preview (for 7-role UI) ---------- */

export function getActiveSubRole(baseRole: string): BeniLinkRole {
  if (baseRole === 'USER') return 'client';
  if (baseRole === 'OPERATOR') {
    const saved = localStorage.getItem(ACTIVE_SUBROLE_KEY);
    if (saved === 'etudiant_livreur') return 'etudiant_livreur';
    return 'agent';
  }
  const saved = localStorage.getItem(ACTIVE_SUBROLE_KEY) as BeniLinkRole | null;
  if (
    saved &&
    ['super_admin', 'admin_general', 'responsable_clientele', 'responsable_prestations'].includes(saved)
  ) {
    return saved;
  }
  return 'super_admin';
}

export function setActiveSubRole(subRole: BeniLinkRole): void {
  try {
    localStorage.setItem(ACTIVE_SUBROLE_KEY, subRole);
    window.dispatchEvent(new CustomEvent(WF_EVENT, { detail: { key: ACTIVE_SUBROLE_KEY } }));
  } catch {
    // Ignore storage error
  }
}

/* ---------- Per-Request Workflow State ---------- */

export function getRequestWorkflow(
  requestId: string,
  defaults?: { tracking?: string; serviceName?: string; city?: string; status?: string }
): RequestWorkflowState {
  const map = readJson<Record<string, RequestWorkflowState>>(WORKFLOWS_KEY, {});
  if (map[requestId]) return map[requestId];

  const initialStage: InternalStage =
    defaults?.status === 'done'
      ? 'terminee'
      : defaults?.status === 'active'
        ? 'en_cours'
        : defaults?.status === 'cancelled'
          ? 'annulee'
          : 'nouvelle';

  return {
    requestId,
    internalStage: initialStage,
    progressPct: defaults?.status === 'done' ? 100 : defaults?.status === 'active' ? 35 : 0,
    workOrder: {
      internalRef: `FT-${defaults?.tracking || requestId.slice(-5).toUpperCase()}`,
      serviceName: defaults?.serviceName || 'Prestation BeniLink',
      location: defaults?.city || 'Cotonou',
      dueDate: '',
      instructions: '',
    },
    paymentModality: 'moitie_moitie',
    quoteLines: [],
    milestones: [],
    installments: [],
    opinions: [],
  };
}

export function saveRequestWorkflow(wf: RequestWorkflowState): void {
  const map = readJson<Record<string, RequestWorkflowState>>(WORKFLOWS_KEY, {});
  map[wf.requestId] = wf;
  writeJson(WORKFLOWS_KEY, map);
}

export function generateDefaultInstallments(
  totalClientEur: number,
  modality: PaymentModality
): PaymentInstallment[] {
  const currency = getUserCurrency();
  if (totalClientEur <= 0) return [];
  const uid = () => `inst-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

  if (modality === 'tout_au_debut') {
    return [
      {
        id: uid(),
        label: 'Échéance unique (au démarrage)',
        percent: 100,
        amountEur: totalClientEur,
        currency,
        triggerLabel: 'À l’acceptation du devis',
        status: 'a_payer',
        remindersSent: 0,
      },
    ];
  }
  if (modality === 'tout_a_la_fin') {
    return [
      {
        id: uid(),
        label: 'Échéance unique (fin de mission)',
        percent: 100,
        amountEur: totalClientEur,
        currency,
        triggerLabel: 'À la fin de la mission',
        status: 'a_payer',
        remindersSent: 0,
      },
    ];
  }
  if (modality === 'moitie_moitie') {
    const half = Math.round(totalClientEur / 2);
    return [
      {
        id: uid(),
        label: '1re moitié (50 % d’avancement)',
        percent: 50,
        amountEur: half,
        currency,
        triggerLabel: 'À 50 % d’avancement du travail',
        status: 'a_payer',
        remindersSent: 0,
      },
      {
        id: uid(),
        label: '2e moitié (solde fin de mission)',
        percent: 50,
        amountEur: totalClientEur - half,
        currency,
        triggerLabel: 'À la fin de la mission',
        status: 'a_payer',
        remindersSent: 0,
      },
    ];
  }
  if (modality === 'mensuel') {
    const third = Math.round(totalClientEur / 3);
    return [1, 2, 3].map((m) => ({
      id: uid(),
      label: `Mensualité ${m} / 3`,
      percent: m === 3 ? 34 : 33,
      amountEur: m === 3 ? totalClientEur - third * 2 : third,
      currency,
      triggerLabel: `Mois ${m}`,
      status: 'a_payer',
      remindersSent: 0,
    }));
  }
  // par_etapes
  const p1 = Math.round(totalClientEur * 0.3);
  const p2 = Math.round(totalClientEur * 0.4);
  return [
    {
      id: uid(),
      label: 'Étape 1 (30 %)',
      percent: 30,
      amountEur: p1,
      currency,
      triggerLabel: 'À 30 % d’avancement',
      status: 'a_payer',
      remindersSent: 0,
    },
    {
      id: uid(),
      label: 'Étape 2 (40 %)',
      percent: 40,
      amountEur: p2,
      currency,
      triggerLabel: 'Jalon intermédiaire atteint',
      status: 'a_payer',
      remindersSent: 0,
    },
    {
      id: uid(),
      label: 'Solde final (30 %)',
      percent: 30,
      amountEur: totalClientEur - p1 - p2,
      currency,
      triggerLabel: 'À la fin de la mission',
      status: 'a_payer',
      remindersSent: 0,
    },
  ];
}

/* ---------- Team Group Chat (General + Per-Request) ---------- */

export function getTeamRoomMessages(roomId?: string): TeamRoomMessage[] {
  const list = readJson<TeamRoomMessage[]>(TEAM_ROOMS_KEY, []);
  const filtered = roomId ? list.filter((m) => m.roomId === roomId) : list;
  return filtered.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export function postTeamRoomMessage(params: {
  roomId: string;
  roomLabel: string;
  senderName: string;
  senderRoleLabel: string;
  body: string;
}): TeamRoomMessage {
  const msg: TeamRoomMessage = {
    id: `tmsg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    roomId: params.roomId,
    roomLabel: params.roomLabel,
    senderName: params.senderName,
    senderRoleLabel: params.senderRoleLabel,
    body: params.body.trim(),
    at: new Date().toISOString(),
  };
  const list = readJson<TeamRoomMessage[]>(TEAM_ROOMS_KEY, []);
  writeJson(TEAM_ROOMS_KEY, [...list, msg].slice(-500));
  return msg;
}

/* ---------- Providers & Partners Directory (No Accounts) ---------- */

const SEED_PROVIDERS: ProviderPartnerFiche[] = [
  {
    id: 'prov-1',
    kind: 'prestataire',
    name: 'Cabinet Géomètre Expert Atlantique',
    contact: '+229 01 97 12 34 56',
    country: 'Bénin',
    city: 'Abomey-Calavi',
    specialties: 'Bornage, levé topographique, vérification titre foncier',
    createdAt: '2026-11-20T09:00:00Z',
  },
  {
    id: 'prov-2',
    kind: 'prestataire',
    name: 'Atelier BTP & Contrôle Cotonou',
    contact: '+229 01 96 44 22 10',
    country: 'Bénin',
    city: 'Cotonou',
    specialties: 'Suivi de chantier, gros œuvre, expertise structure',
    createdAt: '2026-11-20T09:00:00Z',
  },
  {
    id: 'part-1',
    kind: 'partenaire',
    name: 'Bénin Express Livraisons (Partenaire)',
    contact: 'direction@beninexpress.bj',
    country: 'Bénin',
    city: 'Cotonou',
    specialties: 'Réseau étudiants livreurs, livraisons locales rapides',
    notes: 'Contacté directement par l’équipe — aucun compte plateforme.',
    createdAt: '2026-11-20T09:00:00Z',
  },
];

export function getProvidersAndPartners(): ProviderPartnerFiche[] {
  const saved = readJson<ProviderPartnerFiche[] | null>(PROVIDERS_KEY, null);
  if (!saved) {
    writeJson(PROVIDERS_KEY, SEED_PROVIDERS);
    return SEED_PROVIDERS;
  }
  return saved;
}

export function addProviderOrPartner(
  item: Omit<ProviderPartnerFiche, 'id' | 'createdAt'>
): ProviderPartnerFiche {
  const list = getProvidersAndPartners();
  const created: ProviderPartnerFiche = {
    ...item,
    id: `${item.kind === 'prestataire' ? 'prov' : 'part'}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  writeJson(PROVIDERS_KEY, [created, ...list]);
  return created;
}

export function deleteProviderOrPartner(id: string): void {
  const list = getProvidersAndPartners().filter((x) => x.id !== id);
  writeJson(PROVIDERS_KEY, list);
}
