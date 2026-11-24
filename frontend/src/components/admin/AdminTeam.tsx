import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api, ApiError, getFirstValidationError } from '../../services/api';
import { mapUser } from '../../services/mappers';
import { User, UserRole } from '../../types';
import { Icon } from '../common/Icon';
import {
  getMemberInternalProfile,
  INTERNAL_PROFILES,
  InternalProfileId,
  recordActivity,
  setMemberInternalProfile,
} from '../../utils/internalOps';

interface TeamMember extends User {
  activeCount: number;
  totalCount: number;
}

export const AdminTeam: React.FC = () => {
  const { addToast, confirm, currentUser } = useApp();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newProfileId, setNewProfileId] = useState<InternalProfileId>('agent');
  const [newAge, setNewAge] = useState('');
  const [profileTick, setProfileTick] = useState(0);
  const [tempPasswordNote, setTempPasswordNote] = useState<string | null>(null);

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
    if (!newFirstName.trim() || !newLastName.trim() || !newEmail.trim()) return;
    setSubmitting(true);
    try {
      const res = await api<any>('/admin/operators', {
        method: 'POST',
        body: {
          first_name: newFirstName.trim(),
          last_name: newLastName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim(),
          internal_profile: newProfileId,
          ...(newProfileId === 'freelance_student' && newAge ? { age: Number(newAge) } : {}),
        },
      });
      setMemberInternalProfile(newEmail.trim(), newProfileId);
      if (currentUser) {
        recordActivity({
          actorId: currentUser.id,
          actorName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.email,
          actorRole: 'Administrateur',
          action: `Création du compte ${newFirstName.trim()} ${newLastName.trim()}`,
          details: `Profil : ${INTERNAL_PROFILES.find((p) => p.id === newProfileId)?.label || newProfileId}`,
        });
      }
      const generatedPwd = res?.temporary_password ?? res?.password ?? res?.data?.temporary_password;
      if (generatedPwd) {
        setTempPasswordNote(`Mot de passe temporaire pour ${newEmail.trim()} : ${generatedPwd}`);
      }
      addToast(`Agent ${newFirstName.trim()} ${newLastName.trim()} ajouté avec succès.`);
      setShowAddModal(false);
      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewPhone('');
      setNewProfileId('agent');
      await loadTeam();
    } catch (err) {
      addToast(err instanceof ApiError ? getFirstValidationError(err) : "Impossible d'ajouter l'agent.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() => setShowAddModal(true)}
        >
          <Icon name="user-plus" size={18} />
          <span>Ajouter un agent</span>
        </button>
      </div>

      {tempPasswordNote && (
        <div className="alert mb-4 flex items-center justify-between gap-3">
          <span>{tempPasswordNote}</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setTempPasswordNote(null)}
          >
            Fermer
          </button>
        </div>
      )}

      {loading && teamMembers.length === 0 ? (
        <div className="empty">Chargement de l'équipe…</div>
      ) : (
        <ul className="team-grid" data-profile-tick={profileTick}>
          {teamMembers.map(u => {
            const initials = `${u.firstName[0] || ''}${u.lastName[0] || ''}`.toUpperCase() || '?';
            const assignedProfile = getMemberInternalProfile(u.email || u.id, u.role);
            return (
              <li key={u.id} className="card">
                <div className="client-mini">
                  <span className="avatar">{initials}</span>
                  <span>
                    <strong>{u.firstName} {u.lastName}</strong>
                    <small>{assignedProfile.label || ROLE_LABEL[u.role] || u.role}</small>
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
                </ul>

                <div className="mt-3">
                  <label className="mb-1 block text-[11px] font-semibold muted" htmlFor={`profile-${u.id}`}>
                    Profil hiérarchique BeniLink
                  </label>
                  <select
                    id={`profile-${u.id}`}
                    value={assignedProfile.id}
                    onChange={(e) => {
                      const nextId = e.target.value as InternalProfileId;
                      setMemberInternalProfile(u.email || u.id, nextId);
                      setProfileTick((t) => t + 1);
                      addToast(`Profil mis à jour : ${INTERNAL_PROFILES.find((p) => p.id === nextId)?.label || nextId}.`, 'info');
                    }}
                    className="w-full rounded-xl border border-[#d0e3f5] bg-white px-2.5 py-1.5 text-xs"
                  >
                    {INTERNAL_PROFILES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

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

      {/* Add Operator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#e0e8e4]">
            <h2 className="text-xl font-bold font-display mb-2">Ajouter un agent terrain</h2>
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
                <label htmlFor="agentEmail">Adresse email</label>
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
                  placeholder="+229 97 00 00 00"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="agentProfile">Profil BeniLink</label>
                <select
                  id="agentProfile"
                  value={newProfileId}
                  onChange={(e) => setNewProfileId(e.target.value as InternalProfileId)}
                >
                  {INTERNAL_PROFILES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {newProfileId === 'freelance_student' && (
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
                  {submitting ? 'Ajout…' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
