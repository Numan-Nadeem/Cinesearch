import { Star, Flame, Award } from 'lucide-react';

/**
 * Renders the multi-source Ratings comparison ledger (IMDb, Rotten Tomatoes, Metacritic)
 * side by side with tabular numerals and hairline dividers, omitting missing sources (F3).
 */
const RatingRow = ({ ratings = [], boxOffice = null }) => {
  if ((!ratings || ratings.length === 0) && !boxOffice) {
    return null;
  }

  const getIcon = (source) => {
    if (source === 'IMDb') {
      return <Star className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-amber-400/20" aria-hidden="true" />;
    }
    if (source === 'Rotten Tomatoes') {
      return <Flame className="w-4 h-4 text-[#d93829] fill-[#d93829]/20" aria-hidden="true" />;
    }
    return <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />;
  };

  return (
    <div
      aria-label="Ratings comparison"
      className="flex flex-wrap items-center gap-y-3 border-y border-zinc-200/90 dark:border-white/10 py-3.5"
    >
      {ratings.map(({ source, value }, index) => (
        <div
          key={source}
          className={`flex items-center gap-2.5 pr-6 ${
            index !== 0 ? 'pl-6 border-l border-zinc-200/90 dark:border-white/10' : ''
          }`}
        >
          {getIcon(source)}
          <div>
            <span className="block text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500 dark:text-zinc-400">
              {source}
            </span>
            <span className="font-mono tabular-nums text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
              {value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RatingRow;
