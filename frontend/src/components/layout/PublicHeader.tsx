import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Download, Menu, PlusCircle, Search, User as UserIcon, X } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeToggleButton } from '../common/ThemeToggleButton';
import { usePwaInstall } from '../../utils/pwa';

export const PublicHeader: React.FC = () => {
  const { navigate, currentView, currentUser, role, services, openServiceModal } = useApp();
  const { canInstall, promptInstall } = usePwaInstall();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const scrollToSection = (sectionId: string, event?: React.MouseEvent<HTMLAnchorElement>) => {
    event?.preventDefault();
    setMobileMenuOpen(false);
    if (currentView !== 'public-home') {
      navigate('public-home');
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const searchServices = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const match = services.find(service =>
      [service.name, service.short, ...service.included]
        .some(value => value.toLocaleLowerCase().includes(query))
    );
    if (match) {
      openServiceModal(match);
    } else {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToAccount = () => {
    if (role === 'ADMIN') navigate('admin-dashboard');
    else if (role === 'OPERATOR') navigate('operator-dashboard');
    else navigate('client-dashboard');
  };

  const goToNewRequest = () => {
    if (!currentUser) {
      navigate('register');
    } else if (role === 'USER') {
      navigate('client-new-request');
    } else {
      goToAccount();
    }
  };

  return (
    <header className="public-header sticky top-0 z-40 border-b border-white/15 bg-gradient-to-r from-[#004b73] via-[#006191] to-[#0074ad] text-white shadow-[0_4px_20px_rgba(0,75,115,0.22)]">
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between gap-2.5 sm:gap-3 px-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 shrink-0 items-center">
          <BrandLogo
            size="sm"
            light
            onClick={() => navigate('public-home')}
          />
        </div>

        <form onSubmit={searchServices} role="search" className="hidden w-52 shrink-0 xl:flex 2xl:w-64">
          <label htmlFor="header-service-search" className="sr-only">Rechercher un service</label>
          <div className="flex h-10 w-full items-center rounded-full border border-white/25 bg-white/95 px-3.5 shadow-xs transition focus-within:border-[#f7c531] focus-within:ring-2 focus-within:ring-[#f7c531]/35">
            <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-[#4c657a]" />
            <input
              id="header-service-search"
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Rechercher un service..."
              className="min-w-0 flex-1 border-0 bg-transparent px-2.5 text-sm text-[#0d1d2b] outline-none placeholder:text-[#6f7881]"
            />
          </div>
        </form>

        <nav aria-label="Navigation principale" className="hidden shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 lg:flex">
          <a href="#services" onClick={e => scrollToSection('services', e)} className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-white/90 transition hover:bg-white/20 hover:text-white">
            Services
          </a>
          <a href="#comment-ca-marche" onClick={e => scrollToSection('comment-ca-marche', e)} className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-white/90 transition hover:bg-white/20 hover:text-white">
            Fonctionnement
          </a>
          <a href="#garanties" onClick={e => scrollToSection('garanties', e)} className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-white/90 transition hover:bg-white/20 hover:text-white">
            Confiance
          </a>
          <a href="#faq" onClick={e => scrollToSection('faq', e)} className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-white/90 transition hover:bg-white/20 hover:text-white">
            FAQ
          </a>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <ThemeToggleButton className="rounded-full !border-white/25 !bg-white/12 !text-white hover:!bg-white/22" />
          {canInstall && (
            <button
              type="button"
              onClick={() => void promptInstall()}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/25 bg-white/12 px-3 text-xs font-semibold text-white transition hover:bg-white/22"
              title="Installer l'application BeniLink"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>App</span>
            </button>
          )}

          {currentUser ? (
            <button
              type="button"
              onClick={goToAccount}
              className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border border-white/25 bg-white/15 px-3.5 text-[13px] font-semibold text-white transition hover:bg-white/25"
            >
              <UserIcon aria-hidden="true" className="h-4 w-4" />
              Mon espace
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('login')}
              className="inline-flex h-10 items-center whitespace-nowrap rounded-full border border-white/25 bg-white/12 px-3.5 text-[13px] font-semibold text-white transition hover:bg-white/22"
            >
              Connexion
            </button>
          )}

          <button
            type="button"
            onClick={goToNewRequest}
            className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#f7c531] px-3.5 text-[13px] font-bold text-[#10202e] shadow-[0_4px_16px_rgba(247,197,49,0.32)] transition hover:bg-[#ffcf44]"
          >
            <PlusCircle aria-hidden="true" className="h-4 w-4" />
            <span>{currentUser ? 'Nouvelle demande' : 'Initier une demande'}</span>
          </button>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:hidden">
          <ThemeToggleButton className="h-9 w-9 rounded-full !border-white/25 !bg-white/12 !text-white hover:!bg-white/22" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(open => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/12 text-white transition hover:bg-white/22"
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav aria-label="Navigation mobile" className="border-t border-white/15 bg-[#004b73] px-4 py-4 text-white shadow-2xl lg:hidden">
          <form onSubmit={searchServices} role="search" className="mb-3 flex items-center rounded-full border border-white/20 bg-white px-4 py-2">
            <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-[#4c657a]" />
            <input
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Cherchez un service..."
              aria-label="Rechercher un service"
              className="min-w-0 flex-1 bg-transparent px-3 py-1 text-sm text-[#0d1d2b] outline-none placeholder:text-[#6f7881]"
            />
            <button type="submit" aria-label="Lancer la recherche">
              <ArrowRight className="h-4 w-4 text-[#006191]" />
            </button>
          </form>
          <div className="grid gap-1">
            <a href="#services" onClick={e => scrollToSection('services', e)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-white/95 hover:bg-white/12">Services</a>
            <a href="#comment-ca-marche" onClick={e => scrollToSection('comment-ca-marche', e)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-white/95 hover:bg-white/12">Comment ça marche</a>
            <a href="#garanties" onClick={e => scrollToSection('garanties', e)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-white/95 hover:bg-white/12">Confiance &amp; Séquestre</a>
            <a href="#faq" onClick={e => scrollToSection('faq', e)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-white/95 hover:bg-white/12">FAQ</a>
          </div>
          <div className="mt-3 grid gap-2 border-t border-white/15 pt-3">
            {canInstall && (
              <button
                type="button"
                onClick={() => { void promptInstall(); setMobileMenuOpen(false); }}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/12 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Installer l'application
              </button>
            )}
            <button
              type="button"
              onClick={() => { currentUser ? goToAccount() : navigate('login'); setMobileMenuOpen(false); }}
              className="w-full rounded-full border border-white/25 bg-white/12 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
            >
              {currentUser ? 'Mon espace client' : 'Se connecter'}
            </button>
            <button
              type="button"
              onClick={() => { goToNewRequest(); setMobileMenuOpen(false); }}
              className="w-full rounded-full bg-[#f7c531] py-3 text-sm font-bold text-[#10202e] shadow-sm hover:bg-[#ffcf44]"
            >
              {currentUser ? 'Nouvelle demande' : 'Initier une demande'}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};
