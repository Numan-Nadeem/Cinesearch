import { useState } from 'react';
import { LinkSimple, Check, ShareNetwork, XLogo, RedditLogo, WhatsappLogo } from '@phosphor-icons/react';

/**
 * Copy-link and social share actions row for movie details.
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
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0" aria-label="Share this title">
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label={copied ? 'Link copied to clipboard' : 'Copy page link'}
        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold transition-all duration-150 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] whitespace-nowrap shrink-0 ${
          copied
            ? 'bg-[#c83a2b] text-white'
            : 'bg-[#ebe6dc] dark:bg-[#151519] text-[#161514] dark:text-[#f2efe9] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23]'
        }`}
      >
        {copied ? (
          <>
            <Check size={14} weight="bold" aria-hidden="true" />
            <span>Link copied</span>
          </>
        ) : (
          <>
            <LinkSimple size={14} weight="regular" aria-hidden="true" />
            <span>Copy link</span>
          </>
        )}
      </button>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Share ${title} on X (Twitter)`}
        className="inline-flex items-center gap-1.5 bg-[#ebe6dc] dark:bg-[#151519] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23] px-3 py-2 text-xs font-semibold text-[#161514] dark:text-[#f2efe9] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0"
      >
        <XLogo size={14} aria-hidden="true" />
        <span className="hidden sm:inline">Post</span>
      </a>

      <a
        href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Share ${title} on Reddit`}
        className="inline-flex items-center gap-1.5 bg-[#ebe6dc] dark:bg-[#151519] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23] px-3 py-2 text-xs font-semibold text-[#161514] dark:text-[#f2efe9] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0"
      >
        <RedditLogo size={14} aria-hidden="true" />
        <span className="hidden sm:inline">Reddit</span>
      </a>

      <a
        href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Share ${title} on WhatsApp`}
        className="inline-flex items-center gap-1.5 bg-[#ebe6dc] dark:bg-[#151519] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23] px-3 py-2 text-xs font-semibold text-[#161514] dark:text-[#f2efe9] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0"
      >
        <WhatsappLogo size={14} aria-hidden="true" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {typeof navigator !== 'undefined' && navigator.share && (
        <button
          type="button"
          onClick={handleNativeShare}
          aria-label="Open system share dialog"
          className="inline-flex items-center gap-1.5 bg-[#ebe6dc] dark:bg-[#151519] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23] px-3 py-2 text-xs font-semibold text-[#161514] dark:text-[#f2efe9] cursor-pointer active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0"
        >
          <ShareNetwork size={14} aria-hidden="true" />
          <span>Share</span>
        </button>
      )}
    </div>
  );
};

export default ShareRow;
