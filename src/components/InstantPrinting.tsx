import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingBag,
  Bell,
  Instagram,
  Mail,
  Sparkles,
  ArrowRight,
  Star,
  Search,
  Package,
  Camera,
  Heart,
  Clock,
  Gift,
  CheckCircle,
  Zap,
  Printer,
  Truck,
  X,
  MessageCircle,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { products, giftCombos, buildWhatsAppOrderUrl } from '../data/products';
import {
  trackProductClick,
  trackEnquiryCTA,
  trackNotifySubmit,
  trackSocialClick,
  trackHeroCTA,
  trackContactInfoClick,
  trackWhatsAppOrderClick,
} from '../gtm';

// ─── Coming Soon Flag ─────────────────────────────────────────────────────────
const IS_COMING_SOON = import.meta.env.VITE_INSTANT_PRINTING_COMING_SOON === 'true';

const ComingSoon: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      trackNotifySubmit('instant_printing_coming_soon');
      setSubmitted(true);
    }
  };

  return (
    <div className="coming-soon-page">
      <Helmet>
        <title>Instant Photo &amp; Custom Mug Printing in Mumbai | Same-Day Delivery</title>
        <meta
          name="description"
          content="Order custom photo mugs, magic mugs, frames & keychains online in Mumbai with same-day delivery, or book our live instant printing booth for weddings & events."
        />
        <link rel="canonical" href="https://krishnacreationphotography.com/instant-printing" />
      </Helmet>
      <div className="cs-blob cs-blob--1" />
      <div className="cs-blob cs-blob--2" />
      <div className="cs-blob cs-blob--3" />

      <div className="cs-content">
        <div className="cs-icon-wrap">
          <ShoppingBag size={36} strokeWidth={1.5} />
          <div className="cs-sparkle cs-sparkle--1"><Sparkles size={14} /></div>
          <div className="cs-sparkle cs-sparkle--2"><Sparkles size={10} /></div>
        </div>

        <div className="cs-badge">Coming Soon</div>

        <h1 className="cs-title">
          Custom Photo &amp; Mug Printing in{' '}
          <span className="cs-title-accent">Mumbai</span> — Online Orders &amp; Live Event Booths
        </h1>
        <p className="cs-subtitle">
          Premium mugs, frames, photo prints, and custom gifting — all crafted with love.
          We're putting the finishing touches on something special for you.
        </p>

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

        <div className="cs-products-preview">
          {['🖼️ Photo Frames', '☕ Custom Mugs', '🖨️ Photo Prints', '🎁 Gift Combos'].map(item => (
            <div key={item} className="cs-product-chip">{item}</div>
          ))}
        </div>

        <div className="cs-socials">
          <p className="cs-social-hint">Meanwhile, follow us for sneak peeks:</p>
          <div className="cs-social-links">
            <a
              href="https://www.instagram.com/krishna_creation10"
              target="_blank"
              rel="noopener noreferrer"
              className="cs-social-link"
              onClick={() => trackSocialClick('Instagram', 'instant_printing_coming_soon')}
            >
              <Instagram size={20} />
              Instagram
            </a>
            <a
              href={`mailto:${import.meta.env.VITE_EMAILJS_TO_EMAIL}`}
              className="cs-social-link"
              onClick={() => trackSocialClick('Email', 'instant_printing_coming_soon')}
            >
              <Mail size={20} />
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Helper: build Schema.org Product JSON-LD objects ─────────────────────────
// TODO: Ensure schemaImage URLs and placeholder prices in src/data/products.ts are finalized before launch
const productSchemas = [
  ...products.map(product => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.schemaImage,
    brand: {
      '@type': 'Brand',
      name: 'Krishna Creation Photography',
    },
    offers: {
      '@type': 'Offer',
      url: `https://krishnacreationphotography.com/instant-printing/${product.id}`,
      priceCurrency: 'INR',
      price: product.numericPrice,
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews,
    },
  })),
  ...giftCombos.map(combo => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: combo.title,
    description: combo.contents,
    image: combo.schemaImage,
    brand: {
      '@type': 'Brand',
      name: 'Krishna Creation Photography',
    },
    offers: {
      '@type': 'Offer',
      url: `https://krishnacreationphotography.com/instant-printing/gift-combos?combo=${combo.id}`,
      priceCurrency: 'INR',
      price: combo.price,
      availability: 'https://schema.org/InStock',
    },
  })),
];

// ═══════════════════════════════════════════════════════════════
// PRODUCT LISTING STOREFRONT
// ═══════════════════════════════════════════════════════════════
const ProductListing: React.FC = () => {
  const location = useLocation();
  const [isBoothModalOpen, setIsBoothModalOpen] = useState(() => {
    const params = new URLSearchParams(location.search);
    return location.hash === '#live-event-booth' || params.get('booth') === '1';
  });
  const onlineSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isBoothModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsBoothModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isBoothModalOpen]);

  const scrollToOnlineOrders = () => {
    onlineSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openBoothModal = () => {
    setIsBoothModalOpen(true);
    trackHeroCTA('Live Event Printing Booth');
  };

  return (
    <div className="plp-page">
      <Helmet>
        <title>Instant Photo &amp; Custom Mug Printing in Mumbai | Same-Day Delivery</title>
        <meta
          name="description"
          content="Order custom photo mugs, magic mugs, frames & keychains online in Mumbai with same-day delivery, or book our live instant printing booth for weddings & events."
        />
        <meta
          name="keywords"
          content="instant photo printing Mumbai, custom photo mug, magic mug Mumbai, photo frame online, custom keychains Mumbai, photo print packs, gift combos Mumbai, live instant printing booth wedding events, same-day delivery Mumbai, Krishna Creation printing"
        />
        <link rel="canonical" href="https://krishnacreationphotography.com/instant-printing" />
        <meta property="og:url" content="https://krishnacreationphotography.com/instant-printing" />
        <meta property="og:title" content="Instant Photo & Custom Mug Printing in Mumbai | Same-Day Delivery" />
        <meta
          property="og:description"
          content="Order custom photo mugs, magic mugs, frames & keychains online in Mumbai with same-day delivery, or book our live instant printing booth for weddings & events."
        />
        <meta property="og:image" content="https://krishnacreationphotography.com/products/custom-photo-mugs.webp" />
        {productSchemas.map((schema, idx) => (
          <script key={idx} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="plp-hero">
        <div className="plp-hero-icon">
          <ShoppingBag size={32} strokeWidth={1.5} />
        </div>
        <div className="plp-hero-badge">
          <Sparkles size={12} />
          <span>Instant Printing Storefront</span>
        </div>
        <h1 className="plp-hero-title">
          Custom Photo &amp; Mug Printing in{' '}
          <span className="plp-hero-accent">Mumbai</span> — Online Orders &amp; Live Event Booths
        </h1>
        <p className="plp-hero-sub">
          Personalised ceramic mugs, magic mugs, frames, keychains &amp; archival photo packs crafted with your memories — delivered same-day in Mumbai or printed live at your celebration.
        </p>

        {/* Mode Actions (Order Online vs Live Event Booth Modal) */}
        <div className="plp-mode-tabs" role="group" aria-label="Choose ordering mode">
          <button
            type="button"
            className={`plp-mode-tab ${!isBoothModalOpen ? 'plp-mode-tab--active' : ''}`}
            onClick={scrollToOnlineOrders}
          >
            <ShoppingBag size={15} />
            <span>Order Online (Mumbai Delivery)</span>
          </button>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isBoothModalOpen}
            className={`plp-mode-tab ${isBoothModalOpen ? 'plp-mode-tab--active' : ''}`}
            onClick={openBoothModal}
          >
            <Camera size={15} />
            <span>Live Event Printing Booth</span>
          </button>
        </div>

        {/* Track Order CTA */}
        <Link
          to="/track-order"
          className="plp-track-order-btn"
          id="plp-track-order-btn"
          onClick={() => trackHeroCTA('Track Your Order')}
        >
          <Package size={16} />
          <span>Track Existing Order</span>
          <Search size={14} />
        </Link>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ORDER ONLINE (MUMBAI DELIVERY)
      ═══════════════════════════════════════════════════════════════ */}
      <section
        id="order-online"
        ref={onlineSectionRef}
        className="plp-grid-section"
        aria-label="Order Online (Mumbai Delivery)"
      >
        <div className="plp-section-header">
          <div className="plp-section-pill">
            <Truck size={13} />
            <span>Same-Day Mumbai Dispatch Available</span>
          </div>
          <h2 className="plp-section-title">Order Online (Mumbai Delivery)</h2>
          <p className="plp-section-desc">
            Select a product below to upload your photos, preview your design, and order personalized gifts delivered to your doorstep.
          </p>
        </div>

        {/* Trust & Urgency Bar */}
        <div className="plp-trust-bar" aria-label="Studio guarantees">
          <span>Printed in Mumbai</span>
          <span className="plp-trust-dot" aria-hidden="true">•</span>
          <span>Same-Day Delivery Available</span>
          <span className="plp-trust-dot" aria-hidden="true">•</span>
          <span>500+ Events Covered</span>
          <span className="plp-trust-dot" aria-hidden="true">•</span>
          <span>WhatsApp Support</span>
        </div>

        <div className="plp-grid">
          {products.map((product, idx) => (
            <article
              key={product.id}
              className="plp-card"
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              <Link
                to={`/instant-printing/${product.id}`}
                className="plp-card-link"
                onClick={() => trackProductClick(product.id, product.title, product.numericPrice)}
              >
                {/* WebP Product Image + Price + Delivery Badge */}
                <div className="plp-card-visual" style={{ background: product.gradient }}>
                  <img
                    src={product.image}
                    alt={product.imageAlt}
                    loading="lazy"
                    width={600}
                    height={600}
                    className="plp-card-img"
                  />
                  <div className="plp-card-price">{product.price}</div>
                  <div className="plp-delivery-badge">
                    <Truck size={11} />
                    <span>{product.deliveryBadge}</span>
                  </div>
                </div>

                {/* Card Summary */}
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
                </div>
              </Link>

              {/* Card CTAs */}
              <div className="plp-card-actions">
                <Link
                  to={`/instant-printing/${product.id}`}
                  className="plp-order-btn"
                  onClick={() => trackProductClick(product.id, product.title, product.numericPrice)}
                >
                  <span>Order Now</span>
                  <ArrowRight size={14} />
                </Link>
                <a
                  href={buildWhatsAppOrderUrl(product.title, product.price)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="plp-wa-btn"
                  onClick={() => trackWhatsAppOrderClick(product.id, product.title, product.numericPrice, 'storefront_card')}
                >
                  <MessageCircle size={14} />
                  <span>Order on WhatsApp</span>
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* ── AOV Booster: Popular Gift Combos Strip ──────────────── */}
        <div className="aov-combos-wrap" aria-label="Popular Gift Combos">
          <div className="aov-combos-header">
            <div className="aov-combos-eyebrow">
              <Gift size={14} />
              <span>Save Up to 20% on Curated Bundles</span>
            </div>
            <h2 className="aov-combos-title">Popular Gift Combos</h2>
            <p className="aov-combos-sub">
              Pair mugs, photo frames &amp; custom keychains in ready-to-gift keepsake boxes.
            </p>
          </div>

          <div className="aov-combos-grid">
            {giftCombos.map(combo => {
              const savings = combo.compareAtPrice - combo.price;
              return (
                <article key={combo.id} className="aov-combo-card">
                  <Link
                    to={`/instant-printing/gift-combos?combo=${combo.id}`}
                    className="aov-combo-link"
                    onClick={() => trackProductClick(`gift-combo-${combo.id}`, combo.title, combo.price)}
                  >
                    <div className="aov-combo-thumb">
                      <img
                        src={combo.image}
                        alt={combo.imageAlt}
                        loading="lazy"
                        width={240}
                        height={240}
                      />
                    </div>
                    <div className="aov-combo-body">
                      <span className="aov-combo-badge">{combo.badge}</span>
                      <h3 className="aov-combo-name">{combo.title}</h3>
                      <p className="aov-combo-contents">{combo.contents}</p>
                      <div className="aov-combo-pricing">
                        <span className="aov-combo-price">₹{combo.price}</span>
                        <span className="aov-combo-compare">₹{combo.compareAtPrice}</span>
                        <span className="aov-combo-save">Save ₹{savings}</span>
                      </div>
                      <div className="aov-combo-footer">
                        <span className="aov-combo-delivery">
                          <Truck size={11} /> {combo.deliveryBadge}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="plp-card-actions plp-card-actions--combo">
                    <Link
                      to={`/instant-printing/gift-combos?combo=${combo.id}`}
                      className="plp-order-btn"
                      onClick={() => trackProductClick(`gift-combo-${combo.id}`, combo.title, combo.price)}
                    >
                      <span>Order Now</span>
                      <ArrowRight size={14} />
                    </Link>
                    <a
                      href={buildWhatsAppOrderUrl(combo.title, combo.price)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="plp-wa-btn"
                      onClick={() => trackWhatsAppOrderClick(`gift-combo-${combo.id}`, combo.title, combo.price, 'combo_card', 'Gift Combos')}
                    >
                      <MessageCircle size={14} />
                      <span>Order on WhatsApp</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Event Printing Booth Modal */}
      {isBoothModalOpen && (
        <EventBoothModal onClose={() => setIsBoothModalOpen(false)} />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// LIVE EVENT PRINTING BOOTH MODAL
// ═══════════════════════════════════════════════════════════════
interface EventBoothModalProps {
  onClose: () => void;
}

const EventBoothModal: React.FC<EventBoothModalProps> = ({ onClose }) => {
  const contactNumber = import.meta.env.VITE_CONTACT_NUMBER;

  const steps = [
    {
      icon: <Camera size={22} />,
      title: 'Click',
      desc: 'Our photographer captures crisp portraits of your guests during the celebration.',
    },
    {
      icon: <Zap size={22} />,
      title: 'Print',
      desc: 'Custom photo prints, mugs, or keepsakes are produced on-site in minutes!',
    },
    {
      icon: <Gift size={22} />,
      title: 'Gift',
      desc: 'Guests walk out with a personalized framed photo or keepsake right before they leave.',
    },
  ];

  const eventTypes = ['Weddings', 'Birthdays', 'Receptions', 'Corporate Events'];

  const features = [
    { icon: <Clock size={15} />, label: 'Prints ready in minutes' },
    { icon: <Printer size={15} />, label: 'Lab-grade archival paper' },
    { icon: <Heart size={15} />, label: 'Custom event borders & branding' },
    { icon: <CheckCircle size={15} />, label: 'Full on-site booth setup included' },
    { icon: <Star size={15} />, label: '500+ Mumbai events covered' },
  ];

  return (
    <div
      className="eip-modal-backdrop"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="eip-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="eip-modal-title"
      >
        {/* Ambient blobs clipped cleanly inside modal shell */}
        <div className="eip-blob eip-blob--1" />
        <div className="eip-blob eip-blob--2" />

        <button
          type="button"
          className="eip-modal-close"
          onClick={onClose}
          aria-label="Close Live Event Printing Booth modal"
        >
          <X size={18} />
        </button>

        <div className="eip-modal-scroll">
          {/* Eyebrow */}
          <div className="eip-eyebrow">
            <Sparkles size={13} />
            <span>Live Event Printing Booth</span>
          </div>

          {/* Headline */}
          <h2 id="eip-modal-title" className="eip-headline eip-modal-title">
            Your Guests Leave With
            <span className="eip-headline-accent"><br />A Memory In Hand</span>
          </h2>
          <p className="eip-subline">
            Book our on-site live instant printing booth across Mumbai for <strong>weddings, birthdays, receptions, and corporate events</strong>. While your guests enjoy the event, we shoot, print, and pack personalised photo keepsakes live on the spot.
          </p>

          {/* Supported event types */}
          <div className="eip-event-tags">
            {eventTypes.map(type => (
              <span key={type} className="eip-event-tag">
                🎉 {type}
              </span>
            ))}
          </div>

          {/* Feature pills */}
          <div className="eip-pills">
            {features.map(f => (
              <div key={f.label} className="eip-pill">
                <span className="eip-pill-icon">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="eip-steps-wrap">
            <p className="eip-steps-label">How It Works</p>
            <div className="eip-steps">
              {steps.map((s, i) => (
                <React.Fragment key={s.title}>
                  <div className="eip-step">
                    <div className="eip-step-icon">{s.icon}</div>
                    <div className="eip-step-num">0{i + 1}</div>
                    <h3 className="eip-step-title">{s.title}</h3>
                    <p className="eip-step-desc">{s.desc}</p>
                  </div>
                  {i < steps.length - 1 && <div className="eip-step-connector" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Pull quote */}
          <div className="eip-quote">
            <div className="eip-quote-mark">"</div>
            <p className="eip-quote-text">
              Not every return gift survives the week.<br />A photo lasts a lifetime.
            </p>
            <div className="eip-quote-author">
              <Heart size={12} fill="#f43f5e" color="#f43f5e" />
              <span>Krishna Creation — Mumbai</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="eip-cta-wrap">
            <div className="eip-modal-actions">
              <Link
                to="/contact"
                onClick={() => {
                  trackEnquiryCTA('Book for Your Event');
                  onClose();
                  setTimeout(() => { window.location.hash = 'contact-us'; }, 100);
                }}
                className="eip-cta-btn"
                id="eip-book-event-cta"
              >
                <span className="eip-cta-icon">📸</span>
                Book for Your Event
                <ArrowRight size={16} />
              </Link>
              {contactNumber && (
                <a
                  href={`https://wa.me/${contactNumber}?text=${encodeURIComponent("Hi! I'd like to enquire about booking the Live Event Printing Booth for an upcoming event.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eip-wa-btn"
                  onClick={() => trackContactInfoClick('WhatsApp (Live Event Booth Modal)')}
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp Us</span>
                </a>
              )}
            </div>
            <p className="eip-cta-note">Serving Mumbai, Navi Mumbai &amp; Thane · Same-day event quotes</p>
          </div>
        </div>
      </div>
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
