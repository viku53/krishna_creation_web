import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ComingSoon from "./components/ComingSoon";
import Home from "./components/Home";
import Reels from "./components/Reels";
import Photos from "./components/Photos";
import Videos from "./components/Videos";
import InstantPrinting from "./components/InstantPrinting";
import ContactUs from "./components/ContactUs";
import ProductDetail from "./components/ProductDetail";
import Checkout from "./components/Checkout";
import TrackOrder from "./components/TrackOrder";
import BottomNav from "./components/BottomNav";
import { HelmetProvider } from "react-helmet-async";
import "./App.css";

function AppInner() {

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
