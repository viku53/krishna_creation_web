import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import type { HelmetServerState } from 'react-helmet-async';
import { AppContent, type RouteComponentMap } from './App';
import Home from './components/Home';
import ComingSoon from './components/ComingSoon';
import Reels from './components/Reels';
import Photos from './components/Photos';
import Videos from './components/Videos';
import InstantPrinting from './components/InstantPrinting';
import ProductDetail from './components/ProductDetail';
import Checkout from './components/Checkout';
import TrackOrder from './components/TrackOrder';
import ContactUs from './components/ContactUs';

const ssrRoutes: RouteComponentMap = {
  Home,
  ComingSoon,
  Reels,
  Photos,
  Videos,
  InstantPrinting,
  ProductDetail,
  Checkout,
  TrackOrder,
  ContactUs,
};

export interface PrerenderOutput {
  html: string;
  head: {
    title: string;
    meta: string;
    link: string;
    script: string;
  };
}

/**
 * Synchronously render an application route using eager route imports so static HTML
 * contains full visible content inside <main> with no Suspense fallback spinner.
 */
export function render(url: string): PrerenderOutput {
  const helmetContext: { helmet?: HelmetServerState } = {};

  const html = renderToString(
    <StrictMode>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <AppContent routes={ssrRoutes} />
        </StaticRouter>
      </HelmetProvider>
    </StrictMode>
  );

  const { helmet } = helmetContext;

  return {
    html,
    head: {
      title: helmet?.title.toString() ?? '',
      meta: helmet?.meta.toString() ?? '',
      link: helmet?.link.toString() ?? '',
      script: helmet?.script.toString() ?? '',
    },
  };
}
