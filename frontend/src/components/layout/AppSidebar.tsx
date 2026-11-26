import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icon } from '../common/Icon';
import { BrandLogo } from '../common/BrandLogo';
import { DailyReportModal } from '../common/DailyReportModal';
import { WHATSAPP_LINK } from '../../data/kwaboData';
import {
  BENILINK_ROLE_META,
  canAccessAdminView,
  resolveRealBeniLinkRole,
} from '../../utils/benilinkWorkflow';

interface SidebarProps {
  isOpen: boolean;
  collapsed?: boolean;
  onClose: () => void;
}

interface NavSection {
  heading?: string;
  id?: string;
  label?: string;
  icon?: string;
  badge?: number | string;
  exact?: boolean;
}

/* Animations ajoutées (CSS uniquement, aucune logique modifiée) */
const SIDEBAR_ANIMATIONS = `
@keyframes kwFadeDown {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes kwFadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes kwSlideInLeft {
  from { opacity: 0; transform: translateX(-18px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes kwHeadingIn {
  from { opacity: 0; transform: translateX(-8px); letter-spacing: 0.12em; }
  to   { opacity: 1; transform: translateX(0); letter-spacing: normal; }
}
@keyframes kwBadgePop {
  0%   { opacity: 0; transform: scale(0.4); }
  60%  { opacity: 1; transform: scale(1.25); }
  100% { transform: scale(1); }
}
@keyframes kwWhatsappPulse {
  0%   { box-shadow: 0 0 0 0 rgba(0, 97, 145, 0.32); }
  70%  { box-shadow: 0 0 0 10px rgba(0, 97, 145, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 97, 145, 0); }
}
@keyframes kwActiveBar {
  from { transform: scaleY(0); opacity: 0; }
  to   { transform: scaleY(1); opacity: 1; }
}

.sidebar .sidebar-top {
  animation: kwFadeDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.sidebar .logo-mark {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.sidebar .logo:hover .logo-mark {
  transform: rotate(-8deg) scale(1.1);
}
.sidebar .sidebar-close {
  transition: transform 0.3s ease, opacity 0.2s ease;
}
.sidebar .sidebar-close:hover {
  transform: rotate(90deg);
}

.sidebar .kw-anim-heading {
  animation: kwHeadingIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.sidebar .kw-anim-link {
  position: relative;
  animation: kwSlideInLeft 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  transition: background-color 0.25s ease, color 0.25s ease, padding-left 0.25s ease;
}
.sidebar .kw-anim-link svg {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.sidebar .kw-anim-link:hover svg {
  transform: scale(1.18) rotate(-4deg);
}
.sidebar .kw-anim-link:hover {
  padding-left: calc(1em + 4px);
}
.sidebar .kw-anim-link:active {
  transform: scale(0.97);
}
.sidebar .kw-anim-link[aria-current="page"]::before {
  content: '';
  position: absolute;
  left: 0;
  top: 18%;
  bottom: 18%;
  width: 3px;
  border-radius: 3px;
  background: currentColor;
  transform-origin: center;
  animation: kwActiveBar 0.35s ease both;
}
.sidebar .kw-anim-badge {
  display: inline-block;
  animation: kwBadgePop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.sidebar .sidebar-foot {
  animation: kwFadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
}
.sidebar .side-whatsapp {
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
.sidebar .side-user {
  transition: background-color 0.25s ease, transform 0.25s ease;
}
.sidebar .side-user:hover {
  transform: translateX(3px);
}
.sidebar .side-user .avatar {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.sidebar .side-user:hover .avatar {
  transform: scale(1.1) rotate(6deg);
}
.sidebar .side-logout {
  color: #93000a;
  background: #ffdad6;
}
.sidebar .side-logout:hover {
  background: #f9c7c1;
  color: #690005;
}
.sidebar .side-logout:hover svg {
  transform: translateX(4px);
}
.sidebar .side-legal a {
  transition: opacity 0.2s ease;
}
.sidebar .side-legal a:hover {
  opacity: 0.75;
}

@media (prefers-reduced-motion: reduce) {
  .sidebar *,
  .sidebar *::before,
  .sidebar *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

export const AppSidebar: React.FC<SidebarProps> = ({ isOpen, collapsed = false, onClose }) => {
  const {
    role, currentUser, currentView, counters, navigate, logout
  } = useApp();
  const [dailyReportOpen, setDailyReportOpen] = useState(false);

  // Strict real role from authenticated backend user (no manual role switching)
  const realRole = resolveRealBeniLinkRole(currentUser?.rawRole, role);
  const realRoleLabel = BENILINK_ROLE_META[realRole]?.label || 'Utilisateur';

  // On mobile/tablet drawer (when isOpen is true), always display full labels even if desktop sidebar was collapsed
  const effectiveCollapsed = collapsed && !isOpen;

  const unreadCount = counters.unreadMessages;
  const dueInvoicesCount = counters.dueInvoices;
  const pendingReviewsCount = counters.pendingReviews;

  // Strict RBAC navigation per real backend role (API.md §4–§7)
  const rawAdminSections: { heading: string; items: NavSection[] }[] = [
    {
      heading: 'Pilotage',
      items: [
        { id: 'admin-dashboard', label: "Vue d'ensemble", icon: 'squares-2x2', exact: true },
        { id: 'admin-kpis', label: 'Indicateurs', icon: 'chart-bar' },
      ],
    },
    {
      heading: 'Opérations',
      items: [
        { id: 'admin-requests', label: 'Demandes', icon: 'clipboard-document-list' },
        { id: 'admin-messages', label: 'Messagerie clients', icon: 'chat-bubble-left-right', badge: unreadCount || undefined },
        { id: 'admin-team-chat', label: "Groupe d'équipe", icon: 'users' },
        { id: 'admin-internal-messages', label: 'Messagerie interne', icon: 'user-group' },
        { id: 'admin-providers', label: 'Prestataires & Partenaires', icon: 'briefcase' },
        { id: 'admin-invoices', label: 'Paiements', icon: 'banknotes' },
      ],
    },
    {
      heading: 'Clients',
      items: [
        { id: 'admin-clients', label: 'Clients', icon: 'users' },
        { id: 'admin-reviews', label: 'Avis', icon: 'star', badge: pendingReviewsCount || undefined },
        { id: 'admin-referrals', label: 'Parrainage', icon: 'gift' },
      ],
    },
    {
      heading: 'Configuration',
      items: [
        { id: 'admin-catalog', label: 'Catalogue', icon: 'adjustments-horizontal' },
        { id: 'admin-team', label: 'Équipe et rôles', icon: 'user-group' },
        { id: 'admin-audit', label: "Journal d'activité", icon: 'document-check' },
      ],
    },
  ];

  const adminNav: NavSection[] = rawAdminSections.flatMap((section) => {
    const allowedItems = section.items.filter(
      (item) => item.id && canAccessAdminView(realRole, item.id)
    );
    if (allowedItems.length === 0) return [];
    return [{ heading: section.heading }, ...allowedItems];
  });

  // Operator navigation (direct client messaging disabled; internal Admin channel enabled)
  const operatorNav: NavSection[] = [
    { id: 'operator-dashboard', label: 'Mes missions', icon: 'squares-2x2', exact: true },
    { id: 'operator-missions', label: 'Demandes attribuées', icon: 'clipboard-document-list' },
    { id: 'operator-internal-messages', label: 'Messagerie interne', icon: 'chat-bubble-left-right' },
  ];

  // Client navigation as defined in client.js
  const clientNav: NavSection[] = [
    { id: 'client-dashboard', label: 'Tableau de bord', icon: 'squares-2x2', exact: true },
    { id: 'client-requests', label: 'Mes demandes', icon: 'clipboard-document-list' },
    { id: 'client-new-request', label: 'Nouvelle demande', icon: 'plus-circle' },
    { id: 'client-documents', label: 'Mes documents', icon: 'folder' },
    { id: 'client-messages', label: 'Messagerie', icon: 'chat-bubble-left-right', badge: unreadCount || undefined },
    { id: 'client-invoices', label: 'Paiements & Factures', icon: 'credit-card', badge: dueInvoicesCount ? `${dueInvoicesCount}` : undefined },
    { id: 'client-referral', label: 'Parrainage', icon: 'gift' },
    { id: 'client-profile', label: 'Mon compte', icon: 'user' },
  ];

  const navItems = role === 'ADMIN' ? adminNav : role === 'OPERATOR' ? operatorNav : clientNav;

  const initials = currentUser
    ? `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase() || 'BL'
    : 'BL';

  return (
    <>
      <style>{SIDEBAR_ANIMATIONS}</style>
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${effectiveCollapsed ? 'collapsed' : ''}`} id="sidebar" aria-label="Menu de l'espace">
        <div className="sidebar-top">
          {effectiveCollapsed ? (
            <button
              type="button"
              onClick={() => {
                navigate(role === 'ADMIN' ? 'admin-dashboard' : role === 'OPERATOR' ? 'operator-dashboard' : 'client-dashboard');
                onClose();
              }}
              title="BeniLink"
              aria-label="Accueil BeniLink"
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#d0e3f5] bg-white p-1.5 shadow-sm transition hover:scale-105"
            >
              <img src="/assets/benilink-mark.png" alt="BeniLink" className="h-full w-full object-contain" />
            </button>
          ) : (
            <BrandLogo
              size="sm"
              light
              onClick={() => {
                navigate(role === 'ADMIN' ? 'admin-dashboard' : role === 'OPERATOR' ? 'operator-dashboard' : 'client-dashboard');
                onClose();
              }}
            />
          )}
          <button 
            className="sidebar-close" 
            type="button" 
            onClick={onClose} 
            aria-label="Fermer le menu"
          >
            <Icon name="x-mark" size={22} />
          </button>
        </div>

        <nav className="side-nav">
          {navItems.map((item, index) => {
            if (item.heading) {
              if (effectiveCollapsed) {
                return <hr key={`head-${index}`} className="my-2 border-0 border-t border-[#d0e3f5]" />;
              }
              return (
                <p
                  key={`head-${index}`}
                  className="side-heading kw-anim-heading"
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  {item.heading}
                </p>
              );
            }
            if (!item.id) return null;
            const active = currentView === item.id || 
              (item.id === 'admin-requests' && currentView === 'admin-request-detail') ||
              (item.id === 'client-requests' && currentView === 'client-request-detail') ||
              (item.id === 'operator-missions' && (currentView === 'operator-mission-detail' || currentView === 'admin-request-detail'));

            return (
              <button
                key={item.id}
                type="button"
                className="side-link kw-anim-link"
                style={{ animationDelay: `${index * 45}ms` }}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
                title={effectiveCollapsed ? item.label : undefined}
                onClick={() => {
                  navigate(item.id!);
                  onClose();
                }}
              >
                {item.icon && <Icon name={item.icon} size={20} />}
                {!effectiveCollapsed && <span>{item.label}</span>}
                {item.badge !== undefined && (
                  <span key={String(item.badge)} className="count kw-anim-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          {role === 'USER' && (
            <a 
              className="side-whatsapp" 
              href={WHATSAPP_LINK} 
              target="_blank" 
              rel="noopener noreferrer"
              title={collapsed ? 'WhatsApp' : undefined}
              aria-label="Contacter sur WhatsApp"
            >
              <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.214 8.214 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.237 8.237 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.63c-.19.53-1.09 1.03-1.52 1.07-.39.04-.9.06-2.58-.64-2.15-.89-3.53-3.09-3.64-3.23-.11-.15-.86-1.15-.86-2.19 0-1.04.55-1.55.74-1.76.19-.22.42-.27.56-.27.14 0 .28 0 .4.01.13.01.3.06.46.43.17.39.58 1.41.63 1.52.05.11.08.24.01.39-.07.15-.11.24-.22.37-.11.13-.23.29-.33.39-.11.11-.23.23-.1.45.13.22.58.96 1.25 1.56.86.77 1.59 1.01 1.81 1.12.22.11.35.09.48-.06.13-.15.56-.65.71-.87.15-.22.3-.19.5-.11.2.08 1.28.6 1.5.71.22.11.37.17.42.27.06.1.06.6-.13 1.13Z"/>
              </svg>
              {!effectiveCollapsed && <span>WhatsApp</span>}
            </a>
          )}

          <div 
            className="side-user cursor-pointer"
            title={effectiveCollapsed ? `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() : undefined}
            onClick={() => {
              if (role === 'USER') navigate('client-profile');
              else if (role === 'ADMIN' && canAccessAdminView(realRole, 'admin-team')) navigate('admin-team');
            }}
          >
            <span className="avatar">{initials}</span>
            {!effectiveCollapsed && (
              <span>
                <strong>{currentUser?.firstName} {currentUser?.lastName}</strong>
                <small>{role === 'USER' ? currentUser?.email : realRoleLabel}</small>
              </span>
            )}
          </div>

          {(role === 'ADMIN' || role === 'OPERATOR') && (
            <button
              className="side-link"
              type="button"
              title={collapsed ? 'Rapport journalier' : undefined}
              aria-label="Rapport journalier"
              onClick={() => {
                setDailyReportOpen(true);
                onClose();
              }}
            >
              <Icon name="document-check" size={20} />
              {!effectiveCollapsed && <span>Rapport journalier</span>}
            </button>
          )}

          <button 
            className="side-link side-logout" 
            type="button"
            title={effectiveCollapsed ? 'Se déconnecter' : undefined}
            aria-label="Se déconnecter"
            onClick={() => {
              logout();
              onClose();
            }}
          >
            <Icon name="arrow-right-on-rectangle" size={20} />
            {!effectiveCollapsed && <span>Se déconnecter</span>}
          </button>
        </div>
      </aside>

      <DailyReportModal
        isOpen={dailyReportOpen}
        onClose={() => setDailyReportOpen(false)}
      />

      {/* Overlay for mobile drawer */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  );
};
