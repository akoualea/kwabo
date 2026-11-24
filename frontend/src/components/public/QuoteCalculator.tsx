import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calculator, CheckCircle2, ArrowRight } from 'lucide-react';

export const QuoteCalculator: React.FC = () => {
  const { services, openServiceModal } = useApp();
  const [selectedServiceId, setSelectedServiceId] = useState('suivi-chantier');
  const [durationMonths, setDurationMonths] = useState(3);
  const [fretWeight, setFretWeight] = useState(40);
  const [fretMode, setFretMode] = useState<'maritime' | 'aerien'>('maritime');

  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];

  let estimatedEuro = 150;
  if (selectedServiceId === 'suivi-chantier') {
    estimatedEuro = durationMonths * 150;
  } else if (selectedServiceId === 'fret') {
    estimatedEuro = fretMode === 'maritime' ? Math.max(90, fretWeight * 3.5) : Math.max(120, fretWeight * 9.5);
  } else if (selectedServiceId === 'sante') {
    estimatedEuro = durationMonths * 40;
  } else if (selectedServiceId === 'administratif') {
    estimatedEuro = 60;
  } else if (selectedServiceId === 'faire-venir') {
    estimatedEuro = 250;
  } else {
    estimatedEuro = 180;
  }

  const estimatedFcfa = Math.round(estimatedEuro * 655.957);

  return (
    <section id="simulateur" className="border-b border-[#084d82] bg-gradient-to-br from-[#006191] to-[#296197] py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#ffdf93]">
              <Calculator className="h-3.5 w-3.5" />
              <span>Simulateur d'estimation instantanée</span>
            </span>

            <h2 className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Estimez votre budget sans mauvaise surprise
            </h2>

            <p className="text-sm leading-relaxed text-[#e8f2ff]">
              Chez BeniLink, pas de commissions dissimulées ni de dépassements de coûts imprévus. Les tarifs sont contractuels et garantis par notre équipe au Bénin.
            </p>

            <div className="space-y-2 pt-2 text-xs text-[#e8f2ff]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#ffdf93]" />
                <span>Taux de change fixe 1 € = 655,957 FCFA</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#ffdf93]" />
                <span>Rapports et justificatifs systématiquement inclus</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#ffdf93]" />
                <span>Paiement échelonné possible selon avancement</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d0e3f5] bg-white p-6 text-[#0d1d2b] shadow-2xl sm:p-8 lg:col-span-7">
            <h3 className="font-display mb-6 text-xl font-bold text-[#0d1d2b]">
              Configurez votre simulation
            </h3>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3f4850]">
                  Type de prestation principale
                </label>
                <select
                  value={selectedServiceId}
                  onChange={e => setSelectedServiceId(e.target.value)}
                  className="w-full rounded-xl border border-[#d0e3f5] bg-white p-3.5 text-sm font-semibold text-[#0d1d2b] focus:outline-none focus:ring-2 focus:ring-[#1593d6]"
                >
                  <option value="suivi-chantier">Suivi de chantier (Visites hebdo + vidéo 360°)</option>
                  <option value="fret">Fret Europe → Bénin (Maritime ou Aérien)</option>
                  <option value="sante">Santé &amp; Médicaments pour proche</option>
                  <option value="faire-venir">Faire venir un proche (Dossier visa complet)</option>
                  <option value="administratif">Assistance administrative (Passeport / Acte)</option>
                </select>
              </div>

              {selectedServiceId === 'suivi-chantier' && (
                <div>
                  <div className="mb-2 flex justify-between text-xs font-bold text-[#3f4850]">
                    <span>Durée du suivi souhaitée</span>
                    <span className="text-[#006191]">{durationMonths} mois</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={durationMonths}
                    onChange={e => setDurationMonths(Number(e.target.value))}
                    className="w-full cursor-pointer accent-[#006191]"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-[#4c657a]">
                    <span>1 mois (ponctuel)</span>
                    <span>6 mois (gros œuvre)</span>
                    <span>12 mois (clé en main)</span>
                  </div>
                </div>
              )}

              {selectedServiceId === 'fret' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFretMode('maritime')}
                      className={`rounded-xl border p-3 text-left text-xs font-bold transition ${
                        fretMode === 'maritime'
                          ? 'border-[#006191] bg-[#e3efff] text-[#006191]'
                          : 'border-[#d0e3f5] text-[#4c657a]'
                      }`}
                    >
                      Maritime (3-4 sem.) · Dès 3,50 €/kg
                    </button>
                    <button
                      type="button"
                      onClick={() => setFretMode('aerien')}
                      className={`rounded-xl border p-3 text-left text-xs font-bold transition ${
                        fretMode === 'aerien'
                          ? 'border-[#006191] bg-[#e3efff] text-[#006191]'
                          : 'border-[#d0e3f5] text-[#4c657a]'
                      }`}
                    >
                      Aérien (5-7 j.) · Dès 9,50 €/kg
                    </button>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-xs font-bold text-[#3f4850]">
                      <span>Poids estimé des colis</span>
                      <span className="text-[#006191]">{fretWeight} kg</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="250"
                      step="5"
                      value={fretWeight}
                      onChange={e => setFretWeight(Number(e.target.value))}
                      className="w-full cursor-pointer accent-[#006191]"
                    />
                  </div>
                </div>
              )}

              {selectedServiceId === 'sante' && (
                <div>
                  <div className="mb-2 flex justify-between text-xs font-bold text-[#3f4850]">
                    <span>Durée de prise en charge</span>
                    <span className="text-[#006191]">{durationMonths} mois</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={durationMonths}
                    onChange={e => setDurationMonths(Number(e.target.value))}
                    className="w-full cursor-pointer accent-[#006191]"
                  />
                </div>
              )}

              <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#d0e3f5] bg-[#edf4ff] p-5 sm:flex-row">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#4c657a]">
                    Estimation indicative
                  </span>
                  <div className="mt-1 flex items-baseline gap-2 tnum">
                    <span className="font-display text-3xl font-extrabold text-[#006191]">
                      {Math.round(estimatedEuro)} €
                    </span>
                    <span className="text-xs font-semibold text-[#4c657a]">
                      (~ {estimatedFcfa.toLocaleString('fr-FR')} FCFA)
                    </span>
                  </div>
                  <span className="mt-0.5 block text-[11px] text-[#4c657a]">
                    Devis définitif transmis gratuitement sous 12h
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => openServiceModal(selectedService)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#f7c531] px-6 py-3.5 text-xs font-bold text-[#10202e] shadow-md transition hover:bg-[#e0a410] sm:w-auto"
                >
                  <span>Demander ce devis</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
