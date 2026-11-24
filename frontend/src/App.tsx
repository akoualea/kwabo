import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { recordActivity } from './utils/internalOps';
import { PublicHeader } from './components/layout/PublicHeader';
import { PublicFooter } from './components/layout/PublicFooter';
import { AppSidebar } from './components/layout/AppSidebar';
import { AppTopbar } from './components/layout/AppTopbar';

// Public components
import { HeroSection } from './components/public/HeroSection';
import { CategoriesSection } from './components/public/CategoriesSection';
import { ServicesGrid } from './components/public/ServicesGrid';
import { HowItWorksSection } from './components/public/HowItWorksSection';
import { WhyKwaboSection } from './components/public/WhyKwaboSection';
import { DiasporaRequestsSection } from './components/public/DiasporaRequestsSection';
import { FaqSection } from './components/public/FaqSection';
import { ServiceResultsPage } from './components/public/ServiceResultsPage';
import { ServiceDetailModal } from './components/public/ServiceDetailModal';
import { LegalPage } from './components/public/LegalPage';

// Auth components
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';

// Client components
import { ClientDashboard } from './components/client/ClientDashboard';
import { ClientRequests } from './components/client/ClientRequests';
import { ClientRequestDetail } from './components/client/ClientRequestDetail';
import { ClientNewRequest } from './components/client/ClientNewRequest';
import { ClientDocuments } from './components/client/ClientDocuments';
import { ClientMessages } from './components/client/ClientMessages';
import { ClientInvoices } from './components/client/ClientInvoices';
import { ClientReferral } from './components/client/ClientReferral';
import { ClientProfile } from './components/client/ClientProfile';

// Admin components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminRequests } from './components/admin/AdminRequests';
import { AdminRequestDetail } from './components/admin/AdminRequestDetail';
import { AdminMessages } from './components/admin/AdminMessages';
import { AdminKpis } from './components/admin/AdminKpis';
import { AdminClients } from './components/admin/AdminClients';
import { AdminInvoices } from './components/admin/AdminInvoices';
import { AdminReviews } from './components/admin/AdminReviews';
import { AdminReferrals } from './components/admin/AdminReferrals';
import { AdminCatalog } from './components/admin/AdminCatalog';
import { AdminTeam } from './components/admin/AdminTeam';
import { AdminAudit } from './components/admin/AdminAudit';
import { AdminTeamChat } from './components/admin/AdminTeamChat';
import { AdminProvidersPartners } from './components/admin/AdminProvidersPartners';

// Operator components
import { OperatorDashboard } from './components/operator/OperatorDashboard';
import { OperatorMissions } from './components/operator/OperatorMissions';
import { OperatorMissionDetail } from './components/operator/OperatorMissionDetail';

// Common components
import { PhotoModal } from './components/common/PhotoModal';
import { ToastContainer } from './components/common/ToastContainer';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { PwaInstallBanner } from './components/common/PwaInstallBanner';
import { InternalMessagingView } from './components/common/InternalMessagingView';
import { BeniLinkChatbot } from './components/common/BeniLinkChatbot';

const MainAppContent: React.FC = () => {
  const { role, currentView, currentUser, authLoading, navigate } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState('Dossier visa');

  // Automatic background activity logging for operational & admin accounts (§10.1)
  useEffect(() => {
    if (!currentUser || (role !== 'ADMIN' && role !== 'OPERATOR')) return;
    if (!currentView || currentView.startsWith('public') || currentView.includes('login')) return;
    const actorName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email;
    const viewLabels: Record<string, string> = {
      'admin-dashboard': "Consultation du tableau de bord d'administration",
      'admin-requests': 'Consultation de la liste des demandes',
      'admin-request-detail': 'Ouverture d’un dossier client',
      'admin-messages': 'Consultation de la messagerie clients',
      'admin-internal-messages': 'Consultation de la messagerie interne (Agents)',
      'admin-kpis': 'Consultation des indicateurs de performance',
      'admin-clients': 'Consultation de l’annuaire clients',
      'admin-invoices': 'Consultation des paiements et encaissements',
      'admin-reviews': 'Modération des avis clients',
      'admin-referrals': 'Consultation du suivi parrainage',
      'admin-catalog': 'Gestion du catalogue des prestations',
      'admin-team': 'Gestion de l’équipe et des rôles',
      'admin-audit': 'Consultation du journal d’activité et des archives',
      'operator-dashboard': 'Consultation du tableau de bord missions',
      'operator-missions': 'Consultation des demandes attribuées',
      'operator-mission-detail': 'Suivi d’une mission terrain',
      'operator-internal-messages': 'Échange sur la messagerie interne (Administration)',
    };
    const label = viewLabels[currentView];
    if (label) {
      recordActivity({
        actorId: currentUser.id,
        actorName,
        actorRole: role === 'ADMIN' ? 'Administrateur' : 'Agent terrain',
        action: label,
      });
    }
  }, [currentUser, role, currentView]);

  if (authLoading && currentView !== 'reset-password') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f9ff] gap-3">
        <div
          className="w-10 h-10 rounded-full border-4 border-[#d0e3f5] border-t-[#006191] animate-spin"
          aria-label="Chargement"
        />
        <p className="text-sm text-[#4c657a]">Chargement de votre espace BeniLink…</p>
      </div>
    );
  }

  // Handle category selection from categories section
  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    const servicesEl = document.getElementById('services');
    if (servicesEl) {
      servicesEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectRequest = (request: string) => {
    setSelectedRequest(request);
    navigate('public-services');
  };

  // 1. PUBLIC OR AUTH VIEWS
  if (role === 'VISITOR' || currentView === 'login' || currentView === 'admin-login' || currentView === 'operator-login' || currentView === 'register' || currentView === 'forgot-password' || currentView === 'reset-password' || currentView === 'privacy' || currentView === 'cgu') {
    return (
      <div className="min-h-screen flex flex-col bg-[#f7f9ff]">
        {currentView === 'login' ? (
          <LoginPage mode="client" />
        ) : currentView === 'admin-login' ? (
          <LoginPage mode="admin" />
        ) : currentView === 'operator-login' ? (
          <LoginPage mode="operator" />
        ) : currentView === 'register' ? (
          <RegisterPage />
        ) : currentView === 'forgot-password' || currentView === 'reset-password' ? (
          <ForgotPasswordPage />
        ) : currentView === 'privacy' ? (
          <LegalPage type="confidentialite" />
        ) : currentView === 'cgu' ? (
          <LegalPage type="cgu" />
        ) : (
          <>
            <PublicHeader />
            <main className="flex-1">
              {currentView === 'public-services' ? (
                <ServiceResultsPage
                  request={selectedRequest}
                  onBack={() => navigate('public-home')}
                />
              ) : (
                <>
                  <HeroSection />
                  <CategoriesSection onSelectCategory={handleSelectCategory} />
                  <ServicesGrid 
                    selectedCategory={selectedCategory} 
                    onSelectCategory={setSelectedCategory} 
                  />
                  <HowItWorksSection />
                  <WhyKwaboSection />
                  <DiasporaRequestsSection onSelectRequest={handleSelectRequest} />
                  <FaqSection />
                </>
              )}
            </main>
            <PublicFooter />
          </>
        )}

        <ServiceDetailModal />
        <PhotoModal />
        <ConfirmDialog />
        <ToastContainer />
        <PwaInstallBanner />
        <BeniLinkChatbot />
      </div>
    );
  }

  // 2. CONNECTED WORKSPACES (Client, Admin, Operator)
  const getTopbarTitle = () => {
    switch (currentView) {
      // Client
      case 'client-dashboard': return { title: 'Tableau de bord', subtitle: `Bienvenue, ${currentUser?.firstName}` };
      case 'client-requests': return { title: 'Mes demandes', subtitle: 'Suivi de vos missions' };
      case 'client-request-detail': return { title: 'Détail de la mission', subtitle: 'Suivi et livrables' };
      case 'client-new-request': return { title: 'Nouvelle demande', subtitle: 'Sélectionnez un service' };
      case 'client-documents': return { title: 'Mes documents', subtitle: 'Vidéos 360°, rapports et reçus' };
      case 'client-messages': return { title: 'Messagerie', subtitle: 'Échanges en direct avec l\'équipe' };
      case 'client-invoices': return { title: 'Factures & Règlements', subtitle: 'Paiements sécurisés' };
      case 'client-referral': return { title: 'Programme de parrainage', subtitle: 'Gagnez 15 € de crédit' };
      case 'client-profile': return { title: 'Mon profil', subtitle: 'Paramètres du compte diaspora' };
      
      // Admin
      case 'admin-dashboard': return { title: 'Vue d\'ensemble', subtitle: 'Supervision générale BeniLink' };
      case 'admin-requests': return { title: 'Demandes de service', subtitle: 'Validation et attribution' };
      case 'admin-request-detail': return { title: 'Gestion du dossier', subtitle: 'Devis, agent et documents' };
      case 'admin-messages': return { title: 'Messagerie clients', subtitle: 'Discussions Super Admin ↔ Clients' };
      case 'admin-team-chat': return { title: 'Groupe d’équipe', subtitle: 'Coordination Super Admin & Responsables' };
      case 'admin-internal-messages': return { title: 'Messagerie interne', subtitle: 'Coordination directe Responsable des prestations ↔ Agents' };
      case 'admin-providers': return { title: 'Prestataires & Partenaires', subtitle: 'Fiches internes sans compte plateforme' };
      case 'admin-kpis': return { title: 'Indicateurs de performance', subtitle: 'Objectifs M6 & M12 du cahier des charges' };
      case 'admin-clients': return { title: 'Annuaire des clients', subtitle: 'Clients diaspora' };
      case 'admin-invoices': return { title: 'Paiements & Encaissements', subtitle: 'Journal financier' };
      case 'admin-reviews': return { title: 'Modération des avis', subtitle: 'Validation des témoignages' };
      case 'admin-referrals': return { title: 'Parrainage', subtitle: 'Parrains, filleuls et récompenses' };
      case 'admin-catalog': return { title: 'Catalogue des services', subtitle: 'Gestion des prestations (tarifs sur devis)' };
      case 'admin-team': return { title: 'Équipe & Permissions', subtitle: 'Coordination et agents' };
      case 'admin-audit': return { title: 'Journal d\'audit', subtitle: 'Traçabilité des opérations' };
      
      // Operator
      case 'operator-dashboard': return { title: `Bonjour ${currentUser?.firstName || 'Maxime'}`, subtitle: 'Vos missions sur le terrain' };
      case 'operator-missions': return { title: 'Demandes attribuées', subtitle: 'Suivis et interventions' };
      case 'operator-mission-detail': return { title: 'Détail de la mission', subtitle: 'Suivi, documents et livrables' };
      case 'operator-internal-messages': return { title: 'Messagerie interne', subtitle: 'Coordination directe avec l’Administration centrale' };

      default: return { title: 'BeniLink', subtitle: 'Trust Hub Diaspora' };
    }
  };

  const { title, subtitle } = getTopbarTitle();

  return (
    <div className="app-wrapper">
      <div className={`app ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Sidebar */}
        <AppSidebar
          isOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="app-main">
          <AppTopbar 
            title={title} 
            subtitle={subtitle} 
            onOpenSidebar={() => setSidebarOpen(true)}
            sidebarCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(c => !c)}
          />

          <main className="app-content" id="main" tabIndex={-1}>
            {/* View router */}
            {/* CLIENT VIEWS */}
            {currentView === 'client-dashboard' && <ClientDashboard />}
            {currentView === 'client-requests' && <ClientRequests />}
            {currentView === 'client-request-detail' && <ClientRequestDetail />}
            {currentView === 'client-new-request' && <ClientNewRequest />}
            {currentView === 'client-documents' && <ClientDocuments />}
            {currentView === 'client-messages' && <ClientMessages />}
            {currentView === 'client-invoices' && <ClientInvoices />}
            {currentView === 'client-referral' && <ClientReferral />}
            {currentView === 'client-profile' && <ClientProfile />}

            {/* ADMIN VIEWS */}
            {currentView === 'admin-dashboard' && <AdminDashboard />}
            {currentView === 'admin-requests' && <AdminRequests />}
            {currentView === 'admin-request-detail' && <AdminRequestDetail />}
            {currentView === 'admin-messages' && <AdminMessages />}
            {currentView === 'admin-team-chat' && <AdminTeamChat />}
            {currentView === 'admin-internal-messages' && <InternalMessagingView />}
            {currentView === 'admin-providers' && <AdminProvidersPartners />}
            {currentView === 'admin-kpis' && <AdminKpis />}
            {currentView === 'admin-clients' && <AdminClients />}
            {currentView === 'admin-invoices' && <AdminInvoices />}
            {currentView === 'admin-reviews' && <AdminReviews />}
            {currentView === 'admin-referrals' && <AdminReferrals />}
            {currentView === 'admin-catalog' && <AdminCatalog />}
            {currentView === 'admin-team' && <AdminTeam />}
            {currentView === 'admin-audit' && <AdminAudit />}

            {/* OPERATOR VIEWS */}
            {currentView === 'operator-dashboard' && <OperatorDashboard />}
            {currentView === 'operator-missions' && <OperatorMissions />}
            {currentView === 'operator-mission-detail' && <OperatorMissionDetail />}
            {currentView === 'operator-internal-messages' && <InternalMessagingView />}
          </main>
        </div>
      </div>

      <ServiceDetailModal />
      <PhotoModal />
      <ConfirmDialog />
      <ToastContainer />
      <PwaInstallBanner />
      {role === 'USER' && <BeniLinkChatbot />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
