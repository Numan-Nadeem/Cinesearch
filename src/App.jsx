import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import NotFound from './pages/NotFound.jsx';
import { ResultGridSkeleton } from './components/ui/Skeleton.jsx';
import { getMoviesDetails } from './api/getMovieDetails.js';

// Route-level code splitting with React.lazy
const Home = lazy(() => import('./pages/Home.jsx'));
const Movie = lazy(() => import('./pages/Movie.jsx'));
const MovieDetails = lazy(() => import('./pages/MovieDetails.jsx'));
const Watchlist = lazy(() => import('./pages/Watchlist.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));

const RouteSuspenseFallback = () => (
  <div
    role="status"
    aria-label="Loading view"
    className="w-full py-12"
  >
    <ResultGridSkeleton count={4} />
  </div>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AppLayout />} errorElement={<NotFound />}>
      <Route
        index
        element={
          <Suspense fallback={<RouteSuspenseFallback />}>
            <Home />
          </Suspense>
        }
      />
      <Route
        path="movies"
        element={
          <Suspense fallback={<RouteSuspenseFallback />}>
            <Movie />
          </Suspense>
        }
      />
      <Route
        path="movies/:movieID"
        element={
          <Suspense fallback={<RouteSuspenseFallback />}>
            <MovieDetails />
          </Suspense>
        }
        loader={getMoviesDetails}
        hydrateFallbackElement={<RouteSuspenseFallback />}
        errorElement={<NotFound />}
      />
      <Route
        path="watchlist"
        element={
          <Suspense fallback={<RouteSuspenseFallback />}>
            <Watchlist />
          </Suspense>
        }
      />
      <Route
        path="contact"
        element={
          <Suspense fallback={<RouteSuspenseFallback />}>
            <Contact />
          </Suspense>
        }
      />
      <Route
        path="about"
        element={
          <Suspense fallback={<RouteSuspenseFallback />}>
            <About />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;