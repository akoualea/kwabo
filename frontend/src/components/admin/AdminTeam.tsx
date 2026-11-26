import React, { useCallback, useEffect, useState } from 'react';
import { Copy, Eye, EyeOff, KeyRound, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api, ApiError, getFirstValidationError } from '../../services/api';
import { mapUser } from '../../services/mappers';
import { User, UserRole } from '../../types';
import { Icon } from '../common/Icon';
import { INTERNAL_PROFILES, recordActivity } from '../../utils/internalOps';
import {
  BENILINK_ROLE_META,
  BeniLinkRole,
  getCreatableTeamRoles,
  resolveRealBeniLinkRole,
} from '../../utils/benilinkWorkflow';

interface TeamMember extends User {
  activeCount: number;
  totalCount: number;
}

interface CreatedCredentials {
  fullName: string;
  email: string;
  roleLabel: string;
  password: string;
  loginUrl: string;
}

function generateStrongPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  return `Beni${pick(upper)}${pick(lower)}${pick(lower)}${pick(digits)}${pick(digits)}${pick(upper)}`;
}

export const AdminTeam: React.FC = () => {
  const { addToast, confirm, currentUser, role } = useApp();
  const realRole = resolveRealBeniLinkRole(currentUser?.rawRole, role);
  const creatableRoles = getCreatableTeamRoles(realRole);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<BeniLinkRole>(creatableRoles[0] || 'agent');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [newAge, setNewAge] = useState('');
  const [createdCreds, setCreatedCreds] = useState<CreatedCredentials | null>(null);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<any>('/admin/team');
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const mapped: TeamMember[] = rawList.map((raw: any) => {
        const u = mapUser(raw);
        return {
          ...u,
          activeCount: Number(
            raw?.active_count ??
              raw?.active_missions_count ??
              raw?.active_missions ??
              raw?.active ??
              0
          ),
          totalCount: Number(
            raw?.total_count ??
              raw?.total_missions_count ??
              raw?.missions_count ??
              raw?.requests_count ??
              0
          ),
        };
      });
      setTeamMembers(mapped);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : "Impossible de charger l'équipe.", 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const ROLE_LABEL: Record<UserRole, string> = {
    ADMIN: 'Administrateur',
    OPERATOR: 'Agent terrain',
    USER: 'Client',
  };

  const PERMISSIONS: [string, boolean, boolean, boolean][] = [
    ['Voir ses propres demandes et documents', true, true, true],
    ['Écrire au client sur une demande (interdit aux agents)', true, false, true],
    ['Messagerie interne Agent ↔ Administration', false, true, true],
    ['Déposer rapports, photos, reçus', false, true, true],
    ['Changer le statut d\'une demande attribuée', false, true, true],
    ['Générer et transmettre son rapport journalier', false, true, true],
    ['Voir toutes les demandes', false, false, true],
    ['Attribuer un agent, envoyer un devis', false, false, true],
    ['Créer les comptes agents (auto-inscription interdite)', false, false, true],
    ['Gérer clients, paiements, catalogue et archives', false, false, true],
  ];

  const handleToggleSuspend = async (id: string, name: string, isSuspended: boolean) => {
    const ok = await confirm({
      title: isSuspended ? `Réactiver ${name} ?` : `Suspendre ${name} ?`,
      message: isSuspended
        ? 'Cet agent pourra de nouveau se connecter et accéder à ses missions.'
        : 'Cet agent ne pourra plus accéder à son espace tant qu’il reste suspendu.',
      confirmLabel: isSuspended ? 'Réactiver' : 'Suspendre',
      cancelLabel: 'Annuler',
      variant: isSuspended ? 'primary' : 'warning',
    });
    if (!ok) return;
    try {
      await api(`/admin/clients/${id}/suspend`, {
        method: 'POST',
        body: { suspended: !isSuspended },
      });
      addToast(isSuspended ? 'Compte réactivé.' : 'Compte suspendu.');
      await loadTeam();
    } catch (err) {
      addToast(err instanceof ApiError ? getFirstValidationError(err) : 'Action impossible.', 'error');
    }
  };

  const handleAddOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim() || !newLastName.trim() || !newEmail.trim() || !newPassword.trim()) return;
    setSubmitting(true);
    try {
      const chosenPassword = newPassword.trim();
      const res = await api<any>('/admin/users', {
        method: 'POST',
        body: {
          first_name: newFirstName.trim(),
          last_name: newLastName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim(),
          role: newRole,
          password: chosenPassword,
          ...(newRole === 'etudiant_livreur' && newAge ? { age: Number(newAge) } : {}),
        },
      });
      const roleMeta = BENILINK_ROLE_META[newRole];
      if (currentUser) {
        recordActivity({
          actorId: currentUser.id,
          actorName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.email,
          actorRole: BENILINK_ROLE_META[realRole]?.label || 'Administrateur',
          action: `Création du compte ${newFirstName.trim()} ${newLastName.trim()}`,
          details: `Rôle : ${roleMeta?.label || newRole}`,
        });
      }
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://benilink-app.vercel.app';
      const isFieldRole = newRole === 'agent' || newRole === 'etudiant_livreur';
      const loginUrl = `${origin}/#/${isFieldRole ? 'agent' : 'admin'}/connexion`;
      const finalPwd = res?.temporary_password ?? res?.password ?? res?.data?.temporary_password ?? chosenPassword;

      setCreatedCreds({
        fullName: `${newFirstName.trim()} ${newLastName.trim()}`,
        email: newEmail.trim(),
        roleLabel: roleMeta?.label || newRole,
        password: String(finalPwd),
        loginUrl,
      });

      addToast(`Compte ${roleMeta?.label || newRole} créé pour ${newFirstName.trim()} ${newLastName.trim()}.`, 'success');
      setShowAddModal(false);
      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewPhone('');
      setNewPassword('');
      setNewAge('');
      setNewRole(creatableRoles[0] || 'agent');
      await loadTeam();
    } catch (err) {
      addToast(err instanceof ApiError ? getFirstValidationError(err) : "Impossible de créer le compte.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = async () => {
    if (!createdCreds) return;
    const text = [
      `Bienvenue dans l'équipe BeniLink (${createdCreds.roleLabel})`,
      `Nom : ${createdCreds.fullName}`,
      `Lien de connexion : ${createdCreds.loginUrl}`,
      `E-mail : ${createdCreds.email}`,
      `Mot de passe : ${createdCreds.password}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      addToast('Accès copiés dans le presse-papiers !', 'success');
    } catch {
      addToast('Copie manuelle requise.', 'info');
    }
  };

  return (
    <>
      {creatableRoles.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-xs muted">
            {realRole === 'super_admin'
              ? 'En tant que Super Admin, vous pouvez créer tous les comptes de l’équipe (encadrement, agents et étudiants livreurs).'
              : 'En tant qu’Administrateur général, vous pouvez créer les comptes Agents terrain et Étudiants livreurs.'}
          </p>
          <button
            className="btn btn-primary btn-sm"
            type="button"
            onClick={() => {
              setNewRole(creatableRoles[0] || 'agent');
              setNewPassword(generateStrongPassword());
              setShowAddModal(true);
            }}
          >
            <Icon name="user-plus" size={18} />
            <span>Créer un compte équipe</span>
          </button>
        </div>
      )}

      {createdCreds && (
        <div className="card mb-4 border-[#006191]/30 bg-[#edf5ff]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1 text-xs sm:text-sm">
              <strong className="block text-[#004e78]">
                Compte créé : {createdCreds.fullName} ({createdCreds.roleLabel})
              </strong>
              <p><strong>E-mail :</strong> {createdCreds.email}</p>
              <p><strong>Mot de passe :</strong> <code className="rounded bg-white px-2 py-0.5 font-mono text-[#006191]">{createdCreds.password}</code></p>
              <p>
                <strong>Portail de connexion :</strong>{' '}
                <a href={createdCreds.loginUrl} className="underline text-[#006191]" target="_blank" rel="noreferrer">
                  {createdCreds.loginUrl}
                </a>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-gold btn-sm" onClick={handleCopyCredentials}>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>Copier les accès</span>
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCreatedCreds(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && teamMembers.length === 0 ? (
        <div className="empty">Chargement de l'équipe…</div>
      ) : (
        <ul className="team-grid">
          {teamMembers.map(u => {
            const initials = `${u.firstName[0] || ''}${u.lastName[0] || ''}`.toUpperCase() || '?';
            const memberRoleCode = resolveRealBeniLinkRole(u.rawRole, u.role);
            const memberRoleMeta = BENILINK_ROLE_META[memberRoleCode];
            return (
              <li key={u.id} className="card">
                <div className="client-mini">
                  <span className="avatar">{initials}</span>
                  <span>
                    <strong>{u.firstName} {u.lastName}</strong>
                    <small>{memberRoleMeta?.label || ROLE_LABEL[u.role] || u.role}</small>
                  </span>
                  {u.suspended && <span className="badge badge-red ml-auto">Suspendu</span>}
                </div>

                <ul className="contact-list">
                  <li>
                    <Icon name="envelope" size={18} />
                    <span>{u.email}</span>
                  </li>
                  <li>
                    <Icon name="phone" size={18} />
                    <span>{u.phone || '—'}</span>
                  </li>
                  {memberRoleCode === 'etudiant_livreur' && u.age && (
                    <li>
                      <Icon name="user" size={18} />
                      <span>Âge : {u.age} ans</span>
                    </li>
                  )}
                </ul>

                <p className="mt-2 text-[11px] leading-relaxed muted">
                  {memberRoleMeta?.description}
                </p>

                {u.role === 'OPERATOR' ? (
                  <p className="team-load">
                    <strong>{u.activeCount}</strong> en cours · <strong>{u.totalCount}</strong> au total
                  </p>
                ) : (
                  <p className="team-load muted">Accès à toutes les demandes</p>
                )}

                {u.role !== 'ADMIN' && (
                  <button
                    className="btn btn-ghost btn-sm"
                    type="button"
                    onClick={() => handleToggleSuspend(u.id, `${u.firstName} ${u.lastName}`, !!u.suspended)}
                  >
                    {u.suspended ? 'Réactiver' : 'Suspendre'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Organisation hiérarchique des 5 profils internes + intervenants externes */}
      <section className="card mt-6">
        <div className="card-head">
          <h2>Organisation des profils BeniLink</h2>
          <span className="badge badge-green">5 profils internes</span>
        </div>
        <p className="muted mb-4 text-xs sm:text-sm">
          Seuls les administrateurs créent les comptes internes. Les prestataires techniques classiques n'ont aucun accès à la plateforme ; les étudiants freelances disposent d'un accès dédié aux livraisons locales.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INTERNAL_PROFILES.map((profile, idx) => (
            <div
              key={profile.id}
              className="rounded-xl border border-[#d0e3f5] bg-[#f7f9ff] p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <strong className="text-xs sm:text-sm text-[#0d1d2b]">
                  {profile.category === 'interne' ? `${idx + 1}. ` : ''}{profile.label}
                </strong>
                <span className={`badge ${profile.category === 'interne' ? 'badge-neutral' : 'badge-gold'}`}>
                  {profile.category === 'interne' ? 'Interne' : 'Externe'}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[#4c657a]">{profile.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Permissions Matrix Table */}
      <section className="card mt-6">
        <h2>Qui peut faire quoi</h2>
        <div className="table-wrap">
          <table className="table table-perms">
            <thead>
              <tr>
                <th>Permission</th>
                <th>Client</th>
                <th>Agent terrain</th>
                <th>Administrateur</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map(([label, ...roles], idx) => (
                <tr key={idx}>
                  <td>{label}</td>
                  {roles.map((allowed, rIdx) => (
                    <td key={rIdx}>
                      {allowed ? (
                        <span className="perm-yes">
                          <Icon name="check" size={18} />
                          <span className="sr-only">Oui</span>
                        </span>
                      ) : (
                        <span className="perm-no" aria-label="Non">–</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create Team Account Modal (POST /admin/users) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#d0e3f5] my-auto">
            <h2 className="text-xl font-bold font-display mb-1">Créer un compte équipe</h2>
            <p className="text-xs muted mb-4">
              Définissez le rôle et le mot de passe du collaborateur. Il se connectera sur son espace dédié avec ses permissions exactes.
            </p>
            <form onSubmit={handleAddOperator}>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="agentFirstName">Prénom</label>
                  <input
                    id="agentFirstName"
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="agentLastName">Nom</label>
                  <input
                    id="agentLastName"
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="agentEmail">Adresse e-mail</label>
                <input
                  id="agentEmail"
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="agentPhone">Numéro WhatsApp</label>
                <input
                  id="agentPhone"
                  type="tel"
                  placeholder="+229 01 97 00 00 00"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="agentProfile">Rôle BeniLink</label>
                <select
                  id="agentProfile"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as BeniLinkRole)}
                >
                  {creatableRoles.map((r) => (
                    <option key={r} value={r}>
                      {BENILINK_ROLE_META[r].label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] muted">{BENILINK_ROLE_META[newRole]?.description}</p>
              </div>

              {newRole === 'etudiant_livreur' && (
                <div className="field">
                  <label htmlFor="agentAge">Âge de l'étudiant livreur</label>
                  <input
                    id="agentAge"
                    type="number"
                    min={18}
                    max={45}
                    placeholder="Ex. 22"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                  />
                </div>
              )}

              <div className="field">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label htmlFor="agentPassword" className="!mb-0">
                    Mot de passe initial
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewPassword(generateStrongPassword())}
                    className="inline-flex items-center gap-1 rounded-full bg-[#edf4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#006191] hover:bg-[#d9eafd]"
                  >
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    Générer
                  </button>
                </div>
                <div className="relative flex items-center">
                  <KeyRound className="pointer-events-none absolute left-3 h-4 w-4 text-[#6f7881]" aria-hidden="true" />
                  <input
                    id="agentPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 car., 1 majuscule, 1 chiffre"
                    style={{ paddingLeft: '2.4rem', paddingRight: '2.6rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className="absolute right-2.5 text-[#4c657a] hover:text-[#006191]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="dialog-actions mt-6 flex justify-end gap-3">
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Création…' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
