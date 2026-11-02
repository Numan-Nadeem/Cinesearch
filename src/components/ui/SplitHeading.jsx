import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Accessible word-staggered heading component (build-awwwards-quality-sites Section 4).
 * - Preserves an unsplit accessible name via aria-label and an sr-only text node.
 * - Hides decorative split word spans from assistive technology (aria-hidden="true").
 * - Renders words visible by default if JS is disabled or prefers-reduced-motion is active.
 */
const SplitHeading = ({
  as: Tag = 'h2',
  text,
  id,
  className = '',
  stagger = 0.035,
  delay = 0,
   immediate = false,
}) => {
  const headingRef = useRef(null);
  const words = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  useGSAP(
    () => {
      if (!headingRef.current) return;
      const wordNodes = headingRef.current.querySelectorAll('.split-word-inner');
      if (!wordNodes.length) return;

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        gsap.set(wordNodes, { yPercent: 0, opacity: 1 });
        return;
      }

      if (immediate) {
        gsap.fromTo(
          wordNodes,
          { yPercent: 85, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.75,
            stagger,
            delay,
            ease: 'power3.out',
          }
        );
      } else {
        gsap.fromTo(
          wordNodes,
          { yPercent: 80, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.7,
            stagger,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headingRef.current,
              start: 'top 86%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    },
    { scope: headingRef, dependencies: [text, immediate] }
  );

  return (
    <Tag ref={headingRef} id={id} aria-label={text} className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, idx) => (
        <span
          key={`${word}-${idx}`}
          aria-hidden="true"
          className="inline-block overflow-hidden align-bottom mr-[0.26em] last:mr-0 pb-[0.06em]"
        >
          <span className="split-word-inner inline-block will-change-transform">
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
};

export default SplitHeading;
