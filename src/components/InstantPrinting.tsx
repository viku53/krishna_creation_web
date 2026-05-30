import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Bell, Instagram, Mail, Sparkles, ArrowRight, Star, Search, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Coming Soon Flag ─────────────────────────────────────────────────────────
const IS_COMING_SOON = import.meta.env.VITE_INSTANT_PRINTING_COMING_SOON === 'true';

// ─── Product data ─────────────────────────────────────────────────────────────
export interface PrintProduct {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  price: string;
  rating: number;
  reviews: number;
  tags: string[];
  gradient: string;
  accentColor: string;
}

export const products: PrintProduct[] = [
  {
    id: 'photo-mug',
    title: 'Custom Photo Mug',
    subtitle: 'Your favorite memories on premium ceramic',
    emoji: '☕',
    price: '₹499',
    rating: 4.8,
    reviews: 124,
    tags: ['Ceramic', 'Dishwasher Safe', '330ml'],
    gradient: 'linear-gradient(135deg, #f97316, #f59e0b)',
    accentColor: '#f97316',
  },
  {
    id: 'photo-print',
    title: 'Premium Photo Prints',
    subtitle: 'Gallery-quality prints on archival paper',
    emoji: '🖨️',
    price: '₹ Based on size',
    rating: 4.9,
    reviews: 238,
    tags: ['Glossy/Matte', 'Archival', 'Multiple Sizes'],
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    accentColor: '#3b82f6',
  },
  // {
  //   id: 'photo-frame',
  //   title: 'Photo Frame',
  //   subtitle: 'Elegant frames to showcase your moments',
  //   emoji: '🖼️',
  //   price: '₹799',
  //   rating: 4.7,
  //   reviews: 86,
  //   tags: ['Wood/Acrylic', 'Wall Mount', 'A4/A3'],
  //   gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
  //   accentColor: '#8b5cf6',
  // },
  // {
  //   id: 'gift-combo',
  //   title: 'Gift Combo Pack',
  //   subtitle: 'Curated gift sets for every occasion',
  //   emoji: '🎁',
  //   price: '₹1,299',
  //   rating: 4.9,
  //   reviews: 67,
  //   tags: ['Mug + Frame + Prints', 'Gift Box', 'Personalized'],
  //   gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
  //   accentColor: '#ec4899',
  // },
  // {
  //   id: 'canvas-print',
  //   title: 'Canvas Print',
  //   subtitle: 'Museum-style canvas wrapped on wooden frames',
  //   emoji: '🎨',
  //   price: '₹1,499',
  //   rating: 4.8,
  //   reviews: 52,
  //   tags: ['Canvas', 'Stretched', '12x18 / 16x24'],
  //   gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
  //   accentColor: '#10b981',
  // },
  // {
  //   id: 'keychain',
  //   title: 'Photo Keychain',
  //   subtitle: 'Carry your memories everywhere you go',
  //   emoji: '🔑',
  //   price: '₹149',
  //   rating: 4.6,
  //   reviews: 310,
  //   tags: ['Metal/Acrylic', 'Double-Sided', 'Compact'],
  //   gradient: 'linear-gradient(135deg, #eab308, #f97316)',
  //   accentColor: '#eab308',
  // },
];

// ═══════════════════════════════════════════════════════════════
// COMING SOON COMPONENT (existing)
// ═══════════════════════════════════════════════════════════════
// const LAUNCH_DATE = new Date('2025-12-01T00:00:00');

// function getTimeLeft() {
//   const now = new Date();
//   const diff = LAUNCH_DATE.getTime() - now.getTime();
//   if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
//   return {
//     days: Math.floor(diff / (1000 * 60 * 60 * 24)),
//     hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
//     minutes: Math.floor((diff / (1000 * 60)) % 60),
//     seconds: Math.floor((diff / 1000) % 60),
//   };
// }

const ComingSoon: React.FC = () => {
  // const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // useEffect(() => {
  //   const t = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
  //   return () => clearInterval(t);
  // }, []);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="coming-soon-page">
      <Helmet>
        <title>Instant Photo Printing – Custom Mugs, Frames &amp; Gifts | Krishna Creation</title>
        <meta name="description" content="Premium instant photo printing services by Krishna Creation Mumbai – custom mugs, photo frames, canvas prints, keychains &amp; gift combos. Order online or book for your event." />
        <meta name="keywords" content="instant photo printing Mumbai, custom photo mug, photo frame online, canvas print Mumbai, photo keychain, gift combos Mumbai, personalised gifts, photo printing service, custom printing at events, Krishna Creation printing" />
        <link rel="canonical" href="https://krishnacreationphotography.com/instant-printing" />
        <meta property="og:url" content="https://krishnacreationphotography.com/instant-printing" />
        <meta property="og:title" content="Instant Printing – Custom Gifts | Krishna Creation" />
        <meta property="og:description" content="Custom mugs, photo prints, frames &amp; gift combos from Krishna Creation, Mumbai. Launching soon." />
        <meta property="og:image" content="https://krishnacreationphotography.com/logo.png" />
      </Helmet>
      {/* Animated background blobs */}
      <div className="cs-blob cs-blob--1" />
      <div className="cs-blob cs-blob--2" />
      <div className="cs-blob cs-blob--3" />

      <div className="cs-content">
        {/* Icon */}
        <div className="cs-icon-wrap">
          <ShoppingBag size={36} strokeWidth={1.5} />
          <div className="cs-sparkle cs-sparkle--1"><Sparkles size={14} /></div>
          <div className="cs-sparkle cs-sparkle--2"><Sparkles size={10} /></div>
        </div>

        {/* Badge */}
        <div className="cs-badge">Coming Soon</div>

        {/* Headline */}
        <h1 className="cs-title">
          Instant Printing<br />
          <span className="cs-title-accent">Launching Soon</span>
        </h1>
        <p className="cs-subtitle">
          Premium mugs, frames, photo prints, and custom gifting — all crafted with love.
          We're putting the finishing touches on something special for you.
        </p>

        {/* Countdown */}
        {/* <div className="cs-countdown">
          {[
            { value: timeLeft.days,    label: 'Days' },
            { value: timeLeft.hours,   label: 'Hours' },
            { value: timeLeft.minutes, label: 'Min' },
            { value: timeLeft.seconds, label: 'Sec' },
          ].map((unit, i) => (
            <React.Fragment key={unit.label}>
              <div className="cs-unit">
                <div className="cs-unit-value">{String(unit.value).padStart(2, '0')}</div>
                <div className="cs-unit-label">{unit.label}</div>
              </div>
              {i < 3 && <div className="cs-colon">:</div>}
            </React.Fragment>
          ))}
        </div> */}

        {/* Notify form */}
        {!submitted ? (
          <form onSubmit={handleNotify} className="cs-notify-form">
            <input
              type="email"
              placeholder="Enter your email for early access"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="cs-email-input"
              pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
              title="Please enter a valid email address"
              required
              aria-label="Email address for notification"
            />
            <button type="submit" className="cs-notify-btn">
              <Bell size={16} />
              Notify Me
            </button>
          </form>
        ) : (
          <div className="cs-success">
            ✅ You're on the list! We'll notify you at <strong>{email}</strong>
          </div>
        )}

        {/* What's coming */}
        <div className="cs-products-preview">
          {['🖼️ Photo Frames', '☕ Custom Mugs', '🖨️ Photo Prints', '🎁 Gift Combos'].map(item => (
            <div key={item} className="cs-product-chip">{item}</div>
          ))}
        </div>

        {/* Social links */}
        <div className="cs-socials">
          <p className="cs-social-hint">Meanwhile, follow us for sneak peeks:</p>
          <div className="cs-social-links">
            <a href="https://www.instagram.com/krishna_creation10" target="_blank" rel="noopener noreferrer" className="cs-social-link">
              <Instagram size={20} />
              Instagram
            </a>
            <a href={`mailto:${import.meta.env.VITE_EMAILJS_TO_EMAIL}`} className="cs-social-link">
              <Mail size={20} />
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PRODUCT LISTING PAGE (PLP)
// ═══════════════════════════════════════════════════════════════
const ProductListing: React.FC = () => {
  return (
    <div className="plp-page">
      <Helmet>
        <title>Instant Photo Printing – Custom Mugs, Frames &amp; Gifts | Krishna Creation</title>
        <meta name="description" content="Order premium custom photo prints, mugs, canvas prints, frames &amp; gift combos from Krishna Creation Mumbai. Turn your cherished memories into beautiful keepsakes." />
        <meta name="keywords" content="instant photo printing Mumbai, custom photo mug, photo frame online, canvas print Mumbai, photo keychain, gift combos Mumbai, personalised gifts, photo printing service, custom printing at events, Krishna Creation printing" />
        <link rel="canonical" href="https://krishnacreationphotography.com/instant-printing" />
        <meta property="og:url" content="https://krishnacreationphotography.com/instant-printing" />
        <meta property="og:title" content="Instant Printing – Custom Gifts | Krishna Creation" />
        <meta property="og:description" content="Custom mugs, photo prints, frames, canvas prints &amp; gift combos from Krishna Creation, Mumbai." />
        <meta property="og:image" content="https://krishnacreationphotography.com/logo.png" />
      </Helmet>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="plp-hero">
        <div className="plp-hero-icon">
          <ShoppingBag size={32} strokeWidth={1.5} />
        </div>
        <div className="plp-hero-badge">
          <Sparkles size={12} />
          <span>Instant Printing</span>
        </div>
        <h1 className="plp-hero-title">
          Custom Prints &<br />
          <span className="plp-hero-accent">Personalized Gifts</span>
        </h1>
        <p className="plp-hero-sub">
          Turn your cherished memories into beautiful prints, mugs, frames, and more — crafted with love and premium quality.
        </p>
        {/* Track Order CTA */}
        <Link to="/track-order" className="plp-track-order-btn" id="plp-track-order-btn">
          <Package size={16} />
          <span>Track Your Order</span>
          <Search size={14} />
        </Link>
      </section>

      {/* ── Product Grid ─────────────────────────────────── */}
      <section className="plp-grid-section">
        <div className="plp-grid">
          {products.map((product, idx) => (
            <Link
              to={`/instant-printing/${product.id}`}
              key={product.id}
              className="plp-card"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              {/* Gradient top */}
              <div
                className="plp-card-visual"
                style={{ background: product.gradient }}
              >
                <span className="plp-card-emoji">{product.emoji}</span>
                <div className="plp-card-price">{product.price}</div>
              </div>

              {/* Info */}
              <div className="plp-card-info">
                <h3 className="plp-card-title">{product.title}</h3>
                <p className="plp-card-subtitle">{product.subtitle}</p>

                {/* Rating */}
                <div className="plp-card-rating">
                  <div className="plp-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < Math.floor(product.rating) ? '#f59e0b' : 'transparent'}
                        color={i < Math.floor(product.rating) ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
                      />
                    ))}
                  </div>
                  <span className="plp-rating-text">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                {/* Tags */}
                <div className="plp-card-tags">
                  {product.tags.map(tag => (
                    <span key={tag} className="plp-tag">{tag}</span>
                  ))}
                </div>

                {/* CTA */}
                <div className="plp-card-cta" style={{ color: product.accentColor }}>
                  Customize Now <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — Switches based on env
// ═══════════════════════════════════════════════════════════════
const InstantPrinting: React.FC = () => {
  return IS_COMING_SOON ? <ComingSoon /> : <ProductListing />;
};

export default InstantPrinting;
