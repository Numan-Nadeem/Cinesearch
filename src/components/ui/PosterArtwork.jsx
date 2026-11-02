import { useState } from 'react';
import { Film } from 'lucide-react';
import { cleanField } from '../../api/normalize.js';

/**
 * Renders movie poster artwork with lazy decoding, referrerPolicy="no-referrer",
 * shimmer state, and an editorial fallback placeholder when Poster is "N/A" or fails to load (CS-03, CS-15).
 */
const PosterArtwork = ({
  src,
  title = 'Movie Poster',
  year = '',
  className = '',
  eager = false,
}) => {
  const validSrc = cleanField(src);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!validSrc || failed) {
    return (
      <div
        role="img"
        aria-label={`${title} (No poster available)`}
        className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#1a1a20] via-[#131317] to-[#0c0c0e] text-zinc-300 p-5 text-center select-none border border-white/5 ${className}`}
      >
        <div className="rounded-xl bg-[#d93829]/10 p-3 text-[#e84a3b] mb-3 border border-[#d93829]/20">
          <Film className="w-6 h-6" aria-hidden="true" />
        </div>
        <p className="font-display font-semibold text-sm text-zinc-100 line-clamp-2 px-2">
          {title}
        </p>
        {year && (
          <span className="mt-1 font-mono tabular-nums text-xs text-zinc-400">
            {year}
          </span>
        )}
        <span className="mt-2.5 text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500">
          No Artwork
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-zinc-900 ${className}`}>
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-zinc-300/60 dark:bg-zinc-800/80"
        />
      )}
      <img
        src={validSrc}
        alt={title}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export default PosterArtwork;
