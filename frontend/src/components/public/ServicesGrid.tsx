import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, CheckCircle2, Search, Sparkles } from 'lucide-react';

interface Props {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

const RevealCard: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
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
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`h-full transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  );
};

export const ServicesGrid: React.FC<Props> = ({ selectedCategory, onSelectCategory }) => {
  const { services, categories, openServiceModal } = useApp();
  const [filterQuery, setFilterQuery] = useState('');

  const filteredServices = services.filter(s => {
    const matchesCat = selectedCategory === 'all' || s.cat === selectedCategory;
    const matchesSearch =
      !filterQuery.trim() ||
      s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.short.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.included.some(inc => inc.toLowerCase().includes(filterQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <section id="services" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="inline-block rounded-full bg-[#e3efff] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#006191]">
              Catalogue officiel BeniLink
            </span>
            <h2 className="font-display mt-2 text-3xl font-semibold text-[#0d1d2b] sm:text-4xl">
              Nos {services.length || 12} services de confiance au Bénin
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[#3f4850]">
              Chaque prestation est couverte par un contrat officiel, un suivi régulier et des pièces justificatives certifiées.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4c657a]" aria-hidden="true" />
            <input
              type="text"
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder="Filtrer les services..."
              aria-label="Filtrer les services"
              className="w-full rounded-full border border-[#d0e3f5] bg-[#f7f9ff] py-2.5 pl-10 pr-4 text-xs text-[#0d1d2b] outline-none transition focus:border-[#006191] focus:ring-2 focus:ring-[#1593d6]/20"
              style={{ minHeight: '42px', paddingLeft: '2.5rem', borderRadius: '9999px' }}
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="no-scrollbar mb-10 flex items-center gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${
              selectedCategory === 'all'
                ? 'bg-[#006191] text-white shadow-sm'
                : 'border border-[#d0e3f5] bg-[#f7f9ff] text-[#3f4850] hover:bg-[#e3efff] hover:text-[#006191]'
            }`}
          >
            Tous les services ({services.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${
                selectedCategory === cat.id
                  ? 'bg-[#006191] text-white shadow-sm'
                  : 'border border-[#d0e3f5] bg-[#f7f9ff] text-[#3f4850] hover:bg-[#e3efff] hover:text-[#006191]'
              }`}
            >
              {cat.short}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service, index) => {
            const cat = categories.find(c => c.id === service.cat);
            return (
              <RevealCard key={service.id} delay={(index % 3) * 140}>
                <div
                  onClick={() => openServiceModal(service)}
                  className="group flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-[#d0e3f5] bg-white shadow-[0_4px_16px_-2px_rgba(11,111,184,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#1593d6] hover:shadow-[0_12px_28px_-4px_rgba(11,111,184,0.12)]"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={service.photo}
                        alt={service.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1d2b]/80 via-[#0d1d2b]/15 to-transparent" />

                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#006191] backdrop-blur-sm">
                          {cat?.short}
                        </span>
                        {service.popular && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#ffdf93] px-2.5 py-1 text-[10px] font-bold text-[#241a00] shadow-xs">
                            <Sparkles className="h-3 w-3" aria-hidden="true" />
                            Plébiscité
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <h3 className="font-display truncate text-lg font-bold">
                          {service.name}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-4 p-6">
                      <p className="line-clamp-2 text-xs leading-relaxed text-[#4c657a]">
                        {service.short}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        {service.included.slice(0, 3).map((inc, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-[#0d1d2b]">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#006191]" aria-hidden="true" />
                            <span className="truncate">{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center justify-between border-t border-[#edf4ff] bg-[#f7f9ff]/60 px-6 py-4">
                    <span className="text-xs font-bold text-[#006191] group-hover:underline">
                      Détails &amp; devis
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e3efff] text-[#006191] transition-colors group-hover:bg-[#006191] group-hover:text-white">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </RevealCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
