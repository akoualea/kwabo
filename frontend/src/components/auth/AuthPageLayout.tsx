import React from 'react';
import {
  ArrowLeft,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WHATSAPP_LINK } from '../../data/kwaboData';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeToggleButton } from '../common/ThemeToggleButton';

const authFieldsCss = `
.auth-benilink input:not([type="checkbox"]),
.auth-benilink select {
  background-color: #ffffff;
  border-color: #d0e3f5;
  color: #0d1d2b;
}
.auth-benilink input:not([type="checkbox"]):focus,
.auth-benilink select:focus {
  border-color: #006191;
  box-shadow: 0 0 0 3px rgba(21, 147, 214, 0.15);
}
`;

interface Props {
  children: React.ReactNode;
}

export const AuthPageLayout: React.FC<Props> = ({ children }) => {
  const { navigate, currentView } = useApp();

  const isRegister = currentView === 'register';
  const isRecovery = currentView === 'forgot-password' || currentView === 'reset-password';

  const panelConfig = isRegister
    ? {
        photo: '/assets/auth-register.jpg',
        photoAlt: 'Construction de villa moderne au Bénin',
        title: 'Bienvenue sur BeniLink !',
        subtitle:
          'Créez votre compte gratuit en 2 minutes et confiez vos projets au Bénin à une équipe locale fiable et transparente.',
      }
    : isRecovery
      ? {
          photo: '/assets/auth-login.jpg',
          photoAlt: 'Équipe BeniLink au Bénin',
          title: 'Récupération sécurisée',
          subtitle:
            "Réinitialisez votre mot de passe en quelques instants pour retrouver l'accès à votre espace BeniLink.",
        }
      : {
          photo: '/assets/auth-login.jpg',
          photoAlt: 'Équipe BeniLink devant un projet immobilier au Bénin',
          title: 'Bon retour !',
          subtitle:
            "Connectez-vous pour suivre l'avancement de vos dossiers, consulter vos preuves certifiées et échanger avec notre coordination.",
        };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0d1d2b]">
      <style>{authFieldsCss}</style>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-[#d0e3f5] bg-[#f7f9ff]/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(8,77,130,0.04)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <BrandLogo subtitle="Portail Diaspora" onClick={() => navigate('public-home')} />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <ThemeToggleButton className="h-9 w-9 rounded-full" />
            <button
              type="button"
              onClick={() => navigate('public-home')}
              aria-label="Accueil"
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3.5 py-2 text-xs font-semibold text-[#3f4850] transition hover:bg-[#d9eafd] hover:text-[#0d1d2b]"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Accueil</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('login')}
              className="hidden sm:inline-flex items-center rounded-full px-3.5 py-2 text-xs font-semibold text-[#3f4850] transition hover:bg-[#d9eafd] hover:text-[#0d1d2b]"
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => navigate('register')}
              className="inline-flex items-center whitespace-nowrap rounded-full bg-[#006191] px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white shadow-sm transition hover:bg-[#084d82]"
            >
              Ouvrir un compte
            </button>
          </div>
        </div>
      </header>

      {/* Full-bleed open split layout (no nested card frames) */}
      <main className="grid flex-1 grid-cols-1 lg:grid-cols-12">
        {/* Left contextual full-bleed photo with centered text */}
        <section className="relative hidden min-h-[560px] flex-col items-center justify-center overflow-hidden p-10 text-center lg:col-span-6 lg:flex xl:p-14">
          <img
            src={panelConfig.photo}
            alt={panelConfig.photoAlt}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[#041d33]/20 via-[#041d33]/30 to-[#041d33]/45"
          />

          <div className="relative z-10 flex max-w-md flex-col items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white xl:text-[40px] drop-shadow-[0_3px_14px_rgba(0,0,0,0.75)]">
              {panelConfig.title}
            </h1>
            <p className="text-sm font-medium leading-relaxed text-white sm:text-base drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              {panelConfig.subtitle}
            </p>
          </div>
        </section>

        {/* Right open form area (no card border or frame) */}
        <section className="flex items-center justify-center bg-white px-5 py-10 sm:px-10 lg:col-span-6 lg:py-12">
          <div className="auth-benilink w-full max-w-[460px]">
            {children}
          </div>
        </section>
      </main>

      {/* Compact Legal Footer */}
      <footer className="border-t border-[#d0e3f5] bg-[#edf4ff] py-4 text-xs text-[#4c657a]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 font-semibold sm:px-6 lg:px-8">
          <button type="button" onClick={() => navigate('privacy')} className="hover:text-[#006191]">
            Confidentialité
          </button>
          <button type="button" onClick={() => navigate('cgu')} className="hover:text-[#006191]">
            Conditions d'utilisation
          </button>
        </div>
      </footer>

      {/* Floating WhatsApp Support */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter BeniLink sur WhatsApp"
        className="fixed bottom-5 right-5 z-30 flex h-13 w-13 items-center justify-center rounded-full bg-[#006191] text-white shadow-xl transition hover:scale-105 hover:bg-[#084d82]"
      >
        <span className="relative flex h-7 w-7 items-center justify-center">
          <MessageCircle aria-hidden="true" className="absolute inset-0 h-7 w-7 text-white" />
          <Phone aria-hidden="true" className="h-3.5 w-3.5 -rotate-12 text-white" />
        </span>
      </a>
    </div>
  );
};
