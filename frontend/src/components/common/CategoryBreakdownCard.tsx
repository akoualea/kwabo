import React, { useState } from 'react';
import { BarChart2, PieChart } from 'lucide-react';
import type { Category } from '../../types';

const CHART_COLORS = ['#006191', '#e0a410', '#1593d6', '#765b00', '#296197', '#f7c531', '#084d82', '#8fc2fe'];

export interface CategoryBreakdownRow {
  c: Pick<Category, 'id' | 'name' | 'short'>;
  value: number;
}

interface CategoryBreakdownCardProps {
  title?: string;
  rows: CategoryBreakdownRow[];
  defaultView?: 'bars' | 'chart';
  unitSingular?: string;
  unitPlural?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CategoryBreakdownCard: React.FC<CategoryBreakdownCardProps> = ({
  title = 'Demandes par univers',
  rows,
  defaultView = 'bars',
  unitSingular = 'demande',
  unitPlural = 'demandes',
  className = '',
  style,
}) => {
  const [view, setView] = useState<'bars' | 'chart'>(defaultView);

  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const maxValue = Math.max(1, ...rows.map((row) => row.value));

  const DONUT_R = 52;
  const DONUT_CIRC = 2 * Math.PI * DONUT_R;
  let acc = 0;
  const segments =
    total > 0
      ? rows
          .filter((row) => row.value > 0)
          .map((row, idx) => {
            const len = (row.value / total) * DONUT_CIRC;
            const seg = {
              ...row,
              len,
              offset: -acc,
              pct: Math.round((row.value / total) * 100),
              color: CHART_COLORS[idx % CHART_COLORS.length],
              idx,
            };
            acc += len;
            return seg;
          })
      : [];

  return (
    <section className={`card ${className}`.trim()} style={style}>
      <div className="card-head" style={{ gap: 10, flexWrap: 'wrap' }}>
        <h2>{title}</h2>

        <div
          className="inline-flex items-center rounded-full border border-[#d0e3f5] bg-[#edf4ff] p-0.5"
          role="group"
          aria-label="Mode d'affichage"
        >
          <button
            type="button"
            onClick={() => setView('bars')}
            aria-pressed={view === 'bars'}
            title="Afficher en barres horizontales"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
              view === 'bars'
                ? 'bg-[#006191] text-white shadow-sm'
                : 'text-[#3f4850] hover:text-[#006191]'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5 rotate-90" aria-hidden="true" />
            <span>Barres</span>
          </button>
          <button
            type="button"
            onClick={() => setView('chart')}
            aria-pressed={view === 'chart'}
            title="Afficher sous forme de graphe"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
              view === 'chart'
                ? 'bg-[#006191] text-white shadow-sm'
                : 'text-[#3f4850] hover:text-[#006191]'
            }`}
          >
            <PieChart className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Graphe</span>
          </button>
        </div>
      </div>

      {view === 'chart' ? (
        <div className="kw-chart" style={{ marginTop: 12 }}>
          {total === 0 ? (
            <p className="muted kw-chart-empty">
              Aucune {unitSingular} à représenter pour le moment.
            </p>
          ) : (
            <div className="kw-donut-wrap">
              <svg
                className="kw-donut"
                viewBox="0 0 140 140"
                role="img"
                aria-label={`Répartition des ${total} ${total > 1 ? unitPlural : unitSingular} par univers`}
              >
                <circle
                  cx="70"
                  cy="70"
                  r={DONUT_R}
                  fill="none"
                  stroke="rgba(0,0,0,0.07)"
                  strokeWidth="22"
                />
                <g transform="rotate(-90 70 70)">
                  {segments.map((seg) => (
                    <circle
                      key={seg.c.id}
                      className="kw-seg"
                      cx="70"
                      cy="70"
                      r={DONUT_R}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="22"
                      strokeDasharray={`${seg.len} ${DONUT_CIRC}`}
                      strokeDashoffset={seg.offset}
                      style={{
                        ['--len' as any]: seg.len,
                        ['--circ' as any]: DONUT_CIRC,
                        animationDelay: `${seg.idx * 0.14}s`,
                      }}
                    >
                      <title>{`${seg.c.name} : ${seg.value} ${seg.value > 1 ? unitPlural : unitSingular} (${seg.pct} %)`}</title>
                    </circle>
                  ))}
                </g>
                <text className="kw-donut-total" x="70" y="72" textAnchor="middle">
                  {total}
                </text>
                <text className="kw-donut-sub" x="70" y="86" textAnchor="middle">
                  {total > 1 ? unitPlural : unitSingular}
                </text>
              </svg>

              <ul className="kw-legend">
                {segments.map((seg) => (
                  <li key={seg.c.id} style={{ animationDelay: `${0.2 + seg.idx * 0.08}s` }}>
                    <span className="dot" style={{ background: seg.color }} />
                    <span>{seg.c.short}</span>
                    <strong>
                      {seg.value} <small className="font-normal text-[#6b7870]">({seg.pct}%)</small>
                    </strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <ul className="bars" style={{ marginTop: 12 }}>
          {rows.map(({ c, value }, idx) => (
            <li
              key={c.id}
              className="kw-bar"
              style={{ animationDelay: `${0.08 * idx}s` }}
              title={`${c.name} : ${value} ${value > 1 ? unitPlural : unitSingular}`}
            >
              <span className="bars-label">{c.short}</span>
              <span className="bars-track">
                <span
                  className="bars-fill"
                  style={{ width: `${(value / maxValue) * 100}%` }}
                />
              </span>
              <span className="bars-value">{value}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

