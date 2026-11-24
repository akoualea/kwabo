import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Hash, Send, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  BENILINK_ROLE_META,
  getActiveSubRole,
  getTeamRoomMessages,
  postTeamRoomMessage,
  subscribeWorkflow,
  TeamRoomMessage,
} from '../../utils/benilinkWorkflow';
import { recordActivity } from '../../utils/internalOps';

export const AdminTeamChat: React.FC = () => {
  const { currentUser, role, addToast } = useApp();
  const subRole = getActiveSubRole(role);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('general');
  const [allMessages, setAllMessages] = useState<TeamRoomMessage[]>([]);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sync = () => setAllMessages(getTeamRoomMessages());
    sync();
    return subscribeWorkflow(sync);
  }, []);

  const rooms = useMemo(() => {
    const map = new Map<string, string>();
    map.set('general', 'Groupe général de l’équipe');
    allMessages.forEach((m) => {
      if (!map.has(m.roomId)) {
        map.set(m.roomId, m.roomLabel);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [allMessages]);

  const activeRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const visibleMessages = useMemo(
    () => allMessages.filter((m) => m.roomId === activeRoom.id),
    [allMessages, activeRoom.id]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !currentUser) return;

    const senderName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email;
    const senderRoleLabel = BENILINK_ROLE_META[subRole]?.label || 'Administration';

    postTeamRoomMessage({
      roomId: activeRoom.id,
      roomLabel: activeRoom.label,
      senderName,
      senderRoleLabel,
      body: text,
    });

    api(`/team/rooms/${activeRoom.id}/messages`, {
      method: 'POST',
      body: { body: text },
    }).catch(() => {});

    recordActivity({
      actorId: currentUser.id,
      actorName: senderName,
      actorRole: senderRoleLabel,
      action: `Message dans le salon d'équipe (${activeRoom.label})`,
      details: text.slice(0, 120),
    });

    setDraft('');
    addToast('Message publié dans le groupe d’équipe.', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="alert flex items-start gap-3">
        <Users className="mt-0.5 h-5 w-5 shrink-0 text-[#006191]" aria-hidden="true" />
        <p className="text-xs sm:text-sm leading-relaxed">
          <strong>Groupe de discussion d’équipe (§5.2) :</strong> le Super Admin annonce ici chaque nouvelle demande à l’Administrateur général, au Responsable clientèle et au Responsable des prestations. Chaque dossier dispose aussi de son fil dédié après le Handoff.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[270px_minmax(0,1fr)] lg:items-start">
        {/* Mobile selector */}
        <div className="card !mb-0 lg:hidden">
          <label htmlFor="team-room-select" className="mb-1.5 block text-xs font-bold muted">
            Salon de discussion
          </label>
          <select
            id="team-room-select"
            value={activeRoom.id}
            onChange={(e) => setSelectedRoomId(e.target.value)}
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop rooms list */}
        <aside className="messenger-list hidden lg:grid" aria-label="Salons d'équipe">
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider muted">
            Salons ({rooms.length})
          </div>
          {rooms.map((r) => {
            const isSelected = r.id === activeRoom.id;
            return (
              <button
                key={r.id}
                type="button"
                className={isSelected ? 'active' : ''}
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => setSelectedRoomId(r.id)}
              >
                <span className="tile tile-sm">
                  <Hash className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="messenger-item text-left">
                  <strong>{r.label}</strong>
                  <small>{r.id === 'general' ? 'Annonces & coordination' : 'Fil mission'}</small>
                </span>
              </button>
            );
          })}
        </aside>

        {/* Thread */}
        <section className="messenger-thread">
          <header className="border-b border-[#d0e3f5] pb-3">
            <div>
              <strong>{activeRoom.label}</strong>
              <small className="muted">
                Super Admin · Administrateur général · Responsable clientèle · Responsable des prestations
              </small>
            </div>
          </header>

          <div className="thread">
            <div className="thread-messages">
              {visibleMessages.length === 0 ? (
                <p className="thread-empty muted">
                  Aucun message dans ce salon. Annoncez une demande ou coordonnez l’équipe ci-dessous.
                </p>
              ) : (
                visibleMessages.map((m) => {
                  const isMine =
                    m.senderName ===
                    (`${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.email);
                  return (
                    <div key={m.id} className={`bubble ${isMine ? 'bubble-mine' : ''}`}>
                      <span className="bubble-author">
                        {m.senderName} · {m.senderRoleLabel}
                      </span>
                      <p>{m.body}</p>
                      <time>
                        {new Date(m.at).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>

            <form className="thread-form" onSubmit={handleSend}>
              <div className="thread-form-row">
                <textarea
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ex. Nouvelle demande reçue : merci au Responsable des prestations de consulter nos prestataires…"
                />
                <button type="submit" className="btn btn-primary" disabled={!draft.trim()}>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>Publier</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
