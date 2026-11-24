import React from 'react';
import { SEED_REVIEWS } from '../../data/kwaboData';
import { Star, CheckCircle2, Quote } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const publishedReviews = SEED_REVIEWS.filter(r => r.status === 'published');

  return (
    <section className="border-b border-[#d0e3f5] bg-[#f7f9ff] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="inline-block rounded-full bg-[#e3efff] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#006191]">
            Témoignages certifiés
          </span>
          <h2 className="font-display mt-3 text-3xl font-extrabold text-[#0d1d2b] sm:text-4xl">
            La voix de la diaspora béninoise
          </h2>
          <p className="mt-2 text-sm text-[#4c657a]">
            Ils vivent en France, en Belgique, au Canada ou aux États-Unis et confient la gestion de leurs chantiers et démarches à BeniLink.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {publishedReviews.map(rev => (
            <div
              key={rev.id}
              className="relative flex flex-col justify-between rounded-3xl border border-[#d0e3f5] bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-[#ffdf93]" />

              <div>
                <div className="mb-3 flex items-center gap-1 text-[#f7c531]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < rev.rating ? 'fill-[#f7c531] text-[#f7c531]' : 'text-[#bec7d2]'}`}
                    />
                  ))}
                </div>

                <p className="text-xs italic leading-relaxed text-[#3f4850]">
                  « {rev.comment} »
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#edf4ff] pt-4">
                <div>
                  <div className="text-xs font-bold text-[#0d1d2b]">Client vérifié</div>
                  <div className="text-[10px] text-[#4c657a]">
                    {new Date(rev.at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e3efff] px-2 py-0.5 text-[11px] font-semibold text-[#006191]">
                  <CheckCircle2 className="h-3 w-3" />
                  Mission réussie
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 flex max-w-xl items-center justify-around rounded-2xl border border-[#d0e3f5] bg-white p-6 text-center shadow-xs">
          <div>
            <div className="font-display text-3xl font-extrabold text-[#006191] tnum">4.9 / 5</div>
            <div className="mt-0.5 text-[11px] text-[#4c657a]">Satisfaction globale</div>
          </div>
          <div className="h-10 w-px bg-[#d0e3f5]" />
          <div>
            <div className="font-display text-3xl font-extrabold text-[#006191] tnum">+240</div>
            <div className="mt-0.5 text-[11px] text-[#4c657a]">Missions réalisées</div>
          </div>
          <div className="h-10 w-px bg-[#d0e3f5]" />
          <div>
            <div className="font-display text-3xl font-extrabold text-[#006191] tnum">100 %</div>
            <div className="mt-0.5 text-[11px] text-[#4c657a]">Reçus justifiés</div>
          </div>
        </div>
      </div>
    </section>
  );
};
