import React, { useEffect, useRef, useState } from 'react';
import { Send, ShieldAlert, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { mapUser } from '../../services/mappers';
import { User } from '../../types';
import {
  getInternalMessages,
  InternalChatMessage,
  sendInternalMessage,
  subscribeInternalOps,
} from '../../utils/internalOps';

interface AgentOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export const InternalMessagingView: React.FC = () => {
  const { role, currentUser, addToast } = useApp();
  const isAdmin = role === 'ADMIN';

  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [messages, setMessages] = useState<InternalChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  // Load agents list for Admin
  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    api<any>('/admin/team')
      .then((res) => {
        if (cancelled) return;
        const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const ops = raw.map(mapUser).filter((u: User) => u.role === 'OPERATOR');
        setAgents(ops);
        if (ops.length > 0) {
          setSelectedAgentId((prev) => prev || ops[0].id);
        }
      })
      .catch(() => {
        // Fallback: infer agents from existing internal messages
        const all = getInternalMessages();
        const unique = new Map<string, AgentOption>();
        all.forEach((m) => {
          if (!unique.has(m.agentId)) {
            unique.set(m.agentId, {
              id: m.agentId,
              firstName: m.agentName.split(' ')[0] || 'Agent',
              lastName: m.agentName.split(' ').slice(1).join(' '),
              email: '',
            });
          }
        });
        const list = Array.from(unique.values());
        setAgents(list);
        if (list.length > 0) setSelectedAgentId((prev) => prev || list[0].id);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const activeAgentId = isAdmin ? selectedAgentId : currentUser?.id || '';
  const activeAgent = agents.find((a) => a.id === activeAgentId);
  const activeAgentName = isAdmin
    ? `${activeAgent?.firstName || ''} ${activeAgent?.lastName || ''}`.trim() || 'Agent terrain'
    : `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Agent terrain';

  useEffect(() => {
    const sync = () => {
      if (!activeAgentId) {
        setMessages([]);
        return;
      }
      setMessages(getInternalMessages(activeAgentId));
    };
    sync();
    return subscribeInternalOps(sync);
  }, [activeAgentId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !currentUser || !activeAgentId) return;

    const senderName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email;
    const msg = sendInternalMessage({
      agentId: activeAgentId,
      agentName: activeAgentName,
      senderId: currentUser.id,
      senderName,
      senderRole: isAdmin ? 'ADMIN' : 'OPERATOR',
      body: text,
    });

    setMessages((prev) => [...prev, msg]);
    setDraft('');

    // Sync with live BeniLink /team/rooms API if a mission room exists
    api<any>('/team/rooms')
      .then((res) => {
        const rooms = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const targetRoom =
          rooms.find((r: any) => r.type === 'mission') ||
          rooms.find((r: any) => r.type === 'general') ||
          rooms[0];
        if (targetRoom?.id) {
          return api(`/team/rooms/${targetRoom.id}/messages`, {
            method: 'POST',
            body: { body: text },
          });
        }
      })
      .catch(() => {});

    addToast('Message interne envoyé.', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="alert flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#006191]" aria-hidden="true" />
        <p className="text-xs sm:text-sm leading-relaxed">
          <strong>Canal interne Agent ↔ Administration :</strong> cet espace est strictement réservé à la coordination interne. Les échanges directs entre agents et clients sont désactivés conformément aux règles BeniLink.
        </p>
      </div>

      <div className={isAdmin ? 'grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start' : ''}>
        {isAdmin && (
          <>
            {/* Mobile & Tablet compact agent selector */}
            <div className="card !mb-0 lg:hidden">
              <label htmlFor="mobile-agent-select" className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider muted">
                <Users className="h-4 w-4" aria-hidden="true" />
                <span>Sélectionner un agent ({agents.length})</span>
              </label>
              {agents.length === 0 ? (
                <p className="text-xs muted">Aucun agent enregistré dans l'équipe.</p>
              ) : (
                <select
                  id="mobile-agent-select"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                >
                  {agents.map((agent) => {
                    const name = `${agent.firstName} ${agent.lastName}`.trim() || agent.email;
                    return (
                      <option key={agent.id} value={agent.id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Desktop agent sidebar list */}
            <aside className="messenger-list hidden lg:grid" aria-label="Agents terrain">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider muted">
                <Users className="h-4 w-4" aria-hidden="true" />
                <span>Agents ({agents.length})</span>
              </div>
              {agents.length === 0 ? (
                <p className="p-3 text-xs muted">Aucun agent enregistré dans l'équipe.</p>
              ) : (
                agents.map((agent) => {
                  const name = `${agent.firstName} ${agent.lastName}`.trim() || agent.email;
                  const isSelected = agent.id === selectedAgentId;
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      aria-current={isSelected ? 'true' : undefined}
                      className={isSelected ? 'active' : ''}
                      onClick={() => setSelectedAgentId(agent.id)}
                    >
                      <span className="avatar avatar-sm">
                        {`${agent.firstName?.[0] || ''}${agent.lastName?.[0] || ''}`.toUpperCase() || 'AG'}
                      </span>
                      <span className="messenger-item text-left">
                        <strong>{name}</strong>
                        <small>{agent.email || 'Agent terrain'}</small>
                      </span>
                    </button>
                  );
                })
              )}
            </aside>
          </>
        )}

        <section className="messenger-thread">
          <header className="border-b border-[#d0e3f5] pb-3">
            <div>
              <strong>
                {isAdmin ? `Coordination avec ${activeAgentName}` : 'Administration centrale BeniLink'}
              </strong>
              <small className="muted">
                {isAdmin
                  ? 'Échange interne sécurisé (non visible par le client)'
                  : 'Remontée de terrain et questions opérationnelles'}
              </small>
            </div>
          </header>

          <div className="thread">
            <div className="thread-messages">
              {messages.length === 0 ? (
                <p className="thread-empty muted">
                  Aucun message interne pour le moment. Démarrez la coordination ci-dessous.
                </p>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderRole === (isAdmin ? 'ADMIN' : 'OPERATOR');
                  return (
                    <div key={m.id} className={`bubble ${isMine ? 'bubble-mine' : ''}`}>
                      <span className="bubble-author">
                        {m.senderName} · {m.senderRole === 'ADMIN' ? 'Administration' : 'Agent'}
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
                  placeholder={
                    isAdmin
                      ? `Écrire une consigne interne à ${activeAgentName}…`
                      : "Transmettre un compte rendu ou une question à l'administration…"
                  }
                  disabled={isAdmin && !activeAgentId}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!draft.trim() || (isAdmin && !activeAgentId)}
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>Envoyer</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
