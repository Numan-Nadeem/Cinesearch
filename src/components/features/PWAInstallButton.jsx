import { useState } from 'react';
import { Download, WifiOff } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../../hooks/usePWAInstall.js';

/**
 * Custom user-triggered PWA install prompt button and iOS installation modal (F7).
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
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:border-[#d93829]/50 hover:text-[#d93829] dark:hover:text-[#e84a3b] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#d93829] cursor-pointer transition-all duration-200"
      >
        <Download className="w-3.5 h-3.5 text-[#d93829]" aria-hidden="true" />
        <span className="hidden lg:inline">Install App</span>
      </button>

      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="glass-modal glass-enter w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="pwa-install-title"
              className="font-display text-lg font-bold text-zinc-900 dark:text-white mb-2"
            >
              Install CineSearch App
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
              Install CineSearch on your device for instant home-screen access and offline Watchlist browsing:
            </p>
            {isIOS ? (
              <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-700 dark:text-zinc-300 mb-6">
                <li>Tap the <strong>Share</strong> icon in your Safari toolbar.</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
              </ol>
            ) : (
              <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-700 dark:text-zinc-300 mb-6">
                <li>Click the install icon in your browser address bar or menu.</li>
                <li>Select <strong>Install CineSearch</strong> to launch it as a standalone app.</li>
              </ol>
            )}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full rounded-lg bg-[#d93829] py-2.5 text-xs font-semibold text-white hover:bg-[#b82d20] active:scale-[0.98] cursor-pointer transition-all"
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
 * Non-intrusive offline connectivity indicator banner (F7).
 */
export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="offline-banner"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 shadow-lg"
    >
      <WifiOff className="w-4 h-4" aria-hidden="true" />
      <span>Offline Mode — Showing cached results &amp; local Watchlist</span>
    </div>
  );
};
