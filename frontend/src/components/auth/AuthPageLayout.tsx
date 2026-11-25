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

      {/* Top Navigation Bar — Bleu BeniLink, 100% responsive */}
      <header className="auth-blue-header sticky top-0 z-40 border-b border-white/15 bg-gradient-to-r from-[#004b73] via-[#006191] to-[#0074ad] text-white shadow-[0_4px_20px_rgba(0,75,115,0.22)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 shrink items-center">
            <BrandLogo
              size="sm"
              light
              subtitle="Portail Diaspora"
              onClick={() => navigate('public-home')}
              className="max-w-full"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <ThemeToggleButton className="h-9 w-9 rounded-full !border-white/25 !bg-white/12 !text-white hover:!bg-white/22" />
            <button
              type="button"
              onClick={() => navigate('public-home')}
              aria-label="Retour à l'accueil"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 sm:px-3.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Accueil</span>
            </button>
            {isRegister ? (
              <button
                type="button"
                onClick={() => navigate('login')}
                className="inline-flex h-9 items-center whitespace-nowrap rounded-full bg-[#f7c531] px-3 sm:px-4 text-xs font-bold text-[#10202e] shadow-sm transition hover:bg-[#ffcf44]"
              >
                Connexion
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('login')}
                  className="hidden sm:inline-flex h-9 items-center rounded-full border border-white/20 bg-white/10 px-3.5 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => navigate('register')}
                  className="inline-flex h-9 items-center whitespace-nowrap rounded-full bg-[#f7c531] px-3 sm:px-4 text-xs font-bold text-[#10202e] shadow-sm transition hover:bg-[#ffcf44]"
                >
                  <span className="sm:hidden">S'inscrire</span>
                  <span className="hidden sm:inline">Ouvrir un compte</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Full-bleed open split layout — image visible sur mobile ET desktop */}
      <main className="grid flex-1 grid-cols-1 lg:grid-cols-12">
        {/* Contextual full-bleed photo with centered text (visible on mobile, tablet & desktop) */}
        <section className="relative flex min-h-[215px] sm:min-h-[270px] lg:min-h-[560px] flex-col items-center justify-center overflow-hidden px-5 py-8 text-center lg:col-span-6 lg:p-10 xl:p-14">
          <img
            src={panelConfig.photo}
            alt={panelConfig.photoAlt}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[#041d33]/35 via-[#041d33]/40 to-[#041d33]/60"
          />

          <div className="relative z-10 flex max-w-md flex-col items-center gap-2 sm:gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white xl:text-[40px] drop-shadow-[0_3px_14px_rgba(0,0,0,0.75)]">
              {panelConfig.title}
            </h1>
            <p className="text-xs sm:text-sm font-medium leading-relaxed text-white/95 md:text-base drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              {panelConfig.subtitle}
            </p>
          </div>
        </section>

        {/* Right open form area (generous bottom padding so floating buttons never overlap content on mobile) */}
        <section className="flex items-center justify-center bg-white px-4 pt-7 pb-28 sm:px-10 sm:py-10 lg:col-span-6 lg:py-12">
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
