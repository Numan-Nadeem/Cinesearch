import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import {
  searchFallbackMovies,
  getFallbackMovieDetails,
  getFallbackTrending,
} from './src/api/mockMovies.js';

function catalogueProxyPlugin() {
  return {
    name: 'catalogue-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();
        const [path, queryString] = req.url.split('?');

        if (
          path === '/.netlify/functions/omdb-proxy' ||
          path === '/api/omdb-proxy' ||
          path === '/.netlify/functions/tmdb-proxy' ||
          path === '/api/tmdb-proxy'
        ) {
          const params = new URLSearchParams(queryString || '');
          const action = params.get('action') || '';
          const genre = params.get('genre') || '';
          const movieID = params.get('movieID');
          const searchTerm = params.get('searchTerm');
          const year = params.get('year') || '';
          const type = params.get('type') || '';
          const page = params.get('page') || '1';

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          // Quota simulation support for testing (F4, CS-04)
          if (searchTerm === '__quota__' || movieID === 'tt_quota') {
            res.statusCode = 429;
            res.end(
              JSON.stringify({
                Response: 'False',
                Error: 'Request limit reached!',
              })
            );
            return;
          }

          if (action === 'trending') {
            const results = getFallbackTrending(genre);
            res.statusCode = 200;
            res.end(JSON.stringify({ results }));
            return;
          }

          // Server-only key OMDB_API_KEY (CS-09)
          const apiKey =
            process.env.OMDB_API_KEY ||
            process.env.MOVIE_API_KEY ||
            process.env.VITE_MOVIE_API_KEY;

          if (apiKey && path.includes('omdb')) {
            let omdbUrl;
            if (movieID) {
              omdbUrl = `https://www.omdbapi.com/?i=${encodeURIComponent(
                movieID
              )}&plot=full&apikey=${encodeURIComponent(apiKey)}`;
            } else {
              omdbUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(
                searchTerm || ''
              )}&page=${encodeURIComponent(page)}&apikey=${encodeURIComponent(
                apiKey
              )}`;
              if (year) omdbUrl += `&y=${encodeURIComponent(year)}`;
              if (type && type !== 'All') {
                omdbUrl += `&type=${encodeURIComponent(type)}`;
              }
            }

            try {
              const upstreamResp = await fetch(omdbUrl, {
                headers: { Accept: 'application/json' },
              });
              const data = await upstreamResp.json().catch(() => null);

              if (
                upstreamResp.status === 429 ||
                String(data?.Error || '')
                  .toLowerCase()
                  .includes('limit reached')
              ) {
                res.statusCode = 429;
                res.end(
                  JSON.stringify({
                    Response: 'False',
                    Error: data?.Error || 'Request limit reached!',
                  })
                );
                return;
              }

              if (upstreamResp.ok && data) {
                if (movieID && data.Response === 'False') {
                  res.statusCode = 404;
                  res.end(JSON.stringify(data));
                  return;
                }
                res.statusCode = 200;
                res.end(JSON.stringify(data));
                return;
              }
            } catch (err) {
              console.warn('OMDb upstream request failed, using fallback:', err.message);
            }
          }

          if (movieID) {
            const data = getFallbackMovieDetails(movieID);
            res.statusCode = data.Response === 'False' ? 404 : 200;
            res.end(JSON.stringify(data));
          } else {
            const data = searchFallbackMovies(
              searchTerm || '',
              year,
              type,
              parseInt(page, 10) || 1
            );
            res.statusCode = 200;
            res.end(JSON.stringify(data));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    catalogueProxyPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
      manifest: {
        id: '/',
        name: 'CineSearch — Movie & Series Discovery',
        short_name: 'CineSearch',
        description:
          'Discover, explore, and enjoy movies and TV shows with search, filters, ratings, and a personal watchlist.',
        theme_color: '#18181b',
        background_color: '#18181b',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            // Bounded poster image caching (<= 200 entries, F7)
            urlPattern: /^https:\/\/(m\.media-amazon\.com|images\.unsplash\.com|image\.tmdb\.org)\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cinesearch-posters-v2',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
        type: 'module',
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
});
