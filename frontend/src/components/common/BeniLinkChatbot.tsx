import React, { useEffect, useRef, useState } from 'react';
import { MessageCircleMore, Send, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FAQ_LIST, WHATSAPP_LINK } from '../../data/kwaboData';
import { formatSlaLabel, getServiceSlaDays } from '../../utils/contractsAndSla';
import { Service } from '../../types';

interface ChatMsg {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  suggestedService?: Service;
  actionLabel?: string;
  actionType?: 'start-request' | 'login' | 'register';
}

const SMS_ALIASES: Record<string, string> = {
  ki: 'qui',
  koi: 'quoi',
  kwa: 'quoi',
  kua: 'quoi',
  cest: 'c est',
  sest: 'c est',
  tes: 'tu es',
  ke: 'que',
  cmt: 'comment',
  coment: 'comment',
  comen: 'comment',
  commen: 'comment',
  komment: 'comment',
  koman: 'comment',
  joune: 'journee',
  journe: 'journee',
  soire: 'soiree',
  matine: 'matinee',
  b1: 'bien',
  trkl: 'tranquille',
  pk: 'pourquoi',
  pq: 'pourquoi',
  prk: 'pourquoi',
  pkoi: 'pourquoi',
  cb: 'combien',
  cbien: 'combien',
  kombien: 'combien',
  mrc: 'merci',
  mrci: 'merci',
  mci: 'merci',
  dmd: 'demande',
  demde: 'demande',
  payement: 'paiement',
  paiemen: 'paiement',
  srvice: 'service',
  srv: 'service',
  tel: 'telephone',
  num: 'numero',
  msg: 'message',
  oki: 'ok',
  dac: 'ok',
  dacc: 'ok',
  ui: 'oui',
  oe: 'oui',
  ouai: 'oui',
  wep: 'oui',
  nn: 'non',
  nan: 'non',
};

const normalizeText = (raw: string) => {
  const cleaned = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[?!.,;:'"()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned
    .split(' ')
    .map((w) => SMS_ALIASES[w] || w)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Lightweight typo-tolerant matching (handles swaps/missing letters like "demnade" -> "demande")
const isCloseWord = (a: string, b: string): boolean => {
  if (a === b) return true;
  if (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a))) return true;
  if (a.length < 5 || b.length < 5 || Math.abs(a.length - b.length) > 1) return false;
  // Adjacent transposition check (e.g. demnade vs demande)
  if (a.length === b.length) {
    let diffs: number[] = [];
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) diffs.push(i);
    }
    if (diffs.length === 1) return true;
    if (
      diffs.length === 2 &&
      diffs[1] === diffs[0] + 1 &&
      a[diffs[0]] === b[diffs[1]] &&
      a[diffs[1]] === b[diffs[0]]
    ) {
      return true;
    }
    return false;
  }
  // 1 insertion/deletion
  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
  let i = 0;
  let j = 0;
  let skipped = false;
  while (i < shorter.length && j < longer.length) {
    if (shorter[i] === longer[j]) {
      i++;
      j++;
    } else if (!skipped) {
      skipped = true;
      j++;
    } else {
      return false;
    }
  }
  return true;
};

const hasTopicWord = (words: string[], keywords: string[]): boolean =>
  words.some((w) => keywords.some((kw) => isCloseWord(w, kw)));

const QUICK_PROMPTS = [
  { label: 'Services', query: 'Quels services proposez-vous ?' },
  { label: 'Devis', query: 'Comment obtenir un devis ?' },
  { label: 'Délais', query: 'Quels sont vos délais ?' },
  { label: 'Paiements', query: 'Devises & paiements' },
];

export const BeniLinkChatbot: React.FC = () => {
  const { services, currentUser, role, openServiceModal, navigate } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastTopic, setLastTopic] = useState<string>('welcome');
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Bonjour ! Je suis l'assistant BeniLink. Posez-moi une question sur nos services au Bénin, les devis confidentiels, les délais ou le suivi de vos projets.",
    },
  ]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isTyping, open]);

  const firstName = currentUser?.firstName ? ` ${currentUser.firstName}` : '';

  const buildReply = (rawQuestion: string): ChatMsg => {
    const q = normalizeText(rawQuestion);
    const words = q.split(' ').filter(Boolean);

    // 1. Salutations (cc, coucou, salut, slt, bjr, bonjour, bonsoir, hello, hi, yo...)
    const greetingPattern =
      /^(cc|coucou|salut|slt|bjr|bonjour|bonsoir|bsr|hello|hi|hey|yo|salam|wesh|allo|bon matin)(\s+(a tous|tout le monde|benilink|assistant|ca va|cava|cv))?$/;
    if (greetingPattern.test(q)) {
      setLastTopic('greeting');
      if (/\b(ca va|cava|cv)\b/.test(q)) {
        return {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `Coucou${firstName} ! Ça va très bien, merci. Et vous ? Comment puis-je vous aider aujourd'hui sur BeniLink ?`,
        };
      }
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Coucou${firstName} ! Ravi de vous retrouver. Comment puis-je vous aider aujourd'hui ? Vous avez un projet au Bénin ou une question sur un service ?`,
      };
    }

    // 2. "Ça va ?" / "C'est comment ta journée ?" / "Comment vas-tu ?" / "La forme ?"
    if (
      /^(ca va|cava|cv|c est comment|comment ca va|comment vas tu|comment tu vas|comment allez vous|tu vas bien|vous allez bien|la forme|quoi de neuf|ca dit quoi)$/.test(
        q
      ) ||
      (hasTopicWord(words, ['journee', 'soiree', 'matinee', 'forme', 'nouvelle', 'nouvelles']) &&
        hasTopicWord(words, ['comment', 'passe', 'va', 'bien', 'quoi', 'ta', 'votre']))
    ) {
      setLastTopic('smalltalk');
      if (hasTopicWord(words, ['journee', 'soiree', 'matinee'])) {
        return {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `Ma journée se passe super bien, merci de demander${firstName} ! Toujours prêt à vous aider sur vos projets au Bénin. Et la vôtre ? En quoi puis-je vous être utile aujourd'hui ?`,
        };
      }
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Je vais très bien, merci${firstName} ! Et de votre côté ? Dites-moi ce dont vous avez besoin au Bénin (chantier, foncier, santé des proches, démarches ANIP, livraison...) et je vous guide tout de suite.`,
      };
    }

    // 3. Réponse positive courte ("oui", "bien et toi", "super", "je veux bien")
    if (/^(oui|ouais|yes|ok|okay|d accord|daccord|super|bien|tres bien|parfait|cool|top|genial|compris|entendu|bien merci|ca va bien)$/.test(q)) {
      if (lastTopic === 'greeting' || lastTopic === 'smalltalk') {
        setLastTopic('needs');
        return {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: "Super ! Quel type de projet souhaitez-vous réaliser au Bénin ? Par exemple : suivi de chantier, vérification foncière, soutien médical à un proche, acte ANIP ou livraison.",
        };
      }
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "Parfait ! Si vous êtes prêt(e), vous pouvez lancer une demande gratuite en 3 minutes ou me poser une autre question.",
        actionLabel: 'Initier une demande →',
        actionType: 'start-request',
      };
    }

    // 4. Remerciements
    if (/\b(merci|remercie|thank|thanks|thx)\b/.test(q)) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Avec grand plaisir${firstName} ! Je reste disponible si vous avez d'autres questions sur BeniLink.`,
      };
    }

    // 5. Au revoir
    if (/\b(au revoir|aurevoir|bye|a bientot|a plus|bonne journee|bonne soiree|bonne nuit|ciao)\b/.test(q)) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `À très bientôt${firstName} sur BeniLink ! N'hésitez pas à revenir quand vous voulez.`,
      };
    }

    // 6. Specific domain topics FIRST (so "c'est quoi une demnade sur benilink" hits "demande", not generic "benilink")

    // 6a. Qu'est-ce qu'une demande / Comment faire une demande
    if (hasTopicWord(words, ['demande', 'demandes', 'initier', 'soumettre', 'dossier', 'mission'])) {
      setLastTopic('request');
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "Une demande sur BeniLink est le dossier que vous créez pour nous confier un besoin précis au Bénin (suivi de chantier, foncier, santé d'un proche, acte ANIP, livraison…). Vous renseignez le service, la commune, votre délai souhaité et votre modalité de paiement préférée ; ensuite le Super Admin échange avec vous, consulte notre équipe locale et vous transmet un devis sur mesure.",
        actionLabel: 'Initier une demande →',
        actionType: 'start-request',
      };
    }

    // 6b. Comment ça marche / Fonctionnement
    if (/\b(comment ca marche|ca marche comment|fonctionne|fonctionnement|etape|procede|processus)\b/.test(q)) {
      setLastTopic('how');
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "C'est très simple : 1) Vous décrivez votre besoin et votre délai souhaité, 2) le Super Admin échange avec vous puis consulte notre équipe et nos prestataires locaux, 3) vous recevez un devis sur mesure et un contrat PDF, 4) vous suivez l'avancement avec preuves horodatées jusqu'à la clôture !",
        actionLabel: 'Initier une demande →',
        actionType: 'start-request',
      };
    }

    // 7. Inscription / Compte / Connexion / Parrainage
    if (hasTopicWord(words, ['inscrire', 'inscription', 'compte', 'connexion', 'connecter', 'parrainage', 'parrain'])) {
      setLastTopic('account');
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "La création de compte est gratuite : renseignez votre nom, prénom, pays (tous les pays du monde sont pris en charge avec devise automatique), e-mail, téléphone et confirmez votre code à 6 chiffres. Le code de parrainage est facultatif.",
        actionLabel: currentUser ? 'Mon espace →' : 'Créer un compte →',
        actionType: currentUser ? 'start-request' : 'register',
      };
    }

    // 8. Confiance / Sécurité / Contact / Agent / WhatsApp
    if (hasTopicWord(words, ['confiance', 'securite', 'arnaque', 'fiable', 'preuve', 'preuves', 'photo', 'video', 'agent', 'contact', 'whatsapp', 'appeler', 'numero', 'telephone'])) {
      setLastTopic('trust');
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "Chez BeniLink, vous échangez exclusivement avec le Super Admin (aucun agent ne vous contacte directement ni ne voit vos données personnelles). Chaque mission inclut des preuves horodatées (photos, vidéos 360°, reçus). Vous pouvez aussi nous écrire directement sur WhatsApp.",
      };
    }

    // 9. Devis / Prix / Tarifs
    if (hasTopicWord(words, ['prix', 'tarif', 'tarifs', 'cout', 'combien', 'devis', 'gratuit', 'budget'])) {
      setLastTopic('quote');
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "Chez BeniLink, les tarifs sont strictement confidentiels et ne sont pas affichés publiquement. Après votre demande, le Super Admin échange avec vous, consulte l'équipe et les prestataires locaux, puis vous envoie un devis sur mesure.",
        actionLabel: 'Demander un devis gratuit →',
        actionType: 'start-request',
      };
    }

    // 10. Délais
    if (hasTopicWord(words, ['delai', 'delais', 'temps', 'duree', 'rapide', 'jours'])) {
      setLastTopic('sla');
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "Vous indiquez votre délai souhaité lors de la demande. Le délai définitif est fixé dans votre devis après étude locale (ex. 48h ouvrées pour la santé/livraisons, 3 à 7 jours ouvrés pour l'ANIP, le foncier ou le suivi de chantier) avec suivi en temps réel.",
      };
    }

    // 11. Devises / Paiements / FedaPay
    if (hasTopicWord(words, ['devise', 'devises', 'monnaie', 'euro', 'fcfa', 'dollar', 'payer', 'paiement', 'paiements', 'fedapay', 'carte', 'echeance', 'echeances', 'moitie', 'mensuel'])) {
      setLastTopic('payment');
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "BeniLink prend en charge toutes les devises du monde (adaptées selon votre pays). Le paiement passe par FedaPay selon la modalité convenue dans votre devis : tout au début, tout à la fin, moitié/moitié, mensuel ou par étapes/jalons.",
      };
    }

    // 12. Contrat
    if (hasTopicWord(words, ['contrat', 'contrats', 'signature', 'email', 'gmail', 'conditions'])) {
      setLastTopic('contract');
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "Pour accepter un devis, vous cliquez sur « Accepter le devis » puis envoyez un message de confirmation au Super Admin. Un contrat officiel PDF BeniLink est alors généré et transmis par e-mail depuis le domaine BeniLink au client et à l'administration.",
      };
    }

    // 13. Matching service in live catalog
    const matchedService = services.find((s) => {
      const hay = normalizeText(`${s.name} ${s.short} ${s.slug} ${s.included.join(' ')}`);
      return words.some((w) => w.length >= 4 && hay.includes(w));
    });

    if (matchedService) {
      setLastTopic(`service:${matchedService.id}`);
      const sla = formatSlaLabel(getServiceSlaDays(matchedService.slug || matchedService.id, matchedService.cat));
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Notre prestation « ${matchedService.name} » correspond exactement à ce besoin : ${matchedService.short} Délai moyen annoncé : ${sla}. Notre équipe consulte nos prestataires locaux puis vous transmet un devis sur mesure.`,
        suggestedService: matchedService,
      };
    }

    // 14. Liste générale des services
    if (hasTopicWord(words, ['service', 'services', 'propose', 'proposez', 'catalogue', 'prestation', 'prestations', 'projet', 'projets'])) {
      setLastTopic('services');
      const topNames = services.slice(0, 5).map((s) => s.name).join(', ');
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Nous accompagnons la diaspora sur ${services.length || 12} prestations certifiées au Bénin : ${topNames || 'Suivi de chantier, Foncier, Santé des proches, Actes ANIP, Logistique'}… Dites-moi celui qui vous intéresse !`,
      };
    }

    // 15. Match FAQ
    const faqMatch = FAQ_LIST.find((item) => {
      const hay = normalizeText(`${item.q} ${item.a}`);
      return words.some((w) => w.length >= 5 && hay.includes(w));
    });
    if (faqMatch) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: faqMatch.a,
      };
    }

    // 16. Qui es-tu / C'est quoi BeniLink (ONLY when no more specific topic matched)
    if (
      /\b(qui est? tu|tu est? qui|t es qui|tes qui|qui etes vous|vous etes qui|comment tu t appel|ton nom|c est quoi|cest quoi|qu est ce que|quest ce que|benilink|presente|presentation|humain|robot|tu fais quoi|que fais tu|tu sers a quoi)\b/.test(
        q
      )
    ) {
      setLastTopic('about');
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "Je suis l'assistant virtuel de BeniLink, la plateforme de confiance dédiée à la diaspora béninoise. Mon rôle est de vous informer sur nos services au Bénin (chantier, foncier, santé, démarches ANIP, logistique) et de vous guider jusqu'à votre demande de devis sur mesure avec le Super Admin.",
      };
    }

    // 16. Conversational fallback
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: "Je ne suis pas certain d'avoir bien saisi votre message. Pouvez-vous me préciser si vous cherchez un service au Bénin (chantier, foncier, santé, ANIP, livraison…), des infos sur un devis, les délais ou les paiements ?",
    };
  };

  const handleSend = (textToSend?: string) => {
    const clean = (textToSend ?? input).trim();
    if (!clean) return;
    const userMsg: ChatMsg = { id: `u-${Date.now()}`, sender: 'user', text: clean };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    window.setTimeout(() => {
      const reply = buildReply(clean);
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 320);
  };

  const handleStartRequest = () => {
    setOpen(false);
    if (!currentUser) navigate('register');
    else if (role === 'USER') navigate('client-new-request');
    else navigate('client-dashboard');
  };

  const isPublic = role === 'VISITOR';

  return (
    <>
      {/* Floating Launcher Button (low on client workspace; just above WhatsApp on public pages) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer l'assistant BeniLink" : "Ouvrir l'assistant BeniLink"}
        title="Assistant BeniLink"
        className={`fixed right-4 sm:right-5 z-40 flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-gradient-to-br from-[#1593d6] via-[#006191] to-[#084d82] text-white shadow-[0_10px_28px_rgba(8,77,130,0.42)] ring-2 ring-white/80 transition hover:scale-105 hover:shadow-[0_14px_32px_rgba(8,77,130,0.52)] ${
          isPublic ? 'bottom-[78px] sm:bottom-[82px]' : 'bottom-5'
        }`}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <span className="relative flex items-center justify-center">
            <MessageCircleMore className="h-6 w-6 text-white" aria-hidden="true" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#006191] bg-[#f7c531]" />
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Assistant BeniLink"
          className="fixed inset-x-2 top-2 bottom-2 sm:inset-auto sm:right-5 sm:bottom-5 sm:w-[460px] md:w-[500px] sm:h-[min(740px,calc(100dvh-32px))] z-[999] flex flex-col overflow-hidden rounded-2xl border border-[#d0e3f5] bg-white shadow-[0_24px_60px_rgba(4,29,51,0.34)]"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-2 bg-gradient-to-r from-[#004b73] via-[#006191] to-[#0074ad] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white p-1.5 shadow-sm">
                <img
                  src="/assets/benilink-mark.png"
                  alt="BeniLink"
                  className="h-full w-full object-contain"
                />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight">Assistant BeniLink</p>
                <p className="truncate text-[11px] text-[#cbe6ff]">Orientation services &amp; questions</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Messages — large spacious reading area */}
          <div className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#f7f9ff] p-3.5 sm:p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[13px] sm:text-[13.5px] leading-relaxed shadow-2xs ${
                    m.sender === 'user'
                      ? 'rounded-br-sm bg-[#006191] text-white'
                      : 'rounded-bl-sm border border-[#d0e3f5] bg-white text-[#0d1d2b]'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.suggestedService && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        openServiceModal(m.suggestedService!);
                      }}
                      className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#f7c531] px-3 py-1 text-[11px] font-bold text-[#10202e] hover:bg-[#e0a410]"
                    >
                      Voir « {m.suggestedService.name} » →
                    </button>
                  )}
                  {m.actionLabel && m.actionType && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        if (m.actionType === 'register') navigate('register');
                        else if (m.actionType === 'login') navigate('login');
                        else handleStartRequest();
                      }}
                      className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#f7c531] px-3 py-1 text-[11px] font-bold text-[#10202e] hover:bg-[#e0a410]"
                    >
                      {m.actionLabel}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start">
                <div className="inline-flex items-center gap-1 rounded-2xl rounded-bl-sm border border-[#d0e3f5] bg-white px-3.5 py-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#006191] animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#006191] animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#006191] animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick prompts — 4 cadres alignés sur 1 seule ligne sur mobile et PC */}
          <div className="grid shrink-0 grid-cols-4 gap-1 border-t border-[#d0e3f5] bg-white px-2.5 py-2">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => handleSend(q.query)}
                className="truncate rounded-full border border-[#d0e3f5] bg-[#edf4ff] px-1.5 py-1.5 text-center text-[10px] sm:text-[11px] font-semibold leading-none text-[#006191] transition hover:bg-[#d9eafd]"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input & Quick Actions */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex shrink-0 items-center gap-2 border-t border-[#d0e3f5] bg-white px-3 py-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question…"
              style={{ minHeight: '42px' }}
              className="min-w-0 flex-1 rounded-full border border-[#d0e3f5] bg-[#f7f9ff] px-4 py-2 text-[13px] text-[#0d1d2b] outline-none focus:border-[#006191]"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Envoyer"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#006191] text-white transition hover:bg-[#084d82] disabled:opacity-45"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[#d0e3f5] bg-[#edf4ff] px-3.5 py-2.5 text-xs">
            <button
              type="button"
              onClick={handleStartRequest}
              className="font-bold text-[#006191] hover:underline"
            >
              Initier une demande →
            </button>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#4c657a] hover:text-[#006191]"
            >
              Parler sur WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
};
