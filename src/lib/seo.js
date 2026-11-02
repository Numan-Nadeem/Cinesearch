import { useEffect } from 'react';

const DEFAULT_TITLE = 'CineSearch — Discover Movies, Series & Ratings';
const DEFAULT_DESCRIPTION =
  'Discover, explore, and enjoy movies and TV shows with search, filters, ratings, and detailed views.';
const DEFAULT_IMAGE = '/pwa-512x512.png';

function setMetaTag(attrName, attrValue, content) {
  if (typeof document === 'undefined' || !content) return;
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Imperatively sets per-page document.title, description, OpenGraph, and Twitter card tags
 * and restores defaults on unmount (F3, CS-18).
 */
export function useDocumentMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = 'website',
} = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | CineSearch` : DEFAULT_TITLE;
    document.title = fullTitle;

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:image', image || DEFAULT_IMAGE);
    if (typeof window !== 'undefined') {
      setMetaTag(
        'property',
        'og:url',
        window.location.origin + window.location.pathname + window.location.search
      );
    }

    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image || DEFAULT_IMAGE);

    return () => {
      document.title = DEFAULT_TITLE;
      setMetaTag('name', 'description', DEFAULT_DESCRIPTION);
      setMetaTag('property', 'og:title', 'CineSearch');
      setMetaTag('property', 'og:description', DEFAULT_DESCRIPTION);
      setMetaTag('property', 'og:type', 'website');
      setMetaTag('property', 'og:image', DEFAULT_IMAGE);
      setMetaTag('name', 'twitter:title', 'CineSearch');
      setMetaTag('name', 'twitter:description', DEFAULT_DESCRIPTION);
    };
  }, [title, description, image, type]);
}
