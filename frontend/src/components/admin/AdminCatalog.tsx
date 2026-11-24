import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api, ApiError, getFirstValidationError } from '../../services/api';
import { mapCatalog, mapServiceItem } from '../../services/mappers';
import { Service } from '../../types';
import { Icon } from '../common/Icon';
import { formatSlaLabel, getServiceSlaDays, setServiceSlaDays } from '../../utils/contractsAndSla';

export const AdminCatalog: React.FC = () => {
  const { categories, addToast, refreshCatalog } = useApp();
  const [catalogServices, setCatalogServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [slaTick, setSlaTick] = useState(0);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<any>('/admin/services');
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (rawList.length > 0 && Array.isArray(rawList[0]?.services)) {
        setCatalogServices(mapCatalog(rawList).services);
      } else {
        setCatalogServices(rawList.map((s: any) => mapServiceItem(s)));
      }
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Impossible de charger le catalogue.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleToggleAvailable = async (service: Service) => {
    const nextAvailable = !Boolean(service.available);
    const targetId = service.numericId ?? service.id;
    setSavingId(service.id);
    try {
      await api(`/admin/services/${targetId}`, {
        method: 'PATCH',
        body: { available: nextAvailable },
      });
      setCatalogServices(prev =>
        prev.map(s => (s.id === service.id ? { ...s, available: nextAvailable } : s))
      );
      addToast(
        nextAvailable
          ? "Service disponible sur le site et l'application."
          : 'Service retiré de la vitrine.'
      );
      await refreshCatalog();
    } catch (err) {
      addToast(err instanceof ApiError ? getFirstValidationError(err) : 'Mise à jour impossible.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  if (loading && catalogServices.length === 0) {
    return <div className="empty">Chargement du catalogue…</div>;
  }

  return (
    <>
      {categories.map(c => {
        const catServices = catalogServices.filter(s => s.cat === c.id);
        if (catServices.length === 0) return null;

        return (
          <section key={c.id} className="card">
            <h2>{c.name}</h2>
            <div className="table-wrap">
              <table className="table table-cards">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Mode tarifaire</th>
                    <th>Délai de réalisation</th>
                    <th>Demandes</th>
                    <th>Disponible</th>
                  </tr>
                </thead>
                <tbody data-sla-tick={slaTick}>
                  {catServices.map(s => {
                    const slaKey = s.slug || s.id;
                    const slaDays = getServiceSlaDays(slaKey, s.cat);
                    return (
                    <tr key={s.id}>
                      <td data-label="Service">
                        <span className="client-mini">
                          <span className={`tile tile-sm cat-${s.cat}`}>
                            <Icon name={s.icon} size={18} />
                          </span>
                          <strong>{s.name}</strong>
                        </span>
                      </td>
                      <td data-label="Mode tarifaire">
                        <span className="muted">Sur devis confidentiel</span>
                      </td>
                      <td data-label="Délai de réalisation">
                        <div className="flex flex-wrap items-center justify-end gap-2 lg:justify-start">
                          <input
                            type="number"
                            min={1}
                            max={90}
                            value={slaDays}
                            aria-label={`Délai en jours pour ${s.name}`}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (!Number.isNaN(val) && val >= 1) {
                                setServiceSlaDays(slaKey, val);
                                setSlaTick((t) => t + 1);
                              }
                            }}
                            style={{ width: '68px', minHeight: '34px', padding: '4px 8px' }}
                            className="rounded-lg border border-[#d0e3f5] bg-white text-xs font-semibold"
                          />
                          <span className="text-xs muted">{formatSlaLabel(slaDays)}</span>
                        </div>
                      </td>
                      <td data-label="Demandes">{s.requestsCount ?? 0}</td>
                      <td data-label="Disponible">
                        <label className="switch switch-inline">
                          <span className="sr-only">{s.name} disponible</span>
                          <input
                            type="checkbox"
                            checked={Boolean(s.available)}
                            disabled={savingId === s.id}
                            onChange={() => handleToggleAvailable(s)}
                          />
                          <span className="switch-track" aria-hidden="true" />
                        </label>
                      </td>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </>
  );
};
