import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, initScrollTracking } from '../gtm';

/**
 * Fires a virtual_page_view event on every React Router navigation
 * and resets scroll-depth tracking.
 *
 * Place once in the top-level Router wrapper (AppInner).
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Small delay so react-helmet-async has time to update <title>
    const id = setTimeout(() => {
      trackPageView(location.pathname + location.search, document.title);
    }, 100);

    // Reset scroll depth on every new page
    const cleanup = initScrollTracking();

    return () => {
      clearTimeout(id);
      cleanup();
    };
  }, [location.pathname, location.search]);
}
