import React from 'react';
import { useApp } from '../../context/AppContext';
import { Icon } from '../common/Icon';
import { PublicHeader } from '../layout/PublicHeader';
import { PublicFooter } from '../layout/PublicFooter';

export const LegalPage: React.FC<{ type?: 'confidentialite' | 'cgu' | 'mentions-legales' }> = ({ type = 'confidentialite' }) => {
  const { navigate, currentUser } = useApp();

  const legalContent = {
    confidentialite: {
      title: 'Politique de confidentialité',
      body: [
        {
          title: 'Données collectées',
          text: 'Identité, e-mail, téléphone, pays de résidence, et les informations que vous donnez dans vos demandes.',
        },
        {
          title: 'Utilisation',
          text: 'Traiter vos demandes, vous envoyer vos devis et rapports, et vous informer de l\'avancement de vos missions.',
        },
        {
          title: 'Données bancaires',
          text: 'Aucune donnée de carte bancaire n\'est conservée par BeniLink. Les paiements sont gérés par des prestataires certifiés.',
        },
        {
          title: 'Vos droits',
          text: 'Vous pouvez consulter, corriger et supprimer vos données. La suppression de votre compte efface toutes les données associées, depuis « Mon profil ».',
        },
      ],
    },
    cgu: {
      title: 'Conditions générales d\'utilisation (v1.2)',
      body: [
        {
          title: '1. Objet & acceptation',
          text: 'Ces conditions encadrent l’utilisation de la plateforme BeniLink. La case cochée lors de l’inscription vaut acceptation des présentes conditions générales d’utilisation (sans signature électronique).',
        },
        {
          title: '2. Interlocuteur unique & confidentialité',
          text: 'Le Super Admin est l’unique interlocuteur du client. Les tarifs restent confidentiels : chaque devis est préparé sur mesure après étude par l’équipe et les prestataires locaux. Aucune communication directe n’est autorisée entre un agent/livreur et un client.',
        },
        {
          title: '3. Acceptation du devis & contrat',
          text: 'L’acceptation d’un devis est effective lorsque le client clique sur « Accepter le devis » et envoie le message de confirmation obligatoire au Super Admin. Un contrat officiel PDF est alors généré et transmis par e-mail depuis le domaine BeniLink au client et à l’administration.',
        },
        {
          title: '4. Modalités de paiement (FedaPay)',
          text: 'Les modalités de paiement sont convenues dans chaque devis parmi les 5 modèles suivants (avec pourcentages libres selon le service) : (1) Tout au début (100 % avant démarrage), (2) Tout à la fin (100 % en fin de mission), (3) Moitié / moitié (50 % à 50 % d’avancement, 50 % à la fin), (4) Mensuel (montant fixe chaque mois), (5) Par étapes / jalons convenus. Chaque échéance donne lieu à un paiement FedaPay dédié.',
        },
        {
          title: '5. Conservation des pièces & suppression de compte',
          text: 'En cas de suppression de compte, les données personnelles sont anonymisées tandis que les pièces contractuelles, paiements et journaux obligatoires sont conservés conformément aux obligations légales.',
        },
      ],
    },
    'mentions-legales': {
      title: 'Mentions légales',
      body: [
        {
          title: 'Éditeur',
          text: 'BeniLink · Trust Hub Diaspora, Cotonou, République du Bénin.',
        },
        {
          title: 'Hébergement',
          text: 'Plateforme sécurisée haute disponibilité.',
        },
      ],
    },
  };

  const current = legalContent[type] || legalContent.confidentialite;

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9ff]">
      <PublicHeader />
      <main className="flex-1" id="main" tabIndex={-1}>
        <section className="page-banner bg-gradient-to-r from-[#006191] to-[#296197] py-12 text-white">
          <div className="mx-auto max-w-5xl px-6">
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{current.title}</h1>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-3xl px-6">
            <div className="rounded-3xl border border-[#d0e3f5] bg-white p-8 shadow-sm">
              <div className="grid gap-6">
                {current.body.map((item, idx) => (
                  <div key={idx}>
                    <h2 className="font-display mb-2 text-lg font-bold text-[#0d1d2b]">{item.title}</h2>
                    <p className="leading-relaxed text-[#3f4850]">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-[#d0e3f5] pt-5">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate(currentUser ? 'client-profile' : 'public-home')}
                >
                  <Icon name="arrow-left" size={16} />
                  <span>{currentUser ? 'Retour à mon profil' : 'Retour à l\'accueil'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
};
