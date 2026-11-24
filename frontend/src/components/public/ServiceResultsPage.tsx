import React from 'react';
import { ArrowLeft, ArrowRight, FileCheck2, Receipt, ShieldCheck, Video } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SERVICES } from '../../data/kwaboData';

const requestServiceIds: Record<string, string[]> = {
  'Suivi de chantier': ['suivi-chantier'],
  'Titre foncier': ['foncier'],
  'Gestion locative': ['investissement'],
  "Payer l'hôpital": ['sante'],
  'Dossier visa': ['faire-venir'],
  "Lettre d'invitation": ['faire-venir'],
  'Création de société': ['comptabilite'],
  Comptabilité: ['comptabilite'],
  'Acte de naissance': ['administratif'],
  'Casier judiciaire': ['administratif'],
  "Transfert d'argent": ['transfert'],
  'Fret maritime': ['fret'],
  Sodabi: ['cadeaux'],
  Wax: ['cadeaux'],
  'Mariage à distance': ['evenements'],
  Funérailles: ['evenements'],
  'Factures SBEE': ['soutien-famille'],
};

const guarantees = [
  {
    icon: Video,
    title: 'Vidéos et photos',
    description: 'Datées, pour voir le travail réalisé.',
    tileCls: 'bg-[#006191] text-white',
    cardCls: 'border-[#b4d8f8] bg-gradient-to-br from-[#eef6ff] to-[#dceeff]',
  },
  {
    icon: Receipt,
    title: 'Reçus scannés',
    description: 'Pour chaque dépense engagée.',
    tileCls: 'bg-[#f7c531] text-[#241a00]',
    cardCls: 'border-[#f4cf62] bg-gradient-to-br from-[#fff9e6] to-[#ffefc2]',
  },
  {
    icon: FileCheck2,
    title: 'Contrat signé',
    description: 'Avant le début de chaque mission.',
    tileCls: 'bg-[#296197] text-white',
    cardCls: 'border-[#bdd1fb] bg-gradient-to-br from-[#f0f5ff] to-[#dce7ff]',
  },
  {
    icon: ShieldCheck,
    title: 'Devis avant mission',
    description: 'Clair, sans frais cachés.',
    tileCls: 'bg-[#007bb6] text-white',
    cardCls: 'border-[#a1daf4] bg-gradient-to-br from-[#edf9ff] to-[#d4f0fc]',
  },
];

interface Props {
  request: string;
  onBack: () => void;
}

export const ServiceResultsPage: React.FC<Props> = ({ request, onBack }) => {
  const { services, categories, openServiceModal } = useApp();
  const matchingIds = requestServiceIds[request] ?? [];
  const matchingServices = services.filter(service => service.available && matchingIds.includes(service.slug || service.id));

  return (
    <main id="services" className="min-h-[70vh] bg-[#f7f9ff] px-5 py-12 sm:px-8 sm:py-16">
      <style>{`
        @keyframes srCardEnter {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes srGentleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .sr-enter {
          animation: srCardEnter 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .sr-guarantee-card {
          animation: srCardEnter 0.55s cubic-bezier(0.22, 1, 0.36, 1) both, srGentleFloat 5.5s ease-in-out 0.8s infinite;
        }
        .sr-guarantee-card:hover {
          animation-play-state: paused !important;
          transform: translateY(-6px) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .sr-enter, .sr-guarantee-card { animation: none !important; }
        }
      `}</style>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-10">
        <div className="flex flex-col items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#d0e3f5] bg-white px-4 py-2 text-sm font-semibold text-[#006191] shadow-xs transition hover:-translate-x-0.5 hover:bg-[#edf4ff]"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Retour à l'accueil
          </button>

          <p className="text-sm font-medium text-[#4c657a]" aria-live="polite">
            {matchingServices.length} service{matchingServices.length === 1 ? '' : 's'} correspondant{matchingServices.length === 1 ? '' : 's'} à « {request} »
          </p>
        </div>

        {matchingServices.length ? (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {matchingServices.map((service, index) => {
              const category = categories.find(item => item.id === service.cat);
              const fallbackPhoto = SERVICES.find(srv => srv.id === (service.slug || service.id))?.photo;
              const photoSrc = service.photo || fallbackPhoto || '/assets/photos/chantier-500.jpg';
              return (
                <div
                  key={service.id}
                  className="sr-enter"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => openServiceModal(service)}
                    className="group flex min-h-[224px] w-full flex-col overflow-hidden rounded-2xl border border-[#d0e3f5] bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1593d6] hover:shadow-[0_16px_36px_rgba(0,97,145,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006191]"
                  >
                    <span className="flex h-[68px] items-center justify-between bg-[#e3efff] px-5 text-[#006191]">
                      <img
                        src={photoSrc}
                        alt={service.name}
                        className="h-11 w-11 shrink-0 rounded-xl border border-white/80 object-cover shadow-xs transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="text-xs font-bold uppercase tracking-wide">{category?.short}</span>
                    </span>
                    <span className="flex flex-1 flex-col gap-2.5 px-5 py-5">
                      <span className="font-display text-[19px] font-semibold leading-tight text-[#0d1d2b]">
                        {service.name}
                      </span>
                      <span className="text-sm leading-relaxed text-[#4c657a]">{service.short}</span>
                      <span className="mt-auto flex items-center justify-between pt-4 text-sm font-bold text-[#006191]">
                        <span>Sur devis gratuit</span>
                        <ArrowRight aria-hidden="true" className="h-5 w-5 text-[#006191] transition-transform duration-300 group-hover:translate-x-1.5" />
                      </span>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#d0e3f5] bg-white p-7 text-sm text-[#4c657a] shadow-xs">
            Aucun service disponible pour le moment. Contactez notre équipe pour en parler.
          </div>
        )}

        <div id="garanties" aria-label="Nos garanties" className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          {guarantees.map(({ icon: Icon, title, description, tileCls, cardCls }, idx) => (
            <div
              key={title}
              style={{ animationDelay: `${140 + idx * 110}ms, ${idx * 0.6}s` }}
              className={`sr-guarantee-card flex min-h-[96px] items-center gap-4 rounded-2xl border px-5 py-4 shadow-sm transition-shadow duration-300 hover:shadow-md ${cardCls}`}
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-xs ${tileCls}`}>
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="block text-sm font-bold text-[#0d1d2b]">{title}</span>
                <span className="block text-xs leading-relaxed text-[#3f556b]">{description}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};
