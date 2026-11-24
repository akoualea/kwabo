import React, { useEffect, useState } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  Gavel,
  MessageCircle,
  Receipt,
  ShieldCheck,
  Shield,
  UserRoundPlus,
  Video,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WHATSAPP_LINK } from '../../data/kwaboData';

const SHOWCASE_SLIDES = [
  {
    src: '/assets/why-slide-1.jpg',
    label: 'Contrôle technique & Plans sur site',
    tag: 'Vidéo 360° HD',
    position: 'object-top',
  },
  {
    src: '/assets/why-slide-2.jpg',
    label: 'Suivi en direct · Reportages & Vidéos',
    tag: 'Suivi en direct',
    position: 'object-top',
  },
  {
    src: '/assets/why-slide-3.jpg',
    label: 'Suivi détaillé · Rapports & Preuves datées',
    tag: 'Suivi détaillé',
    position: 'object-center',
  },
];

const transparencyMotionCss = `
@keyframes benilinkFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
@keyframes benilinkBadgeFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}
@keyframes benilinkKenBurns {
  0% { transform: scale(1); }
  100% { transform: scale(1.09); }
}
`;

const institutionalPillars = [
  {
    icon: Shield,
    title: 'Confidentialité Stricte',
    description: 'Données privées protégées et échanges tracés selon des standards stricts.',
  },
  {
    icon: BadgeCheck,
    title: 'Agents & Experts Vérifiés',
    description: 'Intervenants qualifiés sur place à Cotonou, Calavi, Porto-Novo et Parakou.',
  },
  {
    icon: Receipt,
    title: 'Zéro Frais Cachés',
    description: 'Devis forfaitaire clair sans intermédiaire informel ni commissions occultes.',
  },
  {
    icon: Video,
    title: 'Preuves Horodatées',
    description: 'Vidéos 360°, photos géolocalisées et reçus scannés à chaque étape.',
  },
];

export const WhyKwaboSection: React.FC = () => {
  const { navigate, currentUser, role } = useApp();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide(prev => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  const handleAction = () => {
    if (!currentUser) navigate('register');
    else if (role === 'USER') navigate('client-new-request');
    else if (role === 'ADMIN') navigate('admin-dashboard');
    else navigate('operator-dashboard');
  };

  return (
    <div id="garanties">
      <style>{transparencyMotionCss}</style>
      {/* 1. Le Sceau de Confiance Diaspora */}
      <section className="w-full bg-[#edf4ff] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-[#d0e3f5] bg-white p-6 shadow-md sm:p-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="flex flex-col gap-5 lg:col-span-7">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#d1e4ff] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#001d36]">
                <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
                Sceau de Confiance Diaspora
              </div>
              <h2 className="font-display text-3xl font-semibold leading-snug text-[#0d1d2b] sm:text-[36px]">
                La fin de l’opacité et des mauvaises surprises.
              </h2>
              <p className="text-sm leading-7 text-[#3f4850] sm:text-base">
                Nous avons conçu BeniLink pour offrir à la diaspora béninoise le même niveau d’exigence contractuelle, juridique et technologique que les meilleurs standards internationaux.
              </p>

              <div className="grid grid-cols-1 gap-x-8 gap-y-6 pt-3 sm:grid-cols-2">
                {institutionalPillars.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e3efff] text-[#006191]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-sans text-sm font-bold text-[#0d1d2b]">{title}</h3>
                      <p className="text-xs leading-relaxed text-[#4c657a]">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#d0e3f5] bg-[#edf4ff] p-8 text-center lg:col-span-5">
              <div className="relative mb-4 flex h-44 w-44 items-center justify-center">
                <svg className="h-full w-full text-[#006191]" viewBox="0 0 100 100" aria-hidden="true">
                  <circle
                    className="animate-[spin_25s_linear_infinite] origin-center"
                    cx="50"
                    cy="50"
                    fill="none"
                    opacity="0.45"
                    r="44"
                    stroke="currentColor"
                    strokeDasharray="4 3"
                    strokeWidth="2"
                  />
                  <circle cx="50" cy="50" fill="currentColor" opacity="0.08" r="38" />
                  <path d="M50 20 L75 32 V52 C75 66 64 77 50 82 C36 77 25 66 25 52 V32 Z" fill="#006191" />
                  <path
                    d="M42 50 L48 56 L59 44"
                    fill="none"
                    stroke="#ffdf93"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4.2"
                  />
                </svg>
              </div>
              <span className="font-sans text-lg font-bold text-[#0d1d2b]">Certification Bénin-Diaspora</span>
              <span className="mt-1 text-xs text-[#4c657a]">Protocole d'audit vérifié &amp; traçable</span>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d0e3f5] bg-white px-4 py-1.5 shadow-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-[#006191] animate-pulse" aria-hidden="true" />
                <span className="text-[11px] font-semibold text-[#0d1d2b]">Contrat officiel · Devis sur mesure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Gradient Transparency & Direct Support Banner */}
      <section className="w-full bg-[#f7f9ff] px-4 py-12 sm:px-6 lg:px-8">
        <div className="why-banner-card relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-[#006191] to-[#296197] p-7 text-white shadow-xl sm:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-[#ffdf93]/20 blur-2xl" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="flex flex-col lg:col-span-8">
              <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#ffdf93] backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Pourquoi BeniLink
              </div>
              <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                La transparence, notre seule loi.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#d4e4f8] sm:text-base">
                Chaque intervention est entièrement documentée : vidéo 360°, photos datées, reçus scannés pour chaque dépense et rapport écrit. Votre sérénité à distance est notre produit principal.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-8">
                <div>
                  <span className="font-display block text-4xl font-bold text-[#ffdf93] tnum">100%</span>
                  <span className="text-xs font-semibold text-[#d4e4f8]">Preuves horodatées &amp; suivies</span>
                </div>
                <div className="hidden h-10 w-px bg-white/20 sm:block" />
                <div>
                  <span className="font-display block text-4xl font-bold text-[#ffdf93] tnum">1 seul</span>
                  <span className="text-xs font-semibold text-[#d4e4f8]">Interlocuteur dédié (Super Admin)</span>
                </div>
              </div>

              <div className="mt-7 flex flex-col items-stretch gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <button
                  type="button"
                  onClick={handleAction}
                  className="inline-flex min-h-[42px] sm:min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#ffdf93] px-5 py-2 text-xs sm:text-sm font-bold text-[#241a00] shadow-md transition hover:bg-[#f7c531]"
                >
                  <UserRoundPlus aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span>{currentUser ? 'Lancer une mission' : 'Créer mon compte gratuit'}</span>
                </button>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="why-whatsapp-link inline-flex min-h-[42px] sm:min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/40 bg-[#084d82]/70 px-5 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-[#084d82]"
                >
                  <MessageCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-white" />
                  <span>Écrire sur WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="flex justify-center lg:col-span-4">
              <div className="relative w-full max-w-[330px]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[#f7c531]/25 blur-2xl"
                />

                <div
                  style={{ animation: 'benilinkFloat 6s ease-in-out infinite' }}
                  className="relative h-72 w-full overflow-hidden rounded-3xl border-2 border-[#ffdf93]/55 shadow-[0_24px_55px_rgba(4,28,52,0.45)]"
                >
                  {SHOWCASE_SLIDES.map((slide, index) => {
                    const isActive = index === activeSlide;
                    return (
                      <div
                        key={slide.src}
                        aria-hidden={!isActive}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                          isActive ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <img
                          src={slide.src}
                          alt={slide.label}
                          style={{ animation: 'benilinkKenBurns 7s ease-out infinite alternate' }}
                          className={`h-full w-full object-cover ${slide.position}`}
                        />
                      </div>
                    );
                  })}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#052947]/85 via-[#052947]/20 to-transparent" />

                  <div className="absolute inset-x-4 bottom-3.5 z-10 flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-white drop-shadow">
                      {SHOWCASE_SLIDES[activeSlide].label}
                    </span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {SHOWCASE_SLIDES.map((slide, index) => (
                        <button
                          key={slide.src}
                          type="button"
                          onClick={() => setActiveSlide(index)}
                          aria-label={`Afficher ${slide.label}`}
                          className={`h-2 rounded-full transition-all ${
                            index === activeSlide
                              ? 'w-5 bg-[#f7c531]'
                              : 'w-2 bg-white/55 hover:bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top-left floating badge */}
                <div
                  style={{ animation: 'benilinkBadgeFloat 4.5s ease-in-out infinite' }}
                  className="absolute -top-2 left-2 sm:-top-3 sm:-left-3 z-20 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#084d82]/90 px-3 sm:px-3.5 py-1.5 text-[11px] font-bold text-white shadow-lg backdrop-blur-md"
                >
                  <span className="h-2 w-2 rounded-full bg-[#f7c531] animate-pulse" aria-hidden="true" />
                  <span>{SHOWCASE_SLIDES[activeSlide].tag}</span>
                </div>

                {/* Bottom-right floating badge */}
                <div
                  style={{ animation: 'benilinkBadgeFloat 5.2s ease-in-out 0.8s infinite' }}
                  className="absolute -bottom-2 right-2 sm:-bottom-3 sm:-right-2 z-20 inline-flex items-center gap-1.5 rounded-full border border-[#ffdf93]/50 bg-[#084d82]/95 px-3 sm:px-3.5 py-1.5 text-[11px] font-bold text-white shadow-lg backdrop-blur-md"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#f7c531]" aria-hidden="true" />
                  <span>100% certifié</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
