import { useState } from 'react';
import { Link2, Check, Share2 } from 'lucide-react';
import { FaXTwitter, FaWhatsapp, FaRedditAlien } from 'react-icons/fa6';

/**
 * Copy-link and social share actions row for movie details (F3).
 */
const ShareRow = ({ title, year }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== 'undefined' ? window.location.href : 'https://cinesearchpk.netlify.app';
  const shareText = `Explore "${title}"${year ? ` (${year})` : ''} on CineSearch`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator?.share) {
      try {
        await navigator.share({
          title: `${title} | CineSearch`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled share sheet
      }
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Share this title">
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label={copied ? 'Link copied to clipboard' : 'Copy page link'}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#d93829] ${
          copied
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            : 'border-zinc-300/80 dark:border-white/10 bg-white dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-white/20 hover:text-zinc-950 dark:hover:text-white'
        }`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Link copied</span>
          </>
        ) : (
          <>
            <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Copy link</span>
          </>
        )}
      </button>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Share ${title} on X (Twitter)`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300/80 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-white/20 hover:text-zinc-950 dark:hover:text-white active:scale-[0.98] transition-all duration-200"
      >
        <FaXTwitter aria-hidden="true" />
        <span className="hidden sm:inline">Post</span>
      </a>

      <a
        href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Share ${title} on Reddit`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300/80 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-white/20 hover:text-zinc-950 dark:hover:text-white active:scale-[0.98] transition-all duration-200"
      >
        <FaRedditAlien aria-hidden="true" />
        <span className="hidden sm:inline">Reddit</span>
      </a>

      <a
        href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Share ${title} on WhatsApp`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300/80 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-white/20 hover:text-zinc-950 dark:hover:text-white active:scale-[0.98] transition-all duration-200"
      >
        <FaWhatsapp aria-hidden="true" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {typeof navigator !== 'undefined' && navigator.share && (
        <button
          type="button"
          onClick={handleNativeShare}
          aria-label="Open system share dialog"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300/80 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-white/20 cursor-pointer active:scale-[0.98] transition-all duration-200"
        >
          <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Share</span>
        </button>
      )}
    </div>
  );
};

export default ShareRow;
