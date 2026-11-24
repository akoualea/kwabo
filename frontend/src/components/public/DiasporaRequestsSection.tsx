import React from 'react';

const requests = [
  'Suivi de chantier',
  'Titre foncier',
  'Gestion locative',
  "Payer l'hôpital",
  'Dossier visa',
  "Lettre d'invitation",
  'Création de société',
  'Comptabilité',
  'Acte de naissance',
  'Casier judiciaire',
  "Transfert d'argent",
  'Frais maritime',
  'Sodabi',
  'Wax',
  'Mariage à distance',
  'Funérailles',
  'Factures SBEE',
];

const rows = [requests.slice(0, 6), requests.slice(6, 12), requests.slice(12)];

const rowConfig = [
  { duration: 35, reverse: false },
  { duration: 42, reverse: true },
  { duration: 30, reverse: false },
];

interface Props {
  onSelectRequest: (request: string) => void;
}

const Chip: React.FC<{
  label: string;
  onClick: () => void;
  hidden?: boolean;
}> = ({ label, onClick, hidden }) => (
  <button
    type="button"
    onClick={onClick}
    tabIndex={hidden ? -1 : 0}
    aria-hidden={hidden || undefined}
    className="whitespace-nowrap rounded-full border border-[#d0e3f5] bg-[#f7f9ff] px-4 py-2 text-sm font-medium text-[#3f4850] transition hover:border-[#006191] hover:bg-[#e3efff] hover:text-[#006191] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006191]"
  >
    {label}
  </button>
);

export const DiasporaRequestsSection: React.FC<Props> = ({ onSelectRequest }) => (
  <section className="bg-white px-5 py-14 sm:px-8 sm:py-16">
    <style>{`
      @keyframes diaspora-marquee {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      .diaspora-track {
        animation: diaspora-marquee var(--duration) linear infinite;
        animation-direction: var(--direction);
      }
      .diaspora-marquee:hover .diaspora-track,
      .diaspora-marquee:focus-within .diaspora-track {
        animation-play-state: paused;
      }
      @media (prefers-reduced-motion: reduce) {
        .diaspora-track { animation: none; flex-wrap: wrap; width: auto; justify-content: center; }
        .diaspora-dup { display: none; }
      }
    `}</style>

    <div className="mx-auto max-w-[1200px]">
      <div className="mb-8 text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#006191]">
          Besoins fréquents
        </span>
        <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-[#0d1d2b] sm:text-[36px]">
          Ce que la diaspora nous demande
        </h2>
      </div>

      <div
        className="flex flex-col gap-2.5 overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        {rows.map((row, i) => (
          <div key={i} className="diaspora-marquee overflow-hidden">
            <div
              className="diaspora-track flex w-max"
              style={
                {
                  '--duration': `${rowConfig[i].duration}s`,
                  '--direction': rowConfig[i].reverse ? 'reverse' : 'normal',
                } as React.CSSProperties
              }
            >
              {[false, true].map(isDup => (
                <ul
                  key={String(isDup)}
                  className={`flex gap-2.5 pr-2.5 ${isDup ? 'diaspora-dup' : ''}`}
                  aria-hidden={isDup || undefined}
                >
                  {row.map(request => (
                    <li key={request}>
                      <Chip
                        label={request}
                        hidden={isDup}
                        onClick={() => onSelectRequest(request)}
                      />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
