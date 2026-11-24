import React from 'react';
import { Download, Share, WifiOff, X } from 'lucide-react';
import { usePwaInstall } from '../../utils/pwa';

export const PwaInstallBanner: React.FC = () => {
  const { canInstall, isIosInstallable, isInstalled, dismissed, isOnline, promptInstall, dismiss } = usePwaInstall();

  const showInstallBanner = !isInstalled && !dismissed && (canInstall || isIosInstallable);

  if (!isOnline) {
    return (
      <div
        role="status"
        className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-[#f2c02c] bg-[#ffdf93] px-4 py-3 text-xs font-medium text-[#241a00] shadow-lg"
      >
        <WifiOff className="h-4 w-4 shrink-0 text-[#765b00]" aria-hidden="true" />
        <span>Mode hors ligne : certaines données nécessitent une connexion Internet.</span>
      </div>
    );
  }

  if (!showInstallBanner) return null;

  return (
    <div
      role="region"
      aria-label="Installer l'application BeniLink"
      className="fixed bottom-4 left-4 z-40 max-w-sm rounded-2xl border border-[#d0e3f5] bg-white/95 p-3.5 shadow-[0_12px_32px_rgba(8,77,130,0.18)] backdrop-blur-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d0e3f5] bg-white p-1 shadow-sm">
          <img src="/assets/benilink-mark.png" alt="BeniLink" className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[#0d1d2b]">Installer BeniLink sur votre appareil</p>
          {canInstall ? (
            <p className="mt-0.5 text-[11px] leading-snug text-[#4c657a]">
              Accédez en un clic à vos dossiers et rapports depuis votre écran d'accueil.
            </p>
          ) : (
            <p className="mt-0.5 text-[11px] leading-snug text-[#4c657a]">
              Appuyez sur <Share className="inline h-3 w-3 text-[#006191]" aria-hidden="true" /> puis{' '}
              <strong>« Sur l'écran d'accueil »</strong>.
            </p>
          )}
          {canInstall && (
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => void promptInstall()}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#f7c531] px-3.5 py-1.5 text-xs font-bold text-[#10202e] shadow-sm transition hover:bg-[#e0a410]"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Installer l'app
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-full px-2.5 py-1.5 text-xs font-medium text-[#4c657a] hover:bg-[#edf4ff]"
              >
                Plus tard
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fermer l'invitation d'installation"
          className="rounded-lg p-1 text-[#4c657a] hover:bg-[#edf4ff] hover:text-[#0d1d2b]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
