import { lazy, Suspense } from "react";
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

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center" aria-label="Loading page">
    <div className="w-8 h-8 border-3 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
  </div>
);

function AppInner() {
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
    <div className="min-h-screen bg-cream flex flex-col pb-16">
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={showComingSoon ? <ComingSoon /> : <Home />} />
            <Route path="/reels" element={<Reels />} />
            <Route path="/photos" element={<Photos />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/instant-printing" element={<InstantPrinting />} />
            <Route path="/instant-printing/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/contact" element={<ContactUs />} />
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
        <AppInner />
      </Router>
    </HelmetProvider>
  );
}

export default App;
