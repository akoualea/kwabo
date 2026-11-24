import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  FileCheck2,
  FileText,
  MapPin,
  MessageSquare,
  Pause,
  Play,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Upload,
  Video,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartProject?: () => void;
}

const CHAPTERS = [
  {
    num: '01',
    title: 'Décrivez votre besoin',
    badge: 'Étape 1 · Demande en ligne',
    caption:
      'Sélectionnez le service, indiquez la commune au Bénin et déposez vos informations en 3 minutes.',
    voiceScript:
      'Étape 1 : Décrivez votre besoin. Sélectionnez votre service, précisez la commune au Bénin et envoyez votre demande guidée en moins de trois minutes.',
  },
  {
    num: '02',
    title: 'Échangez avec la Centrale',
    badge: 'Étape 2 · Coordination directe',
    caption:
      "L'administration centrale à Cotonou étudie votre dossier et échange directement avec vous dans votre messagerie sécurisée.",
    voiceScript:
      "Étape 2 : Échangez avec la Centrale. Notre coordination à Cotonou analyse votre dossier et discute directement avec vous, sans aucun intermédiaire opaque.",
  },
  {
    num: '03',
    title: 'Validez devis & contrat',
    badge: 'Étape 3 · Devis confidentiel & contrat',
    caption:
      'Recevez un devis personnalisé après étude locale accompagné d’un contrat clair avant le démarrage de la mission.',
    voiceScript:
      'Étape 3 : Validez votre devis et votre contrat. Vous recevez un devis confidentiel préparé avec nos équipes locales et un contrat officiel clair.',
  },
  {
    num: '04',
    title: 'Suivez en temps réel',
    badge: 'Étape 4 · Preuves certifiées',
    caption:
      'Consultez vos vidéos 360°, photos horodatées et reçus scannés directement dans votre coffre-fort numérique.',
    voiceScript:
      'Étape 4 : Suivez en temps réel. Retrouvez vos vidéos 360 degrés, vos photos horodatées et tous les reçus scannés directement dans votre coffre-fort numérique.',
  },
];

const FALLBACK_STEP_MS = 6500;

const StepSceneIllustration: React.FC<{ stepIndex: number }> = ({ stepIndex }) => {
  if (stepIndex === 0) {
    return (
      <div className="relative flex w-full items-center justify-center px-3 py-2.5 sm:px-6 sm:py-4">
        <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white p-3.5 sm:p-4 text-left shadow-2xl animate-[scenePop_0.5s_ease-out_both]">
          <div className="mb-3 flex items-center justify-between">
            <span className="rounded-full bg-[#e3efff] px-3 py-1 text-[11px] font-bold text-[#006191]">
              Nouvelle demande BeniLink
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4c657a]">
              <MapPin className="h-3.5 w-3.5 text-[#006191]" />
              Cotonou · Calavi
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['Suivi de chantier', 'Foncier & Titre', 'Santé proches', 'Actes ANIP'].map((item, i) => (
              <div
                key={item}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  i === 0
                    ? 'border-[#006191] bg-[#edf5ff] text-[#006191] shadow-xs'
                    : 'border-[#dceafa] bg-[#f8fbff] text-[#4c657a]'
                }`}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-[#006191]/40 bg-[#f4f9ff] px-3 py-2 text-xs text-[#006191]">
            <Upload className="h-4 w-4 shrink-0" />
            <span className="font-medium">Plan_parcelle_Calavi.pdf ajouté</span>
            <CheckCircle2 className="ml-auto h-4 w-4 text-[#006191]" />
          </div>
          <div className="mt-3 flex items-center justify-center rounded-full bg-[#f7c531] py-2 text-xs font-bold text-[#10202e] shadow-sm animate-pulse">
            Envoyer ma demande gratuite →
          </div>
        </div>
      </div>
    );
  }

  if (stepIndex === 1) {
    return (
      <div className="relative flex w-full items-center justify-center px-3 py-2.5 sm:px-6 sm:py-4">
        <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white p-3.5 sm:p-4 text-left shadow-2xl animate-[scenePop_0.5s_ease-out_both]">
          <div className="mb-3 flex items-center justify-between border-b border-[#edf4ff] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#006191] text-white">
                <MessageSquare className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-[#0d1d2b]">Coordination Cotonou</p>
                <p className="text-[10px] font-semibold text-[#006191]">Canal direct sécurisé</p>
              </div>
            </div>
            <ShieldCheck className="h-5 w-5 text-[#f7c531]" />
          </div>
          <div className="space-y-2.5">
            <div className="ml-auto max-w-[82%] rounded-2xl rounded-br-sm bg-[#006191] px-3.5 py-2 text-xs text-white shadow-xs">
              Bonjour, je souhaite un suivi vidéo de mon chantier à Abomey-Calavi.
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-[#d0e3f5] bg-[#edf4ff] px-3.5 py-2 text-xs text-[#0d1d2b]">
              Bonjour ! Dossier bien reçu. Notre équipe consulte nos prestataires et prépare votre devis personnalisé.
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ffdf93]/55 px-3 py-1 text-[11px] font-semibold text-[#594400]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#006191] animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#006191] animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#006191] animate-bounce [animation-delay:300ms]" />
              <span className="ml-1">Échange direct sans intermédiaire</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stepIndex === 2) {
    return (
      <div className="relative flex w-full items-center justify-center px-3 py-2.5 sm:px-6 sm:py-4">
        <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white p-3.5 sm:p-4 text-left shadow-2xl animate-[scenePop_0.5s_ease-out_both]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e3efff] text-[#006191]">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-[#0d1d2b]">Devis &amp; Contrat de mission</p>
                <p className="text-[10px] text-[#4c657a]">Tarif confidentiel · Modalités flexibles</p>
              </div>
            </div>
            <span className="rounded-full bg-[#ffdf93] px-2.5 py-1 text-[10px] font-bold text-[#241a00]">
              Vérifié
            </span>
          </div>
          <div className="space-y-2 rounded-xl bg-[#f7faff] p-3 text-xs text-[#3f4850]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#006191]" />
              <span>Périmètre détaillé et délai garanti</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#006191]" />
              <span>Copie officielle envoyée par e-mail</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-[#d0e3f5] px-3.5 py-2.5">
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-[#6f7881]">Signature électronique</span>
              <svg viewBox="0 0 160 32" className="mt-0.5 h-7 w-36 text-[#006191]" fill="none">
                <path
                  d="M6 24 C22 4, 34 28, 52 14 C64 4, 72 26, 92 16 C112 8, 130 22, 152 12"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: 240,
                    strokeDashoffset: 240,
                    animation: 'signDraw 1.6s ease-out 0.3s forwards',
                  }}
                />
              </svg>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#006191] px-3 py-1.5 text-[11px] font-bold text-white">
              <FileCheck2 className="h-3.5 w-3.5 text-[#f7c531]" />
              Approuvé
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full items-center justify-center px-3 py-2.5 sm:px-6 sm:py-4">
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white p-3.5 sm:p-4 text-left shadow-2xl animate-[scenePop_0.5s_ease-out_both]">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#006191] px-3 py-1 text-[11px] font-bold text-white">
            <Video className="h-3.5 w-3.5 text-[#f7c531]" />
            Coffre-fort numérique 360°
          </span>
          <span className="text-[11px] font-bold text-[#006191]">100% Horodaté</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-[#d0e3f5] bg-gradient-to-br from-[#084d82] to-[#006191] p-3 text-white">
            <div className="flex items-center justify-between">
              <span className="rounded bg-[#f7c531] px-1.5 py-0.5 text-[9px] font-bold text-[#10202e]">
                VIDÉO 360°
              </span>
              <span className="h-2 w-2 rounded-full bg-[#f7c531] animate-ping" />
            </div>
            <p className="mt-3 text-xs font-bold">Visite chantier</p>
            <p className="text-[10px] text-[#cbe6ff]">GPS · Cotonou</p>
          </div>
          <div className="flex flex-col justify-between rounded-xl border border-[#d0e3f5] bg-[#edf4ff] p-3">
            <div className="flex items-center gap-1.5 text-[#006191]">
              <Receipt className="h-4 w-4" />
              <span className="text-xs font-bold">Reçus scannés</span>
            </div>
            <p className="mt-2 text-[11px] text-[#3f4850]">
              Chaque dépense justifiée et archivée.
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#006191]">
              <CheckCircle2 className="h-3.5 w-3.5" /> Rapport validé
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HowItWorksVideoModal: React.FC<Props> = ({ isOpen, onClose, onStartProject }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerRef = useRef<number | null>(null);

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      if (timerRef.current) window.clearTimeout(timerRef.current);
      return;
    }
    setActiveIndex(0);
    setIsPlaying(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopSpeech();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !isPlaying) {
      stopSpeech();
      if (timerRef.current) window.clearTimeout(timerRef.current);
      return undefined;
    }

    const chapter = CHAPTERS[activeIndex];
    let cancelled = false;

    const advanceNext = () => {
      if (cancelled) return;
      setActiveIndex((prev) => (prev + 1) % CHAPTERS.length);
    };

    if (timerRef.current) window.clearTimeout(timerRef.current);
    stopSpeech();

    const canSpeak =
      !isMuted &&
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined';

    if (canSpeak) {
      const utterance = new SpeechSynthesisUtterance(chapter.voiceScript);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.98;
      utterance.pitch = 1;

      const voices = window.speechSynthesis.getVoices();
      const frVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith('fr') && /natural|google|denise|henri|amélie/i.test(v.name)) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('fr'));
      if (frVoice) utterance.voice = frVoice;

      utterance.onstart = () => {
        if (!cancelled) setIsSpeaking(true);
      };
      utterance.onend = () => {
        if (cancelled) return;
        setIsSpeaking(false);
        timerRef.current = window.setTimeout(advanceNext, 700);
      };
      utterance.onerror = () => {
        if (cancelled) return;
        setIsSpeaking(false);
        timerRef.current = window.setTimeout(advanceNext, FALLBACK_STEP_MS);
      };

      window.speechSynthesis.speak(utterance);
      // Safety fallback in case browser blocks autoplay speech without user gesture
      timerRef.current = window.setTimeout(() => {
        if (!cancelled && !window.speechSynthesis.speaking) {
          advanceNext();
        }
      }, FALLBACK_STEP_MS + 1500);
    } else {
      timerRef.current = window.setTimeout(advanceNext, FALLBACK_STEP_MS);
    }

    return () => {
      cancelled = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      stopSpeech();
    };
  }, [isOpen, isPlaying, isMuted, activeIndex]);

  if (!isOpen) return null;

  const chapter = CHAPTERS[activeIndex];

  return (
    <div
      className="no-scrollbar fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#06243d]/80 p-2.5 sm:p-4 backdrop-blur-md"
      onClick={() => {
        stopSpeech();
        onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Vidéo explicative BeniLink"
    >
      <style>{`
        @keyframes scenePop {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes signDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes waveBar {
          0%, 100% { height: 5px; }
          50% { height: 15px; }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="no-scrollbar my-auto flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-y-auto rounded-2xl sm:rounded-[1.5rem] border border-white/20 bg-[#072b4a] shadow-2xl"
      >
        {/* Top Modal Header */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#052139] px-4 py-2.5 sm:px-5 text-white">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#f7c531] text-[#10202e]">
              <Play className="ml-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs sm:text-sm font-bold">Comment fonctionne BeniLink</p>
              <p className="truncate text-[10px] sm:text-[11px] text-[#cbe6ff]">Démonstration guidée avec voix off</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {isSpeaking && !isMuted && (
              <div className="hidden sm:flex items-end gap-0.5 rounded-full bg-white/10 px-2.5 py-1" aria-hidden="true">
                <span className="w-1 rounded-full bg-[#f7c531]" style={{ animation: 'waveBar 0.7s ease-in-out infinite' }} />
                <span className="w-1 rounded-full bg-[#f7c531]" style={{ animation: 'waveBar 0.7s ease-in-out 0.15s infinite' }} />
                <span className="w-1 rounded-full bg-[#f7c531]" style={{ animation: 'waveBar 0.7s ease-in-out 0.3s infinite' }} />
                <span className="ml-1.5 text-[10px] font-semibold text-[#ffdf93]">Voix active</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsMuted((m) => !m)}
              aria-label={isMuted ? 'Activer la voix off' : 'Couper la voix off'}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-[#ffdf93]" /> : <Volume2 className="h-4 w-4 text-[#f7c531]" />}
            </button>
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              aria-label="Fermer la vidéo"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Animated Illustrated Stage */}
        <div className="relative flex shrink-0 flex-col justify-between bg-gradient-to-br from-[#006191] via-[#084d82] to-[#05233e]">
          <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-[#f7c531]/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#1593d6]/25 blur-3xl" />

          <div className="relative z-10 flex items-center justify-between gap-2 px-4 pt-2.5 sm:px-6 sm:pt-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[11px] font-bold text-[#ffdf93] backdrop-blur-md">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#f7c531] animate-pulse" />
              <span className="truncate">{chapter.badge}</span>
            </span>
            <span className="shrink-0 text-xs font-bold text-white/80 tnum">
              {activeIndex + 1} / {CHAPTERS.length}
            </span>
          </div>

          <div key={chapter.num} className="relative z-10">
            <StepSceneIllustration stepIndex={activeIndex} />
          </div>

          {/* Caption & Video Controls */}
          <div className="relative z-10 border-t border-white/10 bg-[#041d33]/75 px-4 py-2.5 sm:px-6 sm:py-3 backdrop-blur-md">
            <div className="flex flex-col gap-0.5 text-left">
              <h3 className="font-display text-sm font-bold text-white sm:text-base">
                {chapter.num}. {chapter.title}
              </h3>
              <p className="text-[11px] leading-relaxed text-[#dbeeff] sm:text-xs">{chapter.caption}</p>
            </div>

            <div className="mt-2.5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? 'Mettre en pause' : 'Lire'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f7c531] text-[#10202e] shadow transition hover:bg-[#e0a410]"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="ml-0.5 h-3.5 w-3.5" />}
              </button>

              <div className="grid flex-1 grid-cols-4 gap-1.5 sm:gap-2">
                {CHAPTERS.map((chap, idx) => (
                  <button
                    key={chap.num}
                    type="button"
                    onClick={() => {
                      setActiveIndex(idx);
                      setIsPlaying(true);
                    }}
                    aria-label={`Étape ${chap.num} : ${chap.title}`}
                    className={`h-1.5 sm:h-2 rounded-full transition-all ${
                      idx <= activeIndex ? 'bg-[#f7c531]' : 'bg-white/25 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveIndex(0);
                  setIsPlaying(true);
                }}
                aria-label="Rejouer"
                title="Rejouer depuis le début"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Chapter Tabs */}
        <div className="grid shrink-0 grid-cols-2 border-t border-white/10 bg-[#052139] sm:grid-cols-4">
          {CHAPTERS.map((chap, idx) => (
            <button
              key={chap.num}
              type="button"
              onClick={() => {
                setActiveIndex(idx);
                setIsPlaying(true);
              }}
              className={`flex flex-col items-start gap-0.5 border-b border-r border-white/10 px-3 py-2 sm:border-b-0 sm:px-3.5 sm:py-2.5 text-left transition last:border-r-0 ${
                idx === activeIndex
                  ? 'bg-[#006191] text-white'
                  : 'text-[#cbe6ff] hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#f7c531] tnum">
                Étape {chap.num}
              </span>
              <span className="text-[11px] font-semibold leading-tight">{chap.title}</span>
            </button>
          ))}
        </div>

        {onStartProject && (
          <div className="flex shrink-0 flex-col items-center justify-between gap-2 border-t border-white/10 bg-[#041a2e] px-4 py-2.5 text-center sm:flex-row sm:px-5 sm:text-left">
            <span className="text-[11px] sm:text-xs text-[#cbe6ff]">Prêt à démarrer votre démarche au Bénin ?</span>
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                onClose();
                onStartProject();
              }}
              className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#f7c531] px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-[#10202e] shadow transition hover:bg-[#e0a410]"
            >
              Initier une demande →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
