import React, { useState } from 'react';
import { PlayCircle, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HowItWorksVideoModal } from './HowItWorksVideoModal';

const steps = [
  {
    num: '01',
    title: 'Décrivez votre besoin',
    description:
      'Remplissez notre formulaire guidé en 3 minutes. Spécifiez votre commune et téléversez vos pièces.',
    circleCls: 'bg-[#006191] text-white',
  },
  {
    num: '02',
    title: 'Échangez avec la Centrale',
    description:
      "L'Administration centrale étudie votre dossier. Aucun intermédiaire opaque, échanges encadrés.",
    circleCls: 'bg-[#296197] text-white',
  },
  {
    num: '03',
    title: 'Validez devis & contrat',
    description:
      'Recevez un devis personnalisé après étude avec nos équipes locales et un contrat clair avant mission.',
    circleCls: 'bg-[#ffdf93] text-[#241a00]',
  },
  {
    num: '04',
    title: 'Suivez en temps réel',
    description:
      'Vidéos 360°, photos horodatées, reçus scannés et livrables directement dans votre coffre-fort.',
    circleCls: 'bg-[#007bb6] text-white',
  },
];

export const HowItWorksSection: React.FC = () => {
  const { navigate, currentUser, role } = useApp();
  const [videoOpen, setVideoOpen] = useState(false);

  const handleStartProject = () => {
    if (!currentUser) navigate('register');
    else if (role === 'USER') navigate('client-new-request');
    else if (role === 'ADMIN') navigate('admin-dashboard');
    else navigate('operator-dashboard');
  };

  return (
    <section id="comment-ca-marche" className="w-full overflow-x-clip bg-[#f7f9ff] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <style>{`
        @keyframes hiwTiltLeft {
          0%, 100% { transform: translateY(0px) rotate(-2.5deg); }
          50% { transform: translateY(-9px) rotate(1.8deg); }
        }
        @keyframes hiwTiltRight {
          0%, 100% { transform: translateY(0px) rotate(2.5deg); }
          50% { transform: translateY(-9px) rotate(-1.8deg); }
        }
        .hiw-tilt-card {
          will-change: transform;
        }
        .hiw-tilt-card:hover {
          animation-play-state: paused !important;
          transform: translateY(-10px) rotate(0deg) scale(1.02) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .hiw-tilt-card { animation: none !important; }
        }
      `}</style>
      <div className="mx-auto flex max-w-7xl flex-col items-center text-center">
        <div className="mb-12 flex flex-col items-center gap-3.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d0e3f5] bg-[#edf4ff] px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-[#006191] shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#765b00]" aria-hidden="true" />
            Processus Transparent
          </span>
          <h2 className="font-display text-3xl font-semibold text-[#0d1d2b] sm:text-4xl">
            Comment fonctionne BeniLink ?
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-[#4c657a] sm:text-base">
            Quatre étapes simples et transparentes pour piloter vos projets au Bénin depuis l'étranger.
          </p>
          <button
            type="button"
            onClick={() => setVideoOpen(true)}
            className="mt-2 inline-flex min-h-[42px] sm:min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#006191] px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#084d82]"
          >
            <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-[#f7c531]" aria-hidden="true" />
            <span>Comment ça marche (Vidéo guidée)</span>
          </button>
        </div>

        <div className="relative grid w-full grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.num}
              style={{
                animation: `${index % 2 === 0 ? 'hiwTiltLeft' : 'hiwTiltRight'} 5.4s ease-in-out ${index * 0.65}s infinite`,
              }}
              className="hiw-tilt-card group relative z-10 flex flex-col items-center gap-4 rounded-3xl border border-[#d0e3f5] bg-white px-7 py-9 text-center shadow-sm transition-all duration-300 hover:border-[#006191]/45 hover:shadow-[0_18px_38px_rgba(0,97,145,0.16)]"
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold shadow-md transition-transform duration-300 group-hover:scale-110 tnum ${step.circleCls}`}
              >
                {step.num}
              </div>
              <div className="flex flex-1 flex-col items-center gap-2.5">
                <h3 className="font-sans text-base font-bold text-[#0d1d2b]">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[#4c657a]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <HowItWorksVideoModal
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
        onStartProject={handleStartProject}
      />
    </section>
  );
};
