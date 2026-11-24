import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FAQ_LIST } from '../../data/kwaboData';
import { ChevronDown } from 'lucide-react';

const HEADING_WORDS = 'Questions fréquentes de la Diaspora'.split(' ');

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="border-t border-[#d0e3f5] bg-[#edf4ff] py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.6 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="inline-block rounded-full bg-[#e3efff] px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-[#006191]"
          >
            Foire aux questions
          </motion.span>

          <h2 className="mx-auto mt-2 max-w-4xl font-display text-3xl font-semibold leading-tight text-[#0d1d2b] sm:text-4xl">
            {HEADING_WORDS.map((word, idx) => (
              <motion.span
                key={`${word}-${idx}`}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : idx * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mr-[0.26em] inline-block last:mr-0"
              >
                {word}
              </motion.span>
            ))}
          </h2>

          <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-[#006191] via-[#f7c531] to-[#006191]" />

          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#3f4850] sm:text-base">
            La transparence est notre premier engagement. Voici les réponses à vos interrogations légitimes.
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-3.5">
          {FAQ_LIST.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-[#d0e3f5] bg-white shadow-xs transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 bg-white p-5 text-left transition-colors hover:bg-[#edf4ff]/60"
                >
                  <span className="font-sans text-sm font-semibold text-[#0d1d2b] sm:text-base">
                    {item.q}
                  </span>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform ${
                      isOpen ? 'rotate-180 bg-[#006191] text-white' : 'bg-[#edf4ff] text-[#006191]'
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-[#edf4ff] bg-white px-5 pb-5 text-sm leading-relaxed text-[#3f4850]">
                    <p className="pt-3">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
