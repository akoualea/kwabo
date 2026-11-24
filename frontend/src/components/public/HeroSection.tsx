import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Compass,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  PlayCircle,
  Search,
  Zap,
} from 'lucide-react';
import { WHATSAPP_LINK } from '../../data/kwaboData';
import { HowItWorksVideoModal } from './HowItWorksVideoModal';

const QUICK_COMMUNES = ['Cotonou', 'Abomey-Calavi', 'Ouidah', 'Porto-Novo', 'Parakou'];

export const HeroSection: React.FC = () => {
  const { services, currentUser, role, openServiceModal, navigate } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [communeQuery, setCommuneQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const filteredServices = searchQuery.trim()
    ? services.filter(service =>
        [service.name, service.short, ...service.included]
          .some(value => value.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()))
      )
    : [];

  const handleSearch = (query: string) => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const service = services.find(item =>
      [item.name, item.short, ...item.included]
        .some(value => value.toLocaleLowerCase().includes(normalizedQuery))
    );
    if (service) {
      openServiceModal(service);
      setShowResults(false);
    } else {
      setShowResults(true);
    }
  };

  const handlePrimaryCta = () => {
    if (!currentUser) {
      navigate('register');
    } else if (role === 'USER') {
      navigate('client-new-request');
    } else if (role === 'ADMIN') {
      navigate('admin-dashboard');
    } else {
      navigate('operator-dashboard');
    }
  };

  return (
    <>
      {/* Hero Split Section */}
      <section className="hero-surface relative w-full overflow-hidden bg-gradient-to-b from-[#f7f9ff] via-[#edf4ff] to-[#f7f9ff] px-4 pt-10 pb-14 sm:px-6 lg:px-8 lg:pt-14 lg:pb-16">
        <div aria-hidden="true" className="hero-glow pointer-events-none absolute -top-28 right-12 h-96 w-96 rounded-full bg-[#ffdf93]/35 blur-3xl" />
        <div aria-hidden="true" className="hero-glow pointer-events-none absolute top-1/2 -left-24 h-80 w-80 rounded-full bg-[#cbe6ff]/50 blur-3xl" />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* Left Column (7 cols) directly on background */}
          <div className="flex flex-col items-start lg:col-span-7">
            <style>{`
              @keyframes heroLetterSlideIn {
                0% { opacity: 0; transform: translateX(-10px); }
                100% { opacity: 1; transform: translateX(0); }
              }
              .hero-letter {
                display: inline-block;
                opacity: 0;
                animation: heroLetterSlideIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;
              }
              @media (prefers-reduced-motion: reduce) {
                .hero-letter {
                  opacity: 1 !important;
                  transform: none !important;
                  animation: none !important;
                }
              }
            `}</style>
            <h1
              aria-label="Connectez vos ambitions au Bénin en toute sérénité."
              className="font-display text-[30px] font-bold leading-[1.14] tracking-tight text-[#0d1d2b] sm:text-5xl lg:text-[50px]"
            >
              {(() => {
                const words: Array<{ text: string; accent?: boolean }> = [
                  { text: 'Connectez' },
                  { text: 'vos' },
                  { text: 'ambitions' },
                  { text: 'au' },
                  { text: 'Bénin' },
                  { text: 'en' },
                  { text: 'toute' },
                  { text: 'sérénité', accent: true },
                  { text: '.' },
                ];
                let charIndex = 0;
                return words.map((word, wIdx) => (
                  <React.Fragment key={wIdx}>
                    <span
                      aria-hidden="true"
                      className={`inline-block whitespace-nowrap ${word.accent ? 'italic text-[#006191]' : ''}`}
                    >
                      {Array.from(word.text).map((ch, cIdx) => {
                        const delayMs = charIndex * 32;
                        charIndex += 1;
                        return (
                          <span
                            key={cIdx}
                            className="hero-letter"
                            style={{ animationDelay: `${delayMs}ms` }}
                          >
                            {ch}
                          </span>
                        );
                      })}
                    </span>
                    {wIdx < words.length - 2 ? ' ' : ''}
                  </React.Fragment>
                ));
              })()}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#3f4850] sm:text-lg">
              Foncier certifié, suivi de chantiers, démarches administratives ANIP et soutien médical aux proches : pilotez vos projets à distance sans intermédiaire opaque, avec preuves horodatées et transparence financière.
            </p>

            {/* Primary CTAs */}
            <div className="mt-6 flex w-full flex-col items-stretch gap-2.5 sm:mt-7 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={handlePrimaryCta}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#ffdf93] px-5 py-2.5 text-xs sm:text-sm font-bold text-[#241a00] shadow-md transition hover:bg-[#f7c531]"
              >
                <span>Initier une demande sécurisée</span>
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#006191] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition hover:bg-[#084d82]"
              >
                <PlayCircle className="h-4 w-4 shrink-0 text-[#ffdf93]" aria-hidden="true" />
                <span>Voir comment ça marche (2 min)</span>
              </button>
            </div>

            {/* Integrated Glassmorphic Search Card */}
            <div className="relative mt-8 w-full rounded-2xl border border-white/75 bg-white/80 p-2.5 shadow-[0_16px_40px_-4px_rgba(8,77,130,0.14)] backdrop-blur-xl">
              <form
                role="search"
                onSubmit={event => {
                  event.preventDefault();
                  handleSearch(searchQuery);
                }}
                className="flex flex-col items-center gap-2 md:flex-row"
              >
                <div className="flex w-full flex-1 items-center gap-2.5 rounded-xl bg-[#edf4ff] px-3.5 py-2.5">
                  <Search className="h-5 w-5 shrink-0 text-[#006191]" aria-hidden="true" />
                  <div className="flex w-full flex-col text-left">
                    <label htmlFor="hero-service-input" className="text-[11px] font-bold text-[#3f4850]">
                      Type de prestation
                    </label>
                    <input
                      id="hero-service-input"
                      type="search"
                      value={searchQuery}
                      onChange={event => {
                        setSearchQuery(event.target.value);
                        setShowResults(true);
                      }}
                      onFocus={() => setShowResults(Boolean(searchQuery.trim()))}
                      placeholder="Foncier, Acte ANIP, Chantier, Santé..."
                      className="w-full border-0 bg-transparent p-0 text-sm text-[#0d1d2b] outline-none placeholder:text-[#6f7881]"
                      style={{ minHeight: '22px' }}
                    />
                  </div>
                </div>

                <div className="flex w-full flex-1 items-center gap-2.5 rounded-xl bg-[#edf4ff] px-3.5 py-2.5">
                  <MapPin className="h-5 w-5 shrink-0 text-[#765b00]" aria-hidden="true" />
                  <div className="flex w-full flex-col text-left">
                    <label htmlFor="hero-commune-input" className="text-[11px] font-bold text-[#3f4850]">
                      Commune d'intervention
                    </label>
                    <input
                      id="hero-commune-input"
                      type="text"
                      value={communeQuery}
                      onChange={event => setCommuneQuery(event.target.value)}
                      placeholder="Cotonou, Calavi, Parakou, Ouidah..."
                      className="w-full border-0 bg-transparent p-0 text-sm text-[#0d1d2b] outline-none placeholder:text-[#6f7881]"
                      style={{ minHeight: '22px' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#006191] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#084d82] md:w-auto"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  <span>Rechercher</span>
                </button>
              </form>

              {showResults && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-[#d0e3f5] bg-white text-left shadow-2xl">
                  {filteredServices.length === 0 ? (
                    <p className="p-4 text-sm text-[#4c657a]">
                      Aucun service ne correspond à « {searchQuery} ».
                    </p>
                  ) : (
                    filteredServices.slice(0, 5).map(service => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          openServiceModal(service);
                          setShowResults(false);
                        }}
                        className="flex w-full items-center justify-between gap-4 border-b border-[#edf4ff] px-4 py-3 text-left last:border-0 hover:bg-[#edf4ff]"
                      >
                        <span>
                          <span className="block text-sm font-semibold text-[#0d1d2b]">{service.name}</span>
                          <span className="block line-clamp-1 text-xs text-[#4c657a]">{service.short}</span>
                        </span>
                        <span className="shrink-0 text-xs font-bold text-[#006191]">Sur devis</span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Quick city chips */}
              <div className="flex flex-wrap items-center gap-1.5 px-1.5 pt-2.5">
                <span className="mr-1 text-[11px] font-bold text-[#3f4850]">Villes principales :</span>
                {QUICK_COMMUNES.map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setCommuneQuery(city);
                      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                      communeQuery === city
                        ? 'bg-[#006191] text-white'
                        : 'bg-[#e3efff] text-[#296197] hover:bg-[#d1e4ff]'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Animated Photo Collage with local photos & Glassmorphic Badges */}
          <div className="relative flex min-h-[330px] sm:min-h-[420px] items-center justify-center lg:col-span-5">
            <style>{`
              @keyframes heroOrbitSpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes heroCardMain {
                0%, 100% { transform: translateY(0px) rotate(-3deg); }
                50% { transform: translateY(-10px) rotate(2.5deg); }
              }
              @keyframes heroCardTopRight {
                0%, 100% { transform: translate(0px, 0px) rotate(5deg); }
                50% { transform: translate(8px, -12px) rotate(11deg); }
              }
              @keyframes heroCardBottomLeft {
                0%, 100% { transform: translate(0px, 0px) rotate(-5deg); }
                50% { transform: translate(-8px, -10px) rotate(-11deg); }
              }
              @keyframes heroBadgeDrift {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-6px); }
              }
              @keyframes heroBadgeDriftAlt {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-7px); }
              }
              .hero-collage-anim { will-change: transform; }
              @media (prefers-reduced-motion: reduce) {
                .hero-collage-anim { animation: none !important; }
              }
            `}</style>

            <div
              aria-hidden="true"
              style={{ animation: 'heroOrbitSpin 22s linear infinite' }}
              className="hero-collage-anim pointer-events-none absolute h-[280px] w-[280px] rounded-full border-2 border-dashed border-[#f2c02c]/70 sm:h-[400px] sm:w-[400px]"
            />
            <div
              aria-hidden="true"
              style={{ animation: 'heroOrbitSpin 32s linear infinite reverse' }}
              className="hero-collage-anim pointer-events-none absolute h-[220px] w-[220px] rounded-full border border-dashed border-[#1593d6]/40 sm:h-[320px] sm:w-[320px]"
            />

            {/* Main Card */}
            <div
              style={{ animation: 'heroCardMain 6.5s ease-in-out infinite' }}
              className="hero-collage-anim relative z-20 h-64 w-52 sm:h-80 sm:w-64 overflow-hidden rounded-3xl border-4 border-white shadow-xl"
            >
              <img
                src="/assets/hero-villa.jpg"
                alt="Villa moderne et suivi de chantier au Bénin"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1d2b]/75 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="rounded-full bg-[#006191]/90 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-sm">
                  Chantier Calavi
                </span>
                <p className="mt-1 text-xs font-semibold">Contrôle terrain &amp; vidéo 360°</p>
              </div>
            </div>

            {/* Top Right Card */}
            <div
              style={{ animation: 'heroCardTopRight 7.5s ease-in-out infinite' }}
              className="hero-collage-anim absolute -top-2 right-0 z-10 h-32 w-32 sm:h-44 sm:w-44 overflow-hidden rounded-2xl border-2 border-white shadow-lg"
            >
              <img
                src="/assets/auth-login.jpg"
                alt="Suivi de chantier au Bénin avec notre équipe locale"
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1d2b]/65 via-transparent to-transparent" />
              <span className="absolute bottom-2 left-2 rounded-full bg-[#296197]/90 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
                Littoral Bénin
              </span>
            </div>

            {/* Bottom Left Card */}
            <div
              style={{ animation: 'heroCardBottomLeft 7s ease-in-out 0.6s infinite' }}
              className="hero-collage-anim absolute -bottom-4 left-0 z-30 h-32 w-36 sm:h-40 sm:w-48 overflow-hidden rounded-2xl border-2 border-white shadow-lg"
            >
              <img
                src="/assets/hero-ganvie.jpg"
                alt="Ganvié, patrimoine du Bénin"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1d2b]/65 via-transparent to-transparent" />
              <span className="absolute bottom-2 left-2 rounded-full bg-[#d3a500]/95 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
                Patrimoine &amp; Terroir
              </span>
            </div>

            {/* Floating Status Cards (crisp text, no sub-pixel rotation blur) */}
            <div
              style={{ animation: 'heroBadgeDrift 5s ease-in-out infinite' }}
              className="absolute top-6 left-0 z-40 flex items-center gap-2.5 rounded-2xl border border-[#d0e3f5] bg-white px-3.5 py-2.5 shadow-lg antialiased sm:-left-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ffdf93] text-xs font-bold text-[#241a00]">
                ⚡
              </span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[#0d1d2b]">Devis sur mesure</span>
                <span className="text-[11px] font-medium text-[#3f4850]">Étude par notre équipe</span>
              </div>
            </div>

            <div
              style={{ animation: 'heroBadgeDriftAlt 5.6s ease-in-out 0.8s infinite' }}
              className="absolute bottom-14 right-0 z-40 flex items-center gap-2.5 rounded-2xl border border-[#d0e3f5] bg-white px-3.5 py-2.5 shadow-lg antialiased sm:-right-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#006191] text-xs font-bold text-white">
                ✓
              </span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[#0d1d2b]">Rapport terrain validé</span>
                <span className="text-[11px] font-medium text-[#3f4850]">Photos HD &amp; Reçus</span>
              </div>
            </div>

            <div
              style={{ animation: 'heroBadgeDrift 6s ease-in-out 1.4s infinite' }}
              className="absolute -bottom-7 right-12 z-40 hidden items-center gap-2.5 rounded-2xl border border-[#d0e3f5] bg-white px-3.5 py-2.5 shadow-lg antialiased sm:flex"
            >
              <Lock className="h-4 w-4 shrink-0 text-[#006191]" aria-hidden="true" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[#0d1d2b]">Contrat officiel</span>
                <span className="font-mono text-[11px] font-medium text-[#296197]">Garantie Diaspora Safe</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Key Metrics Bar (Same sleek card shape as dashboards) */}
      <section className="w-full bg-[#f7f9ff] px-4 py-6 sm:px-6 lg:px-8">
        <ul className="stats mx-auto max-w-7xl">
          <li className="stat">
            <span className="tile tile-sm">
              <Briefcase className="h-5 w-5" aria-hidden="true" />
            </span>
            <strong className="tnum">{services.length || 12} Services</strong>
            <span>Univers certifiés au Bénin</span>
          </li>

          <li className="stat">
            <span className="tile tile-sm">
              <Compass className="h-5 w-5" aria-hidden="true" />
            </span>
            <strong className="tnum">55+ Pays</strong>
            <span>Diaspora connectée active</span>
          </li>

          <li className="stat">
            <span className="tile tile-sm">
              <Zap className="h-5 w-5" aria-hidden="true" />
            </span>
            <strong>Sur mesure</strong>
            <span>Devis après étude locale</span>
          </li>

          <li className="stat">
            <span className="tile tile-sm">
              <BadgeCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <strong className="tnum">100% Prouvé</strong>
            <span>Vidéos, reçus &amp; garanties</span>
          </li>
        </ul>
      </section>

      {/* Video Presentation Modal (voiced + animated step illustrations) */}
      <HowItWorksVideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        onStartProject={handlePrimaryCta}
      />

      {/* Floating WhatsApp CTA */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter BeniLink sur WhatsApp"
        className="whatsapp-float fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#006191] text-white shadow-[0_12px_28px_-4px_rgba(8,77,130,0.4)] transition hover:scale-105 hover:bg-[#084d82]"
      >
        <span className="relative flex h-8 w-8 items-center justify-center">
          <MessageCircle aria-hidden="true" className="absolute inset-0 h-8 w-8 text-white" />
          <Phone aria-hidden="true" className="h-3.5 w-3.5 -rotate-12 text-white" />
        </span>
      </a>
    </>
  );
};
