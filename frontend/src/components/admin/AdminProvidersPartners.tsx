import React, { useEffect, useState } from 'react';
import { Building2, Plus, Trash2, Wrench } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  addProviderOrPartner,
  deleteProviderOrPartner,
  getProvidersAndPartners,
  ProviderPartnerFiche,
  subscribeWorkflow,
} from '../../utils/benilinkWorkflow';

export const AdminProvidersPartners: React.FC = () => {
  const { addToast } = useApp();
  const [tab, setTab] = useState<'prestataire' | 'partenaire'>('prestataire');
  const [items, setItems] = useState<ProviderPartnerFiche[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [country, setCountry] = useState('Bénin');
  const [city, setCity] = useState('Cotonou');
  const [specialties, setSpecialties] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const sync = () => setItems(getProvidersAndPartners());
    sync();
    return subscribeWorkflow(sync);
  }, []);

  const filtered = items.filter((i) => i.kind === tab);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;
    const created = addProviderOrPartner({
      kind: tab,
      name: name.trim(),
      contact: contact.trim(),
      country: country.trim() || 'Bénin',
      city: city.trim() || 'Cotonou',
      specialties: specialties.trim(),
      notes: notes.trim() || undefined,
    });

    api(tab === 'prestataire' ? '/admin/providers' : '/admin/partners', {
      method: 'POST',
      body: created,
    }).catch(() => {});

    setName('');
    setContact('');
    setSpecialties('');
    setNotes('');
    setShowModal(false);
    addToast(
      tab === 'prestataire'
        ? 'Fiche prestataire technique ajoutée (sans compte).'
        : 'Fiche entreprise partenaire ajoutée (sans compte).',
      'success'
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab('prestataire')}
            className={`btn btn-sm ${tab === 'prestataire' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <Wrench className="h-4 w-4" aria-hidden="true" />
            <span>Prestataires techniques ({items.filter((i) => i.kind === 'prestataire').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('partenaire')}
            className={`btn btn-sm ${tab === 'partenaire' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <Building2 className="h-4 w-4" aria-hidden="true" />
            <span>Entreprises partenaires ({items.filter((i) => i.kind === 'partenaire').length})</span>
          </button>
        </div>

        <button type="button" onClick={() => setShowModal(true)} className="btn btn-gold btn-sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>{tab === 'prestataire' ? 'Ajouter un prestataire' : 'Ajouter un partenaire'}</span>
        </button>
      </div>

      <p className="notice text-xs">
        <strong>Règle BeniLink (§13.2) :</strong> les prestataires techniques et entreprises partenaires n’ont <strong>aucun compte ni accès à la plateforme</strong>. Ils sont gérés sous forme de fiches internes par le Responsable des prestations.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <article key={item.id} className="card !mb-0 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-start justify-between gap-2">
                <strong className="text-sm text-[#0d1d2b]">{item.name}</strong>
                <span className="badge badge-neutral">Sans compte</span>
              </div>
              <p className="mt-1 text-xs muted">
                {item.city}, {item.country} · {item.contact}
              </p>
              {item.specialties && (
                <p className="mt-2 text-xs text-[#3f4850]">
                  <strong>Spécialités :</strong> {item.specialties}
                </p>
              )}
              {item.notes && <p className="mt-1.5 text-[11px] muted">{item.notes}</p>}
            </div>
            <div className="flex justify-end border-t border-[#d0e3f5] pt-2.5">
              <button
                type="button"
                onClick={() => {
                  deleteProviderOrPartner(item.id);
                  addToast('Fiche supprimée.', 'info');
                }}
                className="btn btn-danger-ghost btn-sm"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Retirer</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {showModal && (
        <div
          className="no-scrollbar fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#06243d]/70 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-2xl border border-[#d0e3f5] bg-white p-5 sm:p-6 shadow-2xl space-y-3"
          >
            <h2 className="font-display text-lg font-bold text-[#0d1d2b]">
              {tab === 'prestataire' ? 'Nouvelle fiche prestataire' : 'Nouvelle fiche entreprise partenaire'}
            </h2>
            <div className="field !mb-0">
              <label htmlFor="pp-name">Nom / Raison sociale *</label>
              <input id="pp-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field !mb-0">
              <label htmlFor="pp-contact">Téléphone ou e-mail *</label>
              <input id="pp-contact" required value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
            <div className="form-grid">
              <div className="field !mb-0">
                <label htmlFor="pp-country">Pays</label>
                <input id="pp-country" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
              <div className="field !mb-0">
                <label htmlFor="pp-city">Ville</label>
                <input id="pp-city" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
            <div className="field !mb-0">
              <label htmlFor="pp-spec">Spécialités</label>
              <input
                id="pp-spec"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                placeholder="Ex. Plomberie, bornage, livraison express…"
              />
            </div>
            <div className="field !mb-0">
              <label htmlFor="pp-notes">Notes internes</label>
              <textarea id="pp-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">
                Annuler
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Enregistrer la fiche
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
