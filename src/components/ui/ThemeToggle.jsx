import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

/**
 * Navbar control that cycles light, dark, and system themes with icons and accessible label (F6).
 */
const ThemeToggle = () => {
  const { themePreference, cycleTheme } = useTheme();

  const meta = {
    dark: {
      icon: Moon,
      label: 'Theme: Dark (click for Light)',
      short: 'Dark',
    },
    light: {
      icon: Sun,
      label: 'Theme: Light (click for System)',
      short: 'Light',
    },
    system: {
      icon: Monitor,
      label: 'Theme: System (click for Dark)',
      short: 'System',
    },
  }[themePreference] || {
    icon: Moon,
    label: 'Toggle color theme',
    short: 'Dark',
  };

  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={meta.label}
      title={meta.label}
      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-white/20 hover:text-zinc-950 dark:hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#d93829] cursor-pointer transition-all duration-200"
    >
      <Icon className="w-3.5 h-3.5 text-[#d93829]" aria-hidden="true" />
      <span className="hidden sm:inline">{meta.short}</span>
    </button>
  );
};

export default ThemeToggle;
