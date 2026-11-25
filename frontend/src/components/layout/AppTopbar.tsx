import React, { useState, useRef, useEffect } from 'react';
import { Download, PanelLeft, PanelLeftClose } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Icon } from '../common/Icon';
import { ThemeToggleButton } from '../common/ThemeToggleButton';
import { api } from '../../services/api';
import { mapRequest, mapUser } from '../../services/mappers';
import { RequestItem, User } from '../../types';
import { usePwaInstall } from '../../utils/pwa';
import { CURRENCIES, POPULAR_CURRENCY_CODES, useCurrency } from '../../data/worldCountries';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onOpenSidebar: () => void;
  sidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
  actions?: React.ReactNode;
}

export const AppTopbar: React.FC<TopbarProps> = ({
  title,
  subtitle,
  onOpenSidebar,
  sidebarCollapsed = false,
  onToggleCollapse,
  actions,
}) => {
  const {
    role,
    currentView,
    services,
    notifications,
    counters,
    markNotificationRead,
    markAllNotificationsRead,
    navigate,
    navigateFromLink,
    setActiveClientId,
  } = useApp();

  const { canInstall, promptInstall } = usePwaInstall();
  const { currency, setCurrency } = useCurrency();

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [matchingRequests, setMatchingRequests] = useState<RequestItem[]>([]);
  const [matchingClients, setMatchingClients] = useState<User[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = Math.max(
    counters.unreadNotifications,
    notifications.filter(n => !n.read).length
  );

  const needle = searchQuery.trim();

  // Debounced GET /admin/search?q= for admin & operator
  useEffect(() => {
    if ((role !== 'ADMIN' && role !== 'OPERATOR') || needle.length < 2) {
      setMatchingRequests([]);
      setMatchingClients([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await api<any>('/admin/search', { params: { q: needle } });
        if (cancelled) return;
        const rawReqs = res?.data?.requests ?? res?.requests ?? [];
        const rawClients = res?.data?.clients ?? res?.clients ?? [];
        setMatchingRequests(Array.isArray(rawReqs) ? rawReqs.map(mapRequest) : []);
        setMatchingClients(Array.isArray(rawClients) ? rawClients.map(mapUser) : []);
      } catch {
        if (!cancelled) {
          setMatchingRequests([]);
          setMatchingClients([]);
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [needle, role]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBackTarget = () => {
    switch (currentView) {
      case 'client-request-detail':
      case 'client-new-request':
        return { label: 'Retour aux demandes', target: 'client-requests' };
      case 'client-documents':
      case 'client-messages':
      case 'client-invoices':
      case 'client-referral':
      case 'client-profile':
        return { label: 'Retour au tableau de bord', target: 'client-dashboard' };
      case 'admin-request-detail':
        return { label: 'Retour aux demandes', target: 'admin-requests' };
      case 'operator-mission-detail':
        return { label: 'Retour aux missions', target: 'operator-missions' };
      default:
        return null;
    }
  };

  const backNav = getBackTarget();

  return (
    <header className="topbar">
      <style>{`
        @keyframes kwBellRing {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(15deg); }
          20% { transform: rotate(-13deg); }
          30% { transform: rotate(10deg); }
          40% { transform: rotate(-8deg); }
          50% { transform: rotate(4deg); }
          60% { transform: rotate(0deg); }
        }
        @keyframes kwDotPop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.16); }
        }
        .topbar-bell-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          transition: background-color 0.2s ease, transform 0.2s ease;
        }
        @media (min-width: 640px) {
          .topbar-bell-btn {
            width: 44px;
            height: 44px;
            border-radius: 14px;
          }
        }
        .topbar-bell-btn.has-unread {
          color: #ffffff;
        }
        .topbar-bell-btn.has-unread svg {
          transform-origin: 50% 15%;
          animation: kwBellRing 2.6s ease-in-out infinite;
        }
        .topbar-bell-btn .dot-count {
          top: 3px;
          right: 3px;
          min-width: 20px;
          height: 20px;
          font-size: 11px;
          background: #ef4444;
          color: #fff;
          box-shadow: 0 0 0 2px #006191;
          animation: kwDotPop 1.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .topbar-bell-btn.has-unread svg,
          .topbar-bell-btn .dot-count {
            animation: none !important;
          }
        }
      `}</style>
      <button
        className="icon-btn menu-btn"
        type="button"
        onClick={onOpenSidebar}
        aria-label="Ouvrir le menu"
        aria-controls="sidebar"
      >
        <Icon name="bars-3" size={24} />
      </button>

      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={sidebarCollapsed ? 'Afficher le nom des menus' : 'Réduire le menu aux icônes'}
          title={sidebarCollapsed ? 'Afficher le nom des menus' : 'Réduire le menu aux icônes'}
          className="hidden lg:inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/12 text-white shadow-xs transition hover:bg-white/22 hover:border-white/40"
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-5 w-5" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      )}

      {backNav && (
        <button
          type="button"
          onClick={() => navigate(backNav.target)}
          className="icon-btn"
          title={backNav.label}
          aria-label={backNav.label}
          style={{ marginRight: 8 }}
        >
          <Icon name="arrow-left" size={20} />
        </button>
      )}

      <div className="topbar-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>


      <div className="topbar-actions">
        {role === 'USER' && currentView !== 'client-new-request' && (
          <button
            type="button"
            onClick={() => navigate('client-new-request')}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#f7c531] px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-bold text-[#10202e] shadow-sm transition hover:bg-[#e0a410]"
          >
            <Icon name="plus-circle" size={15} />
            <span className="sm:hidden">Demande</span>
            <span className="hidden sm:inline">Nouvelle demande</span>
          </button>
        )}
        {canInstall && (
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/12 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/22"
            title="Installer l'application BeniLink"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Installer</span>
          </button>
        )}
        {(role === 'ADMIN' || role === 'OPERATOR') && (
          <div className="search admin-search" role="search" ref={searchContainerRef}>
            <Icon name="magnifying-glass" size={18} />
            <label className="sr-only" htmlFor="admin-search-all">
              {role === 'OPERATOR' ? 'Rechercher une mission' : 'Rechercher une demande ou un client'}
            </label>
            <input
              id="admin-search-all"
              type="search"
              autoComplete="off"
              placeholder={role === 'OPERATOR' ? 'Mission, n° de suivi…' : 'Demande, client, n° de suivi…'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => {
                if (needle.length >= 2) setShowSearchResults(true);
              }}
            />

            {showSearchResults && needle.length >= 2 && (
              <div className="search-results" id="admin-search-list">
                {searching ? (
                  <p className="search-empty">Recherche…</p>
                ) : matchingRequests.length === 0 && matchingClients.length === 0 ? (
                  <p className="search-empty">Aucun résultat pour « {needle} ».</p>
                ) : (
                  <>
                    {matchingRequests.map(r => {
                      const service = r.service || services.find(s => s.slug === r.serviceSlug || s.id === r.serviceId);
                      return (
                        <button
                          key={r.id}
                          type="button"
                          className="search-result text-left w-full border-0 bg-transparent cursor-pointer p-0"
                          onClick={() => {
                            navigate(role === 'OPERATOR' ? 'operator-mission-detail' : 'admin-request-detail', r.id);
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                        >
                          <span className="tile tile-sm">
                            <Icon name={service?.icon || 'clipboard-document-list'} size={18} />
                          </span>
                          <span>
                            <strong>{r.title}</strong>
                            <small>
                              {r.tracking} · {r.status === 'pending' ? 'En attente' : r.status === 'active' ? 'En cours' : r.status === 'done' ? 'Terminée' : 'Annulée'}
                            </small>
                          </span>
                        </button>
                      );
                    })}

                    {matchingClients.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        className="search-result text-left w-full border-0 bg-transparent cursor-pointer p-0"
                        onClick={() => {
                          setActiveClientId(c.id);
                          navigate('admin-clients');
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                      >
                        <span className="avatar avatar-sm">
                          {`${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`.toUpperCase() || 'CL'}
                        </span>
                        <span>
                          <strong>{c.fullName || `${c.firstName} ${c.lastName}`}</strong>
                          <small>{c.email}</small>
                        </span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {actions}

        {role !== 'OPERATOR' && (
          <select
            aria-label="Devise d'affichage"
            title="Devise d'affichage"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{ width: 'auto', minHeight: '36px', padding: '0 8px' }}
            className="h-9 sm:h-10 rounded-xl border border-white/25 bg-white/95 text-[11px] sm:text-xs font-bold text-[#004e78] outline-none shadow-xs"
          >
            {POPULAR_CURRENCY_CODES.map((code) => (
              <option key={code} value={code}>
                {code} ({CURRENCIES[code].symbol})
              </option>
            ))}
          </select>
        )}

        <ThemeToggleButton className="!border-white/25 !bg-white/12 !text-white hover:!bg-white/22" />

        {/* Notifications Button & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            className={`icon-btn topbar-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={`Notifications, ${unreadCount} non lues`}
          >
            <Icon name="bell" size={26} />
            {unreadCount > 0 && <span className="dot-count">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-[360px] sm:w-96 bg-white rounded-2xl shadow-xl border border-[#d0e3f5] py-2 z-50">
              <div className="px-4 py-2 border-b border-[#d0e3f5] flex items-center justify-between gap-2">
                <strong className="text-sm text-[#0d1d2b]">Notifications</strong>
                <div className="flex items-center gap-2">
                  <small className="muted">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</small>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="text-xs font-semibold text-[#006191] hover:underline bg-transparent border-0 cursor-pointer p-0"
                      onClick={() => markAllNotificationsRead()}
                    >
                      Tout lire
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto overflow-x-hidden divide-y divide-[#edf4ff]">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center muted small">Aucune notification.</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        setShowNotifications(false);
                        navigateFromLink(n.href);
                      }}
                      className={`px-4 py-3 hover:bg-[#edf4ff] cursor-pointer transition ${
                        !n.read ? 'bg-[#ffdf93]/25' : ''
                      }`}
                    >
                      <p className={`text-[13px] leading-snug whitespace-normal break-words ${!n.read ? 'font-semibold text-[#0d1d2b]' : 'text-[#4c657a]'}`}>
                        {n.text}
                      </p>
                      <span className="text-[11px] text-[#6f7881] mt-1 block">
                        {n.at ? new Date(n.at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
