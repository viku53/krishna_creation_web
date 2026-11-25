import { lazy, Suspense, type ComponentType } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import BottomNav from "./components/BottomNav";
import { HelmetProvider } from "react-helmet-async";
import { usePageTracking } from "./hooks/usePageTracking";
import "./App.css";

// ── Code-split secondary routes to eliminate critical request chaining ───────
const ComingSoon = lazy(() => import("./components/ComingSoon"));
const Reels = lazy(() => import("./components/Reels"));
const Photos = lazy(() => import("./components/Photos"));
const Videos = lazy(() => import("./components/Videos"));
const InstantPrinting = lazy(() => import("./components/InstantPrinting"));
const ProductDetail = lazy(() => import("./components/ProductDetail"));
const Checkout = lazy(() => import("./components/Checkout"));
const TrackOrder = lazy(() => import("./components/TrackOrder"));
const ContactUs = lazy(() => import("./components/ContactUs"));

export interface RouteComponentMap {
  Home: ComponentType;
  ComingSoon: ComponentType;
  Reels: ComponentType;
  Photos: ComponentType;
  Videos: ComponentType;
  InstantPrinting: ComponentType;
  ProductDetail: ComponentType;
  Checkout: ComponentType;
  TrackOrder: ComponentType;
  ContactUs: ComponentType;
}

const defaultRoutes: RouteComponentMap = {
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

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center" aria-label="Loading page">
    <div className="w-8 h-8 border-3 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
  </div>
);

export function AppContent({ routes = defaultRoutes }: { routes?: RouteComponentMap }) {
  // ── GTM: track every SPA page navigation + scroll depth ──
  usePageTracking();

  const showComingSoon = import.meta.env.VITE_SHOW_COMING_SOON === 'true';

  const scrollToTop = () => {
    document.documentElement.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-cream flex flex-col pb-16">
      <main className="flex-1 min-w-0 w-full">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={showComingSoon ? <routes.ComingSoon /> : <routes.Home />} />
            <Route path="/reels" element={<routes.Reels />} />
            <Route path="/photos" element={<routes.Photos />} />
            <Route path="/videos" element={<routes.Videos />} />
            <Route path="/instant-printing" element={<routes.InstantPrinting />} />
            <Route path="/instant-printing/:id" element={<routes.ProductDetail />} />
            <Route path="/checkout" element={<routes.Checkout />} />
            <Route path="/track-order" element={<routes.TrackOrder />} />
            <Route path="/contact" element={<routes.ContactUs />} />
          </Routes>
        </Suspense>
      </main>
      {!showComingSoon &&
        <BottomNav scrollToTop={scrollToTop} />}
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

export default App;
