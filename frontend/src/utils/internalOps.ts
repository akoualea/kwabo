export type InternalProfileId =
  | 'super_admin'
  | 'general_admin'
  | 'client_manager'
  | 'operations_manager'
  | 'agent'
  | 'freelance_student';

export interface InternalProfileMeta {
  id: InternalProfileId;
  label: string;
  category: 'interne' | 'externe_compte';
  baseRole: 'ADMIN' | 'OPERATOR';
  description: string;
}

export const INTERNAL_PROFILES: InternalProfileMeta[] = [
  {
    id: 'super_admin',
    label: 'Super Administrateur',
    category: 'interne',
    baseRole: 'ADMIN',
    description: 'Supervision globale de la plateforme, des accès et de l’administration.',
  },
  {
    id: 'general_admin',
    label: 'Administrateur général',
    category: 'interne',
    baseRole: 'ADMIN',
    description: 'Pilotage des opérations, coordination des équipes et validation globale.',
  },
  {
    id: 'client_manager',
    label: 'Responsable clientèle',
    category: 'interne',
    baseRole: 'ADMIN',
    description: 'Gestion de la relation client, affectation des dossiers et suivi commercial.',
  },
  {
    id: 'operations_manager',
    label: 'Responsable des prestations',
    category: 'interne',
    baseRole: 'ADMIN',
    description: 'Mène les missions : affecte agents, prestataires et livreurs, suit l’exécution et reçoit les comptes rendus.',
  },
  {
    id: 'agent',
    label: 'Agent terrain',
    category: 'interne',
    baseRole: 'OPERATOR',
    description: 'Exécute la fiche de travail (sans donnée client) et rend compte uniquement au Responsable des prestations.',
  },
  {
    id: 'freelance_student',
    label: 'Étudiant livreur (freelance)',
    category: 'externe_compte',
    baseRole: 'OPERATOR',
    description: 'Compte créé par un administrateur (avec champ âge) pour les livraisons locales sans accès aux données client.',
  },
];

export interface ActivityLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  date: string; // YYYY-MM-DD
  at: string; // ISO
  action: string;
  details?: string;
}

export interface ArchivedDailyReport {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  date: string; // YYYY-MM-DD
  submittedAt: string; // ISO
  activityCount: number;
  activities: ActivityLogEntry[];
  note?: string;
}

export interface InternalChatMessage {
  id: string;
  agentId: string;
  agentName: string;
  senderId: string;
  senderName: string;
  senderRole: 'ADMIN' | 'OPERATOR';
  body: string;
  at: string; // ISO
}

const PROFILES_KEY = 'benilink_member_profiles_v1';
const ACTIVITIES_KEY = 'benilink_auto_activities_v1';
const REPORTS_KEY = 'benilink_daily_reports_v1';
const INTERNAL_CHAT_KEY = 'benilink_internal_messages_v1';
const OPS_EVENT = 'benilink-internal-ops-update';

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
    window.dispatchEvent(new CustomEvent(OPS_EVENT, { detail: { key } }));
  } catch {
    // Ignore storage quota errors
  }
}

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function subscribeInternalOps(listener: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (
      e.key === PROFILES_KEY ||
      e.key === ACTIVITIES_KEY ||
      e.key === REPORTS_KEY ||
      e.key === INTERNAL_CHAT_KEY
    ) {
      listener();
    }
  };
  window.addEventListener(OPS_EVENT, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(OPS_EVENT, listener);
    window.removeEventListener('storage', onStorage);
  };
}

/* ---------- 1. Internal Profiles Metadata ---------- */

export function getMemberInternalProfile(
  memberKey: string,
  fallbackRole: 'ADMIN' | 'OPERATOR' | 'USER'
): InternalProfileMeta {
  const map = readJson<Record<string, InternalProfileId>>(PROFILES_KEY, {});
  const storedId = map[memberKey.toLowerCase()];
  if (storedId) {
    const found = INTERNAL_PROFILES.find((p) => p.id === storedId);
    if (found) return found;
  }
  return (
    INTERNAL_PROFILES.find((p) => p.id === (fallbackRole === 'ADMIN' ? 'general_admin' : 'agent')) ||
    INTERNAL_PROFILES[4]
  );
}

export function setMemberInternalProfile(memberKey: string, profileId: InternalProfileId): void {
  const map = readJson<Record<string, InternalProfileId>>(PROFILES_KEY, {});
  map[memberKey.toLowerCase()] = profileId;
  writeJson(PROFILES_KEY, map);
}

/* ---------- 2. Background Automatic Activity Logging ---------- */

export function recordActivity(params: {
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  details?: string;
}): void {
  if (!params.actorId) return;
  const list = readJson<ActivityLogEntry[]>(ACTIVITIES_KEY, []);
  const entry: ActivityLogEntry = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actorId: params.actorId,
    actorName: params.actorName || 'Utilisateur',
    actorRole: params.actorRole,
    date: getTodayDateKey(),
    at: new Date().toISOString(),
    action: params.action,
    details: params.details,
  };
  // Keep last 500 entries to stay lightweight
  const next = [entry, ...list].slice(0, 500);
  writeJson(ACTIVITIES_KEY, next);
}

export function getTodayActivitiesForActor(actorId: string, _dateKey = getTodayDateKey()): ActivityLogEntry[] {
  // Gather all activities since the actor's last submitted daily report (no midnight auto-cutoff, §12.2 v1.0)
  const reports = readJson<ArchivedDailyReport[]>(REPORTS_KEY, [])
    .filter((r) => r.actorId === actorId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const lastSubmittedMs = reports.length > 0 ? new Date(reports[0].submittedAt).getTime() : 0;

  const list = readJson<ActivityLogEntry[]>(ACTIVITIES_KEY, []);
  return list
    .filter((item) => item.actorId === actorId && new Date(item.at).getTime() > lastSubmittedMs)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

/* ---------- 3. Daily Reports & Historical Archives ---------- */

export function getArchivedDailyReports(): ArchivedDailyReport[] {
  return readJson<ArchivedDailyReport[]>(REPORTS_KEY, []).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

export function archiveDailyReport(params: {
  actorId: string;
  actorName: string;
  actorRole: string;
  note?: string;
}): ArchivedDailyReport {
  const date = getTodayDateKey();
  const activities = getTodayActivitiesForActor(params.actorId, date);
  const report: ArchivedDailyReport = {
    id: `rep-${date}-${params.actorId}-${Date.now()}`,
    actorId: params.actorId,
    actorName: params.actorName,
    actorRole: params.actorRole,
    date,
    submittedAt: new Date().toISOString(),
    activityCount: activities.length,
    activities,
    note: params.note?.trim() || undefined,
  };

  const existing = readJson<ArchivedDailyReport[]>(REPORTS_KEY, []);
  const next = [report, ...existing].slice(0, 300);
  writeJson(REPORTS_KEY, next);
  return report;
}

/* ---------- 4. Internal Messaging (Agent <-> Administration) ---------- */

export function getInternalMessages(agentId?: string): InternalChatMessage[] {
  const list = readJson<InternalChatMessage[]>(INTERNAL_CHAT_KEY, []);
  const filtered = agentId ? list.filter((m) => m.agentId === agentId) : list;
  return filtered.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export function sendInternalMessage(params: {
  agentId: string;
  agentName: string;
  senderId: string;
  senderName: string;
  senderRole: 'ADMIN' | 'OPERATOR';
  body: string;
}): InternalChatMessage {
  const msg: InternalChatMessage = {
    id: `imsg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    agentId: params.agentId,
    agentName: params.agentName,
    senderId: params.senderId,
    senderName: params.senderName,
    senderRole: params.senderRole,
    body: params.body.trim(),
    at: new Date().toISOString(),
  };

  const list = readJson<InternalChatMessage[]>(INTERNAL_CHAT_KEY, []);
  writeJson(INTERNAL_CHAT_KEY, [...list, msg].slice(-400));

  recordActivity({
    actorId: params.senderId,
    actorName: params.senderName,
    actorRole: params.senderRole,
    action:
      params.senderRole === 'OPERATOR'
        ? "Message interne envoyé à l'administration"
        : `Message interne envoyé à l'agent ${params.agentName}`,
    details: params.body.trim().slice(0, 120),
  });

  return msg;
}

/* ---------- 5. Export / Download Helpers ---------- */

export function downloadCsvFile(filename: string, headers: string[], rows: string[][]): void {
  const escapeCell = (value: string) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csvLines = [
    headers.map(escapeCell).join(';'),
    ...rows.map((r) => r.map(escapeCell).join(';')),
  ];
  const blob = new Blob(['\uFEFF' + csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadDailyReportText(report: ArchivedDailyReport): void {
  const lines: string[] = [
    `BENILINK — RAPPORT JOURNALIER D'ACTIVITÉ`,
    `========================================`,
    `Acteur       : ${report.actorName} (${report.actorRole})`,
    `Date         : ${report.date}`,
    `Transmis le  : ${new Date(report.submittedAt).toLocaleString('fr-FR')}`,
    `Actions      : ${report.activityCount}`,
    ``,
  ];

  if (report.note) {
    lines.push(`Observation complémentaire :`, report.note, ``);
  }

  lines.push(`Détail des activités enregistrées automatiquement :`);
  if (report.activities.length === 0) {
    lines.push(`- Aucune activité enregistrée sur cette journée.`);
  } else {
    report.activities.forEach((act) => {
      const time = new Date(act.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      lines.push(`- [${time}] ${act.action}${act.details ? ` — ${act.details}` : ''}`);
    });
  }

  const blob = new Blob([lines.join('\r\n')], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rapport-journalier-${report.date}-${report.actorName.toLowerCase().replace(/\s+/g, '-')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
