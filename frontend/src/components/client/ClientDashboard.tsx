import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icon } from '../common/Icon';
import { STATUS_MAP, DOC_TYPE_META, SERVICES } from '../../data/kwaboData';
import { api } from '../../services/api';
import {
  mapDocument,
  mapInvoice,
  mapNotification,
  mapRequest,
  mapServiceItem,
} from '../../services/mappers';
import { DocumentItem, InvoiceItem, NotificationItem, RequestItem, Service } from '../../types';
import { formatConvertedMoney, useCurrency } from '../../data/worldCountries';

/* Animations ajoutées (CSS uniquement, aucune logique modifiée) */
const DASHBOARD_ANIMATIONS = `
@keyframes kwWordIn {
  0%   { opacity: 0; transform: translateY(22px) scale(0.92); filter: blur(6px); }
  60%  { opacity: 1; transform: translateY(-3px) scale(1.02); filter: blur(0); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
@keyframes kwFadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes kwFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes kwPopIn {
  0%   { opacity: 0; transform: scale(0.85); }
  70%  { opacity: 1; transform: scale(1.04); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes kwSlideRight {
  from { opacity: 0; transform: translateX(-14px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes kwKenBurns {
  from { transform: scale(1.05); }
  to   { transform: scale(1.14); }
}
@keyframes kwCurrentPulse {
  0%   { box-shadow: 0 0 0 0 rgba(247, 197, 49, 0.55); }
  70%  { box-shadow: 0 0 0 10px rgba(247, 197, 49, 0); }
  100% { box-shadow: 0 0 0 0 rgba(247, 197, 49, 0); }
}
@keyframes kwAlertShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}

/* Bonjour + prénom : mot par mot */
.kw-greeting .kw-word {
  display: inline-block;
  opacity: 0;
  animation: kwWordIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  will-change: transform, opacity, filter;
}
.kw-greeting .kw-word + .kw-word {
  margin-left: 0.3em;
}

/* Bannière */
.kw-welcome-img {
  animation: kwKenBurns 14s ease-in-out infinite alternate;
}
.kw-welcome-text {
  opacity: 0;
  animation: kwFadeUp 0.7s ease 1.3s forwards;
}
.kw-welcome-cta {
  opacity: 0;
  animation: kwFadeUp 0.55s ease 0.22s forwards;
}

/* Stats */
.kw-stat {
  opacity: 0;
  animation: kwFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.kw-stat:hover {
  transform: translateY(-4px);
}
.kw-stat .tile {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.kw-stat:hover .tile {
  transform: scale(1.15) rotate(-6deg);
}

/* Cartes de statistiques BeniLink : fond blanc épuré, bordure #d0e3f5, icône colorée */
.stats .kw-stat {
  position: relative;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

/* Alerte devis */
.kw-alert {
  opacity: 0;
  animation: kwFadeUp 0.5s ease forwards, kwAlertShake 0.6s ease 0.8s 1;
}

/* Cartes */
.kw-card {
  opacity: 0;
  animation: kwFadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.kw-card:hover {
  transform: translateY(-2px);
}

/* Lignes de demandes */
.kw-row {
  opacity: 0;
  animation: kwSlideRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transition: transform 0.25s ease, background-color 0.25s ease;
}
.kw-row:hover {
  transform: translateX(4px);
}
.kw-row:hover .request-row-side > svg:last-child {
  transform: translateX(3px);
}
.kw-row .request-row-side > svg:last-child {
  transition: transform 0.25s ease;
}

/* Étapes de statut */
.kw-step {
  opacity: 0;
  animation: kwSlideRight 0.5s ease forwards;
}
.kw-step.is-current .status-step-dot {
  animation: kwCurrentPulse 1.8s ease-out infinite;
}

/* Notifications et documents */
.kw-item {
  opacity: 0;
  animation: kwSlideRight 0.45s ease forwards;
}
.kw-item .icon-btn {
  transition: transform 0.2s ease;
}
.kw-item .icon-btn:hover {
  transform: scale(1.18);
}

/* Services */
.kw-service {
  opacity: 0;
  animation: kwFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.kw-service:hover {
  transform: translateY(-5px);
}
.kw-service .service-card-foot svg {
  transition: transform 0.25s ease;
}
.kw-service:hover .service-card-foot svg {
  transform: translateX(5px);
}

@media (prefers-reduced-motion: reduce) {
  .kw-greeting .kw-word,
  .kw-welcome-text,
  .kw-welcome-cta,
  .kw-stat,
  .kw-alert,
  .kw-card,
  .kw-row,
  .kw-step,
  .kw-item,
  .kw-service {
    opacity: 1 !important;
    animation: none !important;
    transition: none !important;
  }
  .kw-welcome-img,
  .kw-step.is-current .status-step-dot {
    animation: none !important;
  }
}
`;

export const ClientDashboard: React.FC = () => {
  const {
    currentUser,
    services,
    categories,
    notifications: globalNotifications,
    navigate,
    setPendingServiceSlug,
    openPhotoModal,
    downloadDocument,
  } = useApp();

  const [recentRequests, setRecentRequests] = useState<RequestItem[]>([]);
  const [allCounts, setAllCounts] = useState({ total: 0, pending: 0, active: 0, done: 0 });
  const [active, setActive] = useState<RequestItem | null>(null);
  const [dueInvoices, setDueInvoices] = useState<InvoiceItem[]>([]);
  const [dashNotifs, setDashNotifs] = useState<NotificationItem[]>([]);
  const [lastDocs, setLastDocs] = useState<DocumentItem[]>([]);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      api<any>('/dashboard'),
      api<any>('/requests', { params: { per_page: 200 } }).catch(() => null),
    ])
      .then(([dashRes, reqRes]) => {
        if (cancelled) return;
        const d = dashRes?.data ?? dashRes ?? {};
        const recReqs = Array.isArray(d.recent_requests) ? d.recent_requests.map(mapRequest) : [];
        setRecentRequests(recReqs);

        const rawActive = d.active_mission?.request ?? d.active_mission ?? null;
        setActive(rawActive ? mapRequest(rawActive) : null);

        setDueInvoices(Array.isArray(d.due_invoices) ? d.due_invoices.map(mapInvoice) : []);
        setDashNotifs(Array.isArray(d.notifications) ? d.notifications.map(mapNotification) : []);
        setLastDocs(Array.isArray(d.recent_documents) ? d.recent_documents.map((doc: any) => mapDocument(doc)) : []);
        setPopularServices(
          Array.isArray(d.popular_services) && d.popular_services.length > 0
            ? d.popular_services.map((s: any) => mapServiceItem(s))
            : services.filter(s => s.popular && s.available).slice(0, 4)
        );

        const reqList = Array.isArray(reqRes?.data) ? reqRes.data.map(mapRequest) : recReqs;
        if (d.stats) {
          setAllCounts({
            total: Number(d.stats.total ?? reqList.length),
            pending: Number(d.stats.pending ?? 0),
            active: Number(d.stats.active ?? 0),
            done: Number(d.stats.done ?? 0),
          });
        } else {
          setAllCounts({
            total: reqList.length,
            pending: reqList.filter((r: RequestItem) => r.status === 'pending').length,
            active: reqList.filter((r: RequestItem) => r.status === 'active').length,
            done: reqList.filter((r: RequestItem) => r.status === 'done').length,
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [services]);

  const userNotifs = dashNotifs.length > 0 ? dashNotifs : globalNotifications.filter(n => !n.read);

  const { currency } = useCurrency();
  const formatMoney = (n: number) => formatConvertedMoney(n, currency);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const statusOrder = ['pending', 'active', 'done'];

  // Affichage lettre par lettre du titre et du sous-titre de bienvenue
  const fullGreeting = `Bonjour${currentUser?.firstName ? ` ${currentUser.firstName}` : ''}`;
  const fullWelcomeText = active
    ? `Votre mission « ${active.title} » avance. Tout est à jour ci-dessous.`
    : 'Dites-nous ce dont vous avez besoin au Bénin, nous nous en occupons avec preuves et rigueur.';

  const [typedGreetingCount, setTypedGreetingCount] = useState(0);
  const [typedSubtitleCount, setTypedSubtitleCount] = useState(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setTypedGreetingCount(fullGreeting.length);
      setTypedSubtitleCount(fullWelcomeText.length);
      return;
    }

    setTypedGreetingCount(0);
    setTypedSubtitleCount(0);

    let gIdx = 0;
    let sIdx = 0;
    let subtitleTimer: number | null = null;

    const greetingTimer = window.setInterval(() => {
      gIdx += 1;
      setTypedGreetingCount(gIdx);
      if (gIdx >= fullGreeting.length) {
        window.clearInterval(greetingTimer);
        subtitleTimer = window.setInterval(() => {
          sIdx += 1;
          setTypedSubtitleCount(sIdx);
          if (sIdx >= fullWelcomeText.length && subtitleTimer !== null) {
            window.clearInterval(subtitleTimer);
          }
        }, 26);
      }
    }, 55);

    return () => {
      window.clearInterval(greetingTimer);
      if (subtitleTimer !== null) window.clearInterval(subtitleTimer);
    };
  }, [fullGreeting, fullWelcomeText]);

  const greetingDone = typedGreetingCount >= fullGreeting.length;
  const subtitleDone = typedSubtitleCount >= fullWelcomeText.length;

  return (
    <>
      <style>{DASHBOARD_ANIMATIONS}</style>

      {/* Compact Welcome Banner BeniLink — effet machine à écrire lettre par lettre */}
      <section className="welcome relative overflow-hidden shadow-md border border-[#084d82]/25">
        <div className="relative z-10 min-w-0 flex-1">
          <h2 className="kw-greeting min-h-[1.3em]" aria-label={fullGreeting}>
            <span>{fullGreeting.slice(0, typedGreetingCount)}</span>
            {!greetingDone && (
              <span
                aria-hidden="true"
                className="ml-0.5 inline-block h-[0.9em] w-[2px] align-middle bg-[#f7c531] animate-pulse"
              />
            )}
          </h2>
          <p className="max-w-xl min-h-[2.6em] sm:min-h-[1.5em] text-xs sm:text-sm text-[#e8f2ff]" aria-label={fullWelcomeText}>
            <span>{fullWelcomeText.slice(0, typedSubtitleCount)}</span>
            {greetingDone && !subtitleDone && (
              <span
                aria-hidden="true"
                className="ml-0.5 inline-block h-[1em] w-[2px] align-middle bg-[#f7c531] animate-pulse"
              />
            )}
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 kw-welcome-cta">
          <button
            className="btn btn-gold shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"
            type="button"
            onClick={() => navigate('client-new-request')}
          >
            <Icon name="plus-circle" size={18} />
            <span>Nouvelle demande</span>
          </button>
        </div>
      </section>

      {/* 4 Stats Cards — apparition fluide 1 à 1 */}
      <ul className="stats">
        <li className="stat stat-neutral kw-stat" style={{ animationDelay: '0.18s' }}>
          <span className="tile tile-sm">
            <Icon name="clipboard-document-list" size={18} />
          </span>
          <strong>{allCounts.total}</strong>
          <span>Demandes au total</span>
        </li>
        <li className="stat stat-gold kw-stat" style={{ animationDelay: '0.36s' }}>
          <span className="tile tile-sm">
            <Icon name="clock" size={18} />
          </span>
          <strong>{allCounts.pending}</strong>
          <span>En attente</span>
        </li>
        <li className="stat stat-green kw-stat" style={{ animationDelay: '0.54s' }}>
          <span className="tile tile-sm">
            <Icon name="bolt" size={18} />
          </span>
          <strong>{allCounts.active}</strong>
          <span>En cours</span>
        </li>
        <li className="stat stat-neutral kw-stat" style={{ animationDelay: '0.72s' }}>
          <span className="tile tile-sm">
            <Icon name="check-circle" size={18} />
          </span>
          <strong>{allCounts.done}</strong>
          <span>Terminées</span>
        </li>
      </ul>

      {/* Devis en attente de paiement alert */}
      {dueInvoices.map((i, idx) => (
        <div key={i.id} className="alert kw-alert" style={{ animationDelay: `${0.88 + idx * 0.14}s, ${1.38 + idx * 0.14}s` }}>
          <span className="tile tile-sm">
            <Icon name="banknotes" size={18} />
          </span>
          <p>
            <strong>Un devis attend votre paiement.</strong> {i.label} : {formatMoney(i.amount)}. La mission démarre dès le paiement.
          </p>
          <button
            className="btn btn-gold btn-sm"
            type="button"
            onClick={() => {
              navigate('client-invoices');
            }}
          >
          Passer au paiement
          </button>
        </div>
      ))}

      {/* Main Dash Grid */}
      <div className="dash-grid">
        {/* Left Stack: Mes dernières demandes & Mission en cours */}
        <div className="stack">
          <section className="card kw-card" style={{ animationDelay: '0.92s' }}>
            <div className="card-head">
              <h2>Mes dernières demandes</h2>
              <a href="#/espace/demandes" onClick={(e) => { e.preventDefault(); navigate('client-requests'); }}>
                Tout voir
              </a>
            </div>

            {loading ? (
              <p className="muted">Chargement…</p>
            ) : recentRequests.length === 0 ? (
              <div className="empty-state">
                <span className="tile tile-lg">
                  <Icon name="clipboard-document-list" size={32} />
                </span>
                <h3>Aucune demande</h3>
                <p className="muted">Votre première demande prend moins de 3 minutes.</p>
                <div className="btn-row btn-row-center mt-3">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => navigate('client-new-request')}
                  >
                    Faire une demande
                  </button>
                </div>
              </div>
            ) : (
              <div className="request-list">
                {recentRequests.slice(0, 3).map((r, idx) => {
                  const s = r.service || services.find(srv => srv.slug === r.serviceSlug || srv.id === r.serviceId);
                  return (
                    <a
                      key={r.id}
                      className="request-row kw-row"
                      style={{ animationDelay: `${1.08 + idx * 0.14}s` }}
                      href={`#/espace/demandes/${r.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('client-request-detail', r.id);
                      }}
                    >
                      <span className={`tile cat-${s?.cat || 'demarches'}`}>
                        <Icon name={s?.icon || 'clipboard-document-list'} size={20} />
                      </span>
                      <span className="request-row-main">
                        <strong>{r.title}</strong>
                        <small>{r.tracking} · {r.city} · {formatDate(r.createdAt)}</small>
                      </span>
                      <span className="request-row-side">
                        {r.urgency === 'urgent' && (
                          <span className="badge badge-red">
                            <Icon name="bolt" size={14} />
                            Urgent
                          </span>
                        )}
                        <span className={`badge badge-${STATUS_MAP[r.status].color}`}>
                          <Icon name={STATUS_MAP[r.status].icon} size={14} />
                          {STATUS_MAP[r.status].label}
                        </span>
                        <Icon name="chevron-right" size={18} />
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </section>

          {/* Mission en cours Card */}
          {active && (
            <section className="card kw-card" style={{ animationDelay: '2.5s' }}>
              <div className="card-head">
                <h2>Mission en cours</h2>
                <a
                  href={`#/espace/demandes/${active.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('client-request-detail', active.id);
                  }}
                >
                  Ouvrir
                </a>
              </div>
              <p className="card-lead font-bold mb-3">{active.title}</p>
              
              <ol className="status-steps">
                {statusOrder.map((key, i) => {
                  const isDone = i < statusOrder.indexOf(active.status) || active.status === 'done';
                  const isCurrent = i === statusOrder.indexOf(active.status) && active.status !== 'done';
                  const meta = STATUS_MAP[key as keyof typeof STATUS_MAP];

                  return (
                    <li
                      key={key}
                      className={`kw-step ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}
                      style={{ animationDelay: `${2.8 + i * 0.2}s` }}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      <span className="status-step-dot">
                        {isDone ? <Icon name="check" size={16} /> : <Icon name={meta.icon} size={16} />}
                      </span>
                      <span>{meta.label}</span>
                    </li>
                  );
                })}
              </ol>

              {active.history && active.history.length > 0 && (
                <p className="muted last-event mt-3 flex items-center gap-1.5 text-xs">
                  <Icon name="clock" size={16} />
                  <span>Dernière mise à jour : {active.history.at(-1)?.text}, {formatDateTime(active.history.at(-1)?.at || active.createdAt)}</span>
                </p>
              )}
            </section>
          )}
        </div>

        {/* Right Stack: Notifications & Derniers documents */}
        <div className="stack">
          <section className="card kw-card" style={{ animationDelay: '1.14s' }}>
            <div className="card-head">
              <h2>Notifications</h2>
              <span className="muted small-text">{userNotifs.length} non lues</span>
            </div>

            {userNotifs.length === 0 ? (
              <p className="muted">Rien de nouveau. Vous êtes à jour.</p>
            ) : (
              <ul className="notif-list space-y-2">
                {userNotifs.slice(0, 3).map((n, idx) => (
                  <li
                    key={n.id}
                    className="p-2.5 rounded-xl bg-[#fdf6e0]/60 border border-[#f1e3ae] text-xs kw-item"
                    style={{ animationDelay: `${1.28 + idx * 0.14}s` }}
                  >
                    <p className="font-semibold">{n.text}</p>
                    <small className="muted">{formatDateTime(n.at)}</small>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {lastDocs.length > 0 && (
            <section className="card kw-card" style={{ animationDelay: '1.34s' }}>
              <div className="card-head">
                <h2>Derniers documents</h2>
                <a href="#/espace/documents" onClick={(e) => { e.preventDefault(); navigate('client-documents'); }}>
                  Tout voir
                </a>
              </div>
              <ul className="doc-list">
                {lastDocs.map((d, idx) => {
                  const meta = DOC_TYPE_META[d.type] || DOC_TYPE_META.report;
                  const downloadPath = `/documents/${d.id}/download`;
                  return (
                    <li
                      key={d.id}
                      className="doc-item kw-item"
                      style={{ animationDelay: `${1.48 + idx * 0.14}s` }}
                    >
                      <span className="tile tile-sm">
                        <Icon name={meta.icon} size={18} />
                      </span>
                      <span className="doc-item-main">
                        <strong>{d.name}</strong>
                        <small>{meta.label} · {formatDate(d.createdAt)}</small>
                      </span>
                      <button
                        className="icon-btn"
                        type="button"
                        title="Voir"
                        onClick={() => openPhotoModal(downloadPath, d.name, downloadPath, true)}
                      >
                        <Icon name="eye" size={18} />
                      </button>
                      <button
                        className="icon-btn"
                        type="button"
                        title="Télécharger"
                        onClick={() => downloadDocument(downloadPath, d.name)}
                      >
                        <Icon name="arrow-down-tray" size={18} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </div>

      {/* Services les plus demandés — Design éditorial premium */}
      <section className="section-in-app mt-8">
        <div className="kw-card mb-5 flex flex-wrap items-end justify-between gap-3" style={{ animationDelay: '1.32s' }}>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e3f1ff] px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#006191]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f7c531]" />
              Populaires
            </span>
            <h2 className="mt-1.5 font-display text-xl sm:text-2xl font-bold tracking-tight text-[#0d1d2b]">
              Services les plus demandés
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-[#566b80]">
              Nos prestations phares les plus sollicitées par la diaspora, exécutées avec preuves.
            </p>
          </div>
          <a
            href="#/espace/services"
            onClick={(e) => {
              e.preventDefault();
              navigate('client-new-request');
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#cde0f5] bg-white px-4 py-2 text-xs font-bold text-[#006191] shadow-2xs transition hover:border-[#006191] hover:bg-[#006191] hover:text-white"
          >
            <span>Voir tout le catalogue</span>
            <Icon name="arrow-right" size={14} />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          {(popularServices.length > 0 ? popularServices : services.filter(s => s.popular && s.available))
            .slice(0, 4)
            .map((s, idx) => {
              const cat = categories.find(c => c.id === s.cat);
              const fallbackPhoto = SERVICES.find(srv => srv.id === (s.slug || s.id))?.photo;
              const photoSrc = s.photo || fallbackPhoto || '/assets/photos/chantier-500.jpg';
              const dotColor =
                s.cat === 'famille'
                  ? 'bg-[#e11d48]'
                  : s.cat === 'demarches'
                    ? 'bg-[#d97706]'
                    : s.cat === 'logistique'
                      ? 'bg-[#0891b2]'
                      : 'bg-[#006191]';

              return (
                <a
                  key={s.id}
                  className="popular-service-card kw-service group relative flex flex-col overflow-hidden rounded-[22px] border border-[#dce8f5] bg-white no-underline shadow-[0_8px_26px_rgba(8,77,130,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1593d6]/55 hover:shadow-[0_20px_42px_rgba(8,77,130,0.15)]"
                  style={{ animationDelay: `${1.48 + idx * 0.18}s` }}
                  href={`#/espace/nouvelle-demande?service=${s.slug || s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setPendingServiceSlug(s.slug || s.id);
                    navigate('client-new-request');
                  }}
                >
                  {/* Full-bleed photo header */}
                  <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-[#08243d]">
                    <img
                      src={photoSrc}
                      alt={s.name}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#041d33]/80 via-[#041d33]/20 to-transparent"
                    />

                    {/* Top-left glass category pill */}
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#0d1d2b] shadow-sm backdrop-blur-md">
                      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                      {cat?.short || 'Service'}
                    </span>

                    {/* Top-right icon badge */}
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#004e78]/85 text-[#f7c531] shadow-md ring-1 ring-white/30 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                      <Icon name={s.icon || 'sparkles'} size={16} />
                    </span>

                    {/* Bottom-left trust micro-tag */}
                    <span className="absolute bottom-2.5 left-3 inline-flex items-center gap-1 text-[11px] font-semibold text-white/95 drop-shadow">
                      <Icon name="check-badge" size={14} />
                      <span>Preuves &amp; suivi dédiés</span>
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <h3 className="popular-service-title font-display text-[17px] sm:text-[18px] font-bold leading-snug text-[#0d1d2b] transition-colors group-hover:text-[#006191]">
                      {s.name}
                    </h3>
                    <p className="popular-service-desc mt-2 flex-1 text-[13px] leading-relaxed text-[#52677c] line-clamp-2">
                      {s.short}
                    </p>

                    {/* Footer */}
                    <div className="popular-service-foot mt-4 flex items-center justify-between gap-2 border-t border-[#e8f0f9] pt-3.5">
                      <span className="popular-service-price inline-flex items-center rounded-full border border-[#f5dfa0] bg-[#fff7dc] px-3 py-1 text-[11.5px] font-bold text-[#8a6500]">
                        Sur devis
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006191]">
                        <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          Demander
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf4ff] text-[#006191] transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-[#006191] group-hover:text-white">
                          <Icon name="arrow-right" size={15} />
                        </span>
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
        </div>
      </section>
    </>
  );
};
