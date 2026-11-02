/**
 * Reusable editorial section kicker (`01 · FILM & TELEVISION CRITICAL INDEX`)
 * extracted via `impeccable extract`.
 */
const SectionKicker = ({ index, children, className = '' }) => {
  return (
    <p
      className={`font-mono text-xs uppercase tracking-[0.18em] text-[#d93829] dark:text-[#e84a3b] ${className}`}
    >
      {index ? `${index} · ` : ''}
      {children}
    </p>
  );
};

export default SectionKicker;
