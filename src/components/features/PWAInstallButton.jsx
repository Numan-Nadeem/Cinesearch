import { useState } from 'react';
import { DownloadSimple, WifiSlash } from '@phosphor-icons/react';
import { usePWAInstall, useOnlineStatus } from '../../hooks/usePWAInstall.js';

/**
 * Custom user-triggered PWA install prompt button and iOS installation modal.
 */
export const PWAInstallButton = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleTrigger = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleTrigger}
        aria-label="Install CineSearch App"
        title="Install CineSearch to your home screen or desktop"
        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300/80 dark:border-white/12 bg-[#fcfbf8] dark:bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:border-[#c83a2b] dark:hover:border-[#d94636] hover:text-stone-950 dark:hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0"
      >
        <DownloadSimple
          size={14}
          weight="duotone"
          className="text-[#c83a2b] dark:text-[#d94636]"
          aria-hidden="true"
        />
        <span className="hidden xl:inline">Install</span>
      </button>

      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-[#f7f4ee] dark:bg-[#131317] p-6 shadow-2xl border border-stone-300 dark:border-white/12"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="pwa-install-title"
              className="font-display text-lg font-bold text-stone-900 dark:text-white mb-2"
            >
              Install CineSearch App
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              Install CineSearch on your device for instant home-screen access and offline Watchlist browsing:
            </p>
            {isIOS ? (
              <ol className="list-decimal list-inside space-y-2 text-sm text-stone-700 dark:text-stone-300 mb-6">
                <li>Tap the <strong>Share</strong> icon in your Safari toolbar.</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
              </ol>
            ) : (
              <ol className="list-decimal list-inside space-y-2 text-sm text-stone-700 dark:text-stone-300 mb-6">
                <li>Click the install icon in your browser address bar or menu.</li>
                <li>Select <strong>Install CineSearch</strong> to launch it as a standalone app.</li>
              </ol>
            )}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full rounded-lg bg-[#c83a2b] py-2.5 text-xs font-semibold text-white hover:bg-[#a92e21] active:scale-[0.98] cursor-pointer transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Non-intrusive offline connectivity indicator banner.
 */
export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="offline-banner"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-[#b87d24] px-3.5 py-2 text-xs font-semibold text-white shadow-lg"
    >
      <WifiSlash size={16} aria-hidden="true" />
      <span>Offline Mode — Showing cached results &amp; local Watchlist</span>
    </div>
  );
};
