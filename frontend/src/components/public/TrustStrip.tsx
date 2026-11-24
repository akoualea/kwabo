import React from 'react';
import { Video, Receipt, FileSignature, ShieldCheck } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const points = [
    {
      icon: Video,
      title: 'Vidéos 360° et photos',
      desc: 'Datées et géolocalisées pour constater l\'avancement réel de vos travaux.',
      color: 'bg-[#e3efff] text-[#006191] border-[#d0e3f5]',
    },
    {
      icon: Receipt,
      title: 'Reçus officiels scannés',
      desc: 'Pour chaque dépense engagée (matériaux, ordonnances, formalités).',
      color: 'bg-[#ffdf93]/60 text-[#765b00] border-[#f2c02c]',
    },
    {
      icon: FileSignature,
      title: 'Contrat de mission signé',
      desc: 'Engagements contractuels clairs et délais fixés avant tout démarrage.',
      color: 'bg-[#d1e4ff] text-[#084d82] border-[#9fcaff]',
    },
    {
      icon: ShieldCheck,
      title: 'Devis clair et transparent',
      desc: 'Chiffré en euros ou FCFA, sans surcoût de dernière minute.',
      color: 'bg-[#edf4ff] text-[#296197] border-[#d0e3f5]',
    },
  ];

  return (
    <section id="garanties-strip" className="border-b border-[#d0e3f5] bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 rounded-2xl border border-[#d0e3f5] bg-[#f7f9ff] p-5 transition-shadow hover:shadow-md"
              >
                <div className={`shrink-0 rounded-xl border p-3 ${p.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-[#0d1d2b]">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#4c657a]">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
