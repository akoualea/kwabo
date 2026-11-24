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
    <header className="public-header sticky top-0 z-40 border-b border-[#d0e3f5] bg-[#f7f9ff]/90 backdrop-blur-xl shadow-[0_2px_12px_rgba(8,77,130,0.06)]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center">
          <BrandLogo
            size="sm"
            onClick={() => navigate('public-home')}
          />
        </div>

        <form onSubmit={searchServices} role="search" className="hidden w-52 shrink-0 xl:flex 2xl:w-64">
          <label htmlFor="header-service-search" className="sr-only">Rechercher un service</label>
          <div className="flex h-10 w-full items-center rounded-full border border-[#d0e3f5] bg-white px-3.5 shadow-xs transition focus-within:border-[#006191] focus-within:ring-2 focus-within:ring-[#1593d6]/20">
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

        <nav aria-label="Navigation principale" className="hidden shrink-0 items-center gap-1 rounded-full bg-[#edf4ff] p-1 lg:flex">
          <a href="#services" onClick={e => scrollToSection('services', e)} className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-[#3f4850] transition hover:bg-[#e3efff] hover:text-[#006191]">
            Services
          </a>
          <a href="#comment-ca-marche" onClick={e => scrollToSection('comment-ca-marche', e)} className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-[#3f4850] transition hover:bg-[#e3efff] hover:text-[#006191]">
            Fonctionnement
          </a>
          <a href="#garanties" onClick={e => scrollToSection('garanties', e)} className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-[#3f4850] transition hover:bg-[#e3efff] hover:text-[#006191]">
            Confiance
          </a>
          <a href="#faq" onClick={e => scrollToSection('faq', e)} className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-[#3f4850] transition hover:bg-[#e3efff] hover:text-[#006191]">
            FAQ
          </a>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <ThemeToggleButton className="rounded-full" />
          {canInstall && (
            <button
              type="button"
              onClick={() => void promptInstall()}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#d0e3f5] bg-white px-3 text-xs font-semibold text-[#006191] transition hover:bg-[#e3efff]"
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
              className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-[#e3efff] px-3.5 text-[13px] font-semibold text-[#006191] transition hover:bg-[#d9eafd]"
            >
              <UserIcon aria-hidden="true" className="h-4 w-4" />
              Mon espace
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('login')}
              className="inline-flex h-10 items-center whitespace-nowrap rounded-full border border-[#d0e3f5] bg-white px-3.5 text-[13px] font-semibold text-[#084d82] transition hover:bg-[#e3efff]"
            >
              Connexion
            </button>
          )}

          <button
            type="button"
            onClick={goToNewRequest}
            className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#f7c531] px-3.5 text-[13px] font-bold text-[#10202e] shadow-[0_4px_16px_rgba(247,197,49,0.28)] transition hover:bg-[#e0a410]"
          >
            <PlusCircle aria-hidden="true" className="h-4 w-4" />
            <span>{currentUser ? 'Nouvelle demande' : 'Initier une demande'}</span>
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <ThemeToggleButton className="rounded-full" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(open => !open)}
            className="rounded-full bg-[#edf4ff] p-2.5 text-[#006191] transition hover:bg-[#e3efff]"
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav aria-label="Navigation mobile" className="border-t border-[#d0e3f5] bg-white px-5 py-4 shadow-xl lg:hidden">
          <form onSubmit={searchServices} role="search" className="mb-3 flex items-center rounded-full border border-[#d0e3f5] bg-[#f7f9ff] px-4 py-2">
            <Search aria-hidden="true" className="h-4 w-4 text-[#4c657a]" />
            <input
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Cherchez un service..."
              aria-label="Rechercher un service"
              className="min-w-0 flex-1 bg-transparent px-3 py-1 text-sm text-[#0d1d2b] outline-none"
            />
            <button type="submit" aria-label="Lancer la recherche">
              <ArrowRight className="h-4 w-4 text-[#006191]" />
            </button>
          </form>
          <div className="grid gap-1">
            <a href="#services" onClick={e => scrollToSection('services', e)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#3f4850] hover:bg-[#edf4ff]">Services</a>
            <a href="#comment-ca-marche" onClick={e => scrollToSection('comment-ca-marche', e)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#3f4850] hover:bg-[#edf4ff]">Comment ça marche</a>
            <a href="#garanties" onClick={e => scrollToSection('garanties', e)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#3f4850] hover:bg-[#edf4ff]">Confiance &amp; Séquestre</a>
            <a href="#faq" onClick={e => scrollToSection('faq', e)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#3f4850] hover:bg-[#edf4ff]">FAQ</a>
          </div>
          <div className="mt-3 grid gap-2 border-t border-[#d0e3f5] pt-3">
            {canInstall && (
              <button
                type="button"
                onClick={() => { void promptInstall(); setMobileMenuOpen(false); }}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#d0e3f5] bg-[#edf4ff] py-2.5 text-sm font-semibold text-[#006191]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Installer l'application
              </button>
            )}
            <button
              type="button"
              onClick={() => { currentUser ? goToAccount() : navigate('login'); setMobileMenuOpen(false); }}
              className="w-full rounded-full border border-[#d0e3f5] bg-white py-2.5 text-sm font-semibold text-[#084d82]"
            >
              {currentUser ? 'Mon espace client' : 'Se connecter'}
            </button>
            <button
              type="button"
              onClick={() => { goToNewRequest(); setMobileMenuOpen(false); }}
              className="w-full rounded-full bg-[#f7c531] py-3 text-sm font-bold text-[#10202e] shadow-sm"
            >
              {currentUser ? 'Nouvelle demande' : 'Initier une demande'}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};
