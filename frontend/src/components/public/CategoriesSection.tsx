import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  onSelectCategory: (catId: string) => void;
}

const CATEGORY_META: Record<string, { tag: string; delay: string; points: string[] }> = {
  immobilier: {
    tag: 'Foncier & BTP',
    delay: '48h - 72h',
    points: [
      'Suivi de chantier vidéo 360°',
      'Vérification titre foncier ANDF',
      'Gestion locative & recouvrement',
    ],
  },
  famille: {
    tag: 'Santé & Bien-être',
    delay: '24h max',
    points: [
      'Prise en charge clinique directe',
      'Livraison ordonnances pharmacie',
      'Factures SBEE / SONEB & proches',
    ],
  },
  demarches: {
    tag: 'Administratif',
    delay: '3 - 5 jours',
    points: [
      'Actes état civil & légalisation',
      'Dossiers visas & invitations',
      'Comptabilité & création APIEx',
    ],
  },
  logistique: {
    tag: 'Logistique Rapide',
    delay: '12h - 24h',
    points: [
      'Fret aérien & maritime Europe-Bénin',
      'Frais & achats contrôlés',
      'Cadeaux & paniers authentiques',
    ],
  },
};

export const CategoriesSection: React.FC<Props> = ({ onSelectCategory }) => {
  const { categories } = useApp();
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = gridRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full bg-[#edf4ff] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#006191]">
              Catalogue d'Excellence
            </span>
            <h2 className="font-display mt-1 text-3xl font-semibold text-[#0d1d2b] sm:text-[34px]">
              4 Univers d'Intervention Garantis
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[#3f4850]">
              Chaque mission est supervisée localement au Bénin avec contrat clair, preuves visuelles et justificatifs comptables.
            </p>
          </div>
          <a
            href="#services"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#006191] transition hover:text-[#007bb6]"
          >
            <span>Explorer tous les services</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, index) => {
            const meta = CATEGORY_META[cat.id] || {
              tag: cat.short,
              delay: 'Sous 24h',
              points: ['Devis transparent', 'Preuves photos & vidéos', 'Reçus certifiés'],
            };

            return (
              <div
                key={cat.id}
                style={{ transitionDelay: visible ? `${index * 140}ms` : '0ms' }}
                className={`h-full transition-all duration-700 ease-out motion-reduce:transition-none ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <div
                  onClick={() => {
                    onSelectCategory(cat.id);
                    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-[#d0e3f5] bg-white shadow-[0_4px_16px_-2px_rgba(11,111,184,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#1593d6] hover:shadow-[0_12px_28px_-4px_rgba(11,111,184,0.12)]"
                >
                  <div>
                    <div className="relative h-44 w-full overflow-hidden">
                      <img
                        src={cat.photo}
                        alt={cat.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 rounded-full bg-[#f7f9ff]/95 px-2.5 py-1 text-[11px] font-bold text-[#006191] backdrop-blur-sm">
                        {meta.tag}
                      </span>
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-[#0d1d2b] backdrop-blur-sm">
                        <Clock className="h-3 w-3 text-[#765b00]" aria-hidden="true" />
                        {meta.delay}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="font-sans text-lg font-bold text-[#0d1d2b] transition-colors group-hover:text-[#006191]">
                        {cat.name}
                      </h3>
                      <p className="mt-1.5 mb-3 text-xs leading-relaxed text-[#4c657a]">
                        {cat.blurb}
                      </p>
                      <ul className="space-y-1.5 text-xs text-[#0d1d2b]">
                        {meta.points.map(point => (
                          <li key={point} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#006191]" aria-hidden="true" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center justify-between bg-[#edf4ff]/70 px-5 py-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#296197]">
                      Sur devis personnalisé
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#006191] text-white transition group-hover:bg-[#007bb6]">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
