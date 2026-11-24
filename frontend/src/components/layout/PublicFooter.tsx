import React from 'react';
import {
  Building2,
  CheckCircle2,
  Globe2,
  HeartPulse,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { WHATSAPP_LINK, WHATSAPP_DISPLAY } from '../../data/kwaboData';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';

export const PublicFooter: React.FC = () => {
  const { navigate } = useApp();

  return (
    <footer className="public-footer border-t border-[#d0e3f5] bg-[#edf4ff] pt-14 pb-10 text-[#3f4850]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 pb-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Brand & Univers */}
          <div className="space-y-4">
            <BrandLogo subtitle="Trust Hub Diaspora" />
            <p className="text-sm leading-relaxed text-[#4c657a]">
              Plateforme officielle d'accompagnement pour la diaspora béninoise : suivi de chantier 360°, santé, démarches ANIP et logistique.
            </p>
            <ul className="space-y-2 text-xs font-medium text-[#3f4850]">
              <li className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#296197]" aria-hidden="true" />
                Foncier &amp; BTP Sécurisé
              </li>
              <li className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-[#296197]" aria-hidden="true" />
                Famille, Santé &amp; Proches Bénin
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#296197]" aria-hidden="true" />
                Démarches &amp; Actes ANIP
              </li>
              <li className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#296197]" aria-hidden="true" />
                Logistique Express &amp; Fret
              </li>
            </ul>
          </div>

          {/* Col 2: Garanties de Confiance */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#006191]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              <h4 className="font-sans text-sm font-bold uppercase tracking-wider">
                Garanties de Confiance
              </h4>
            </div>
            <ul className="space-y-2.5 text-sm text-[#3f4850]">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#765b00]" aria-hidden="true" />
                Devis ferme validé avant mission
              </li>
              <li className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#765b00]" aria-hidden="true" />
                Protection des données (RGPD)
              </li>
              <li className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-[#765b00]" aria-hidden="true" />
                Vidéos 360° &amp; photos géolocalisées
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#765b00]" aria-hidden="true" />
                Reçus scannés à l'euro près
              </li>
            </ul>
          </div>

          {/* Col 3: Présence & Couverture */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#006191]">
              <MapPin className="h-5 w-5" aria-hidden="true" />
              <h4 className="font-sans text-sm font-bold uppercase tracking-wider">
                Présence Locale &amp; Diaspora
              </h4>
            </div>
            <ul className="space-y-2 text-sm text-[#3f4850]">
              <li>
                <strong className="text-[#0d1d2b]">Cotonou HQ :</strong> Quartier Haie Vive, Littoral
              </li>
              <li>
                <strong className="text-[#0d1d2b]">Zones couvertes :</strong> Abomey-Calavi, Porto-Novo, Ouidah, Parakou, Bohicon
              </li>
              <li>
                <strong className="text-[#0d1d2b]">Relais diaspora :</strong> France, Belgique, Canada, États-Unis, Suisse
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Certifié */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#006191]">
              <Phone className="h-5 w-5" aria-hidden="true" />
              <h4 className="font-sans text-sm font-bold uppercase tracking-wider">
                Contact &amp; Support
              </h4>
            </div>
            <p className="text-xs leading-relaxed text-[#4c657a]">
              Guichet d'assistance dédié à la diaspora béninoise et aux porteurs de projets.
            </p>
            <div className="space-y-1.5 text-xs text-[#0d1d2b]">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#006191]" aria-hidden="true" />
                <span>contact@benilink.bj</span>
              </div>
              <div className="flex items-center gap-2 tnum">
                <Phone className="h-4 w-4 text-[#006191]" aria-hidden="true" />
                <span>{WHATSAPP_DISPLAY}</span>
              </div>
            </div>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-whatsapp-btn mt-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#006191] px-4 py-2.5 text-xs font-bold !text-white shadow-sm transition hover:bg-[#084d82]"
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-[#ffdf93]" aria-hidden="true" />
              <span>WhatsApp Direct ({WHATSAPP_DISPLAY})</span>
            </a>
          </div>
        </div>

        {/* Bottom Legal Row */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#d0e3f5] pt-6 text-xs text-[#4c657a] md:flex-row">
          <span>© {new Date().getFullYear()} BeniLink · Trust Hub Diaspora. Tous droits réservés.</span>
          <div className="flex items-center gap-6 font-semibold">
            <button
              type="button"
              onClick={() => navigate('cgu')}
              className="cursor-pointer transition hover:text-[#006191]"
            >
              Mentions légales &amp; CGU
            </button>
            <button
              type="button"
              onClick={() => navigate('privacy')}
              className="cursor-pointer transition hover:text-[#006191]"
            >
              Politique de confidentialité
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
