import { useNavigate, useRouteError } from 'react-router-dom';
import ErrorState from '../components/ui/ErrorState.jsx';
import { useDocumentMeta } from '../lib/seo.js';
import './not-found.scss';

/**
 * Handles both React Router loader errors (e.g. ApiError from /movies/:movieID, CS-01)
 * and 404 / catch-all routes without crashing when error is null.
 */
const NotFound = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const isApiError = Boolean(error?.kind);
  const status = error?.status || (isApiError ? error.status : 404);

  useDocumentMeta({
    title: status === 404 ? '404 — Page Not Found' : 'Error Loading Page',
  });

  // If a child route loader threw a typed ApiError (e.g. invalid movie ID, quota, or network drop on /movies/:movieID),
  // AppLayout already provides Navbar and Footer, so render ErrorState directly (CS-01).
  if (isApiError) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <ErrorState
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="not-found-page" data-testid="not-found-terminal">
      <div className="noise" />
      <div className="overlay" />
      <div className="terminal">
        <h1>
          Error <span className="errorcode">{status || 404}</span>
        </h1>
        <p className="output">
          The page you are looking for might have been removed, had its name
          changed or is temporarily unavailable.
        </p>
        <p className="output">
          Please try to{' '}
          <button type="button" onClick={() => navigate(-1)}>
            go back
          </button>{' '}
          or{' '}
          <button type="button" onClick={() => navigate('/')}>
            return to the homepage
          </button>
          .
        </p>
        <p className="output">Good luck.</p>
      </div>
    </div>
  );
};

export default NotFound;