import { useState, useRef, useEffect } from 'react';
import {
  SlidersHorizontal,
  CaretDown,
  Check,
  Desktop,
  Swatches,
  Aperture,
  Database,
} from '@phosphor-icons/react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useActiveProvider } from '../../hooks/useMovieSearch.js';
import { setActiveProviderId } from '../../api/provider.js';

const THEME_OPTIONS = [
  {
    value: 'dark',
    label: 'Projection Dark',
    description: '35mm booth charcoal (#0c0c0e)',
    icon: Aperture,
  },
  {
    value: 'light',
    label: 'Archival Paper',
    description: 'Warm ivory monograph (#f5f2eb)',
    icon: Swatches,
  },
  {
    value: 'system',
    label: 'System Auto',
    description: 'Follow OS preference',
    icon: Desktop,
  },
];

const PROVIDERS = [
  { id: 'omdb', label: 'OMDb Archive', desc: 'IMDb · Tomatometer · Metascore' },
  { id: 'tmdb', label: 'TMDB Catalogue', desc: 'Expanded global filmography' },
];

const ThemeToggle = () => {
  const { themePreference, setThemePreference } = useTheme();
  const providerId = useActiveProvider();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const activeOption =
    THEME_OPTIONS.find((opt) => opt.value === themePreference) || THEME_OPTIONS[0];

  useEffect(() => {
    if (!open) return undefined;
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Appearance & Index Settings (${activeOption.label}, ${providerId.toUpperCase()})`}
        className="inline-flex items-center gap-2 bg-[#ebe6dc] dark:bg-[#1d1d23] hover:bg-[#dad3c5] dark:hover:bg-[#26262e] px-3.5 py-2 text-xs font-semibold text-[#161514] dark:text-[#f2efe9] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] cursor-pointer transition-colors duration-150 whitespace-nowrap shrink-0"
      >
        <SlidersHorizontal
          size={14}
          weight="duotone"
          className="text-[#c83a2b] dark:text-[#d94636]"
          aria-hidden="true"
        />
        <span>{activeOption.label}</span>
        <span className="tabular-nums text-xs text-[#494540] dark:text-[#b5b0a8]">
          · {providerId.toUpperCase()}
        </span>
        <CaretDown
          size={11}
          weight="bold"
          className={`text-[#494540] dark:text-[#b5b0a8] transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Appearance and catalogue engine settings"
          className="absolute right-0 bottom-full mb-2 w-64 bg-[#f5f2eb] dark:bg-[#151519] p-2 shadow-2xl z-50"
        >
          <div className="px-2.5 py-1.5 text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] mb-1">
            Reading environment
          </div>
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = opt.value === themePreference;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setThemePreference(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 text-left text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] ${
                  selected
                    ? 'bg-[#e2dcd0] dark:bg-[#1d1d23] text-[#161514] dark:text-white font-semibold'
                    : 'text-[#494540] dark:text-[#b5b0a8] hover:bg-[#ebe6dc] dark:hover:bg-[#1d1d23]'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    size={15}
                    weight="duotone"
                    className={
                      selected
                        ? 'text-[#c83a2b] dark:text-[#d94636] shrink-0'
                        : 'text-[#6b655e] shrink-0'
                    }
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    <span className="block leading-tight">{opt.label}</span>
                    <span className="block text-[11px] text-[#6b655e] dark:text-[#8a847c] font-normal truncate">
                      {opt.description}
                    </span>
                  </span>
                </span>
                {selected && (
                  <Check
                    size={13}
                    weight="bold"
                    className="text-[#c83a2b] dark:text-[#d94636] shrink-0"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}

          <div className="px-2.5 pt-2.5 pb-1.5 mt-1 text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] mb-1">
            Catalogue adapter
          </div>
          {PROVIDERS.map((prov) => {
            const active = providerId === prov.id;
            return (
              <button
                key={prov.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setActiveProviderId(prov.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 text-left text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] ${
                  active
                    ? 'bg-[#e2dcd0] dark:bg-[#1d1d23] text-[#161514] dark:text-white font-semibold'
                    : 'text-[#494540] dark:text-[#b5b0a8] hover:bg-[#ebe6dc] dark:hover:bg-[#1d1d23]'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Database
                    size={15}
                    weight="duotone"
                    className={
                      active
                        ? 'text-[#c83a2b] dark:text-[#d94636] shrink-0'
                        : 'text-[#6b655e] shrink-0'
                    }
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    <span className="block leading-tight">{prov.label}</span>
                    <span className="block text-[11px] text-[#6b655e] dark:text-[#8a847c] font-normal truncate">
                      {prov.desc}
                    </span>
                  </span>
                </span>
                {active && (
                  <Check
                    size={13}
                    weight="bold"
                    className="text-[#c83a2b] dark:text-[#d94636] shrink-0"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
