import { useState, useEffect } from 'react';
import { FilmStrip } from '@phosphor-icons/react';
import { cleanField } from '../../api/normalize.js';

/**
 * Renders 2:3 film poster artwork with lazy decoding, referrerPolicy="no-referrer",
 * skeleton shimmer state, and a bespoke 35mm archival plate fallback when Poster is "N/A" or fails to load.
 */
const PosterArtwork = ({
  src,
  title = 'Archival Film Print',
  year = '',
  className = '',
  eager = false,
}) => {
  const validSrc = cleanField(src);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [validSrc]);

  if (!validSrc || failed) {
    return (
      <div
        role="img"
        aria-label={`${title} (No poster available)`}
        className={`relative flex flex-col items-center justify-between bg-[#1b1b21] text-[#f2efe9] p-5 text-center select-none overflow-hidden ${className}`}
      >
        <div className="w-full flex items-center justify-start pr-10 text-xs italic text-[#b5b0a8]">
          <span>35mm Archive Print</span>
        </div>

        <div className="my-auto flex flex-col items-center px-2">
          <div className="bg-[#c83a2b] p-3 text-white mb-3">
            <FilmStrip size={24} weight="duotone" aria-hidden="true" />
          </div>
          <p className="font-display font-semibold text-base text-[#f2efe9] line-clamp-3 leading-snug">
            {title}
          </p>
          {year && (
            <span className="mt-1.5 tabular-nums text-xs text-[#b5b0a8]">
              {year}
            </span>
          )}
        </div>

        <div className="w-full pt-2 text-xs tabular-nums text-[#8a847c] flex items-center justify-between">
          <span>Unillustrated</span>
          <span>2:3</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#1b1b21] ${className}`}>
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-[#e2dcd0] dark:bg-[#1d1d23]"
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
