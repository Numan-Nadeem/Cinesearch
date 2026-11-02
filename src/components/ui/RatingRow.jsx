import { Star, Scales, Medal, CurrencyDollar } from '@phosphor-icons/react';

/**
 * Parses a rating string ("9.0/10", "94%", "84/100") into a 0-100 percentage for the visual ledger bar.
 */
const parsePercentage = (value) => {
  if (!value) return null;
  const str = String(value).trim();
  if (str.endsWith('%')) {
    const pct = parseFloat(str);
    return Number.isNaN(pct) ? null : Math.min(100, Math.max(0, pct));
  }
  if (str.includes('/100')) {
    const num = parseFloat(str.split('/')[0]);
    return Number.isNaN(num) ? null : Math.min(100, Math.max(0, num));
  }
  if (str.includes('/10')) {
    const num = parseFloat(str.split('/')[0]);
    return Number.isNaN(num) ? null : Math.min(100, Math.max(0, num * 10));
  }
  const raw = parseFloat(str);
  if (!Number.isNaN(raw)) {
    return raw <= 10 ? raw * 10 : Math.min(100, raw);
  }
  return null;
};

/**
 * Renders the multi-source Ratings comparison ledger (IMDb, Rotten Tomatoes, Metacritic)
 * side by side using tone-stepped panels and tabular numerals.
 */
const RatingRow = ({ ratings = [], boxOffice = null }) => {
  if ((!ratings || ratings.length === 0) && !boxOffice) {
    return null;
  }

  const getIcon = (source) => {
    if (source === 'IMDb') {
      return (
        <Star
          size={16}
          weight="fill"
          className="text-[#b87d24] dark:text-[#deb052] shrink-0"
          aria-hidden="true"
        />
      );
    }
    if (source === 'Rotten Tomatoes') {
      return (
        <Scales
          size={16}
          weight="duotone"
          className="text-[#c83a2b] dark:text-[#d94636] shrink-0"
          aria-hidden="true"
        />
      );
    }
    return (
      <Medal
        size={16}
        weight="duotone"
        className="text-[#494540] dark:text-[#b5b0a8] shrink-0"
        aria-hidden="true"
      />
    );
  };

  return (
    <div
      data-ui="ratings-ledger"
      aria-label="Ratings comparison"
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2"
    >
      {ratings.map(({ source, value }) => {
        const pct = parsePercentage(value);
        return (
          <div
            key={source}
            className="flex flex-col justify-between gap-2.5 bg-[#ebe6dc] dark:bg-[#151519] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#494540] dark:text-[#b5b0a8]">
                {getIcon(source)}
                <span>{source}</span>
              </span>
              <span className="tabular-nums text-base font-bold text-[#161514] dark:text-white">
                {value}
              </span>
            </div>
            {pct !== null && (
              <div
                aria-hidden="true"
                className="h-1.5 w-full bg-[#dad3c5] dark:bg-[#24242c] overflow-hidden"
              >
                <div
                  className={`h-full ${
                    source === 'IMDb'
                      ? 'bg-[#b87d24] dark:bg-[#deb052]'
                      : source === 'Rotten Tomatoes'
                        ? 'bg-[#c83a2b] dark:bg-[#d94636]'
                        : 'bg-[#161514] dark:bg-[#f2efe9]'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        );
      })}

      {(!ratings || ratings.length === 0) && boxOffice && (
        <div className="flex items-center gap-2.5 bg-[#ebe6dc] dark:bg-[#151519] p-4">
          <CurrencyDollar
            size={16}
            weight="duotone"
            className="text-[#b87d24] dark:text-[#deb052] shrink-0"
            aria-hidden="true"
          />
          <div>
            <span className="block text-xs font-medium text-[#494540] dark:text-[#b5b0a8]">
              Box Office Gross
            </span>
            <span className="tabular-nums text-base font-bold text-[#161514] dark:text-white">
              {boxOffice}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingRow;
