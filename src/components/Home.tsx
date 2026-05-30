import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Camera, Film, Video, ShoppingBag, Mail, Phone, Instagram, ChevronDown, ArrowRight, Star, Sparkles, Users, Printer, Heart, CheckCircle } from 'lucide-react';

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ─── Intersection observer hook ───────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

// Mobile: PORTRAIT-only photos (height > width) — fills tall screens beautifully
const heroPhotosMobile = [
  '/photos/Wedding/02.webp',
  '/photos/Haldi/01.webp',
  '/photos/Wedding/05.webp',
  '/photos/Engagment/01.webp',
  '/photos/Wedding/09.webp',
  '/photos/Haldi/07.webp',
  '/photos/Wedding/22.webp',
  '/photos/Engagment/04.webp',
  '/photos/Wedding/25.webp',
  '/photos/Haldi/13.webp',
];

// Tablet & Desktop: LANDSCAPE-only photos (width > height) — fills wide screens beautifully
const heroPhotosDesktop = [
  '/photos/Wedding/01.webp',
  '/photos/Haldi/05.webp',
  '/photos/Wedding/12.webp',
  '/photos/Sangeet/02.webp',
  '/photos/Wedding/20.webp',
  '/photos/Engagment/06.webp',
  '/photos/Haldi/09.webp',
  '/photos/Wedding/30.webp',
  '/photos/Sangeet/04.webp',
];

// ─── Responsive hook ──────────────────────────────────────────────────────────
function useIsDesktop(breakpoint = 768) {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= breakpoint : false
  );
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isDesktop;
}

const stats = [
  { value: 15, suffix: '+', label: 'Years of Excellence' },
  { value: 2000, suffix: '+', label: 'Happy Clients' },
];

const services = [
  {
    to: '/photos',
    icon: <Camera size={28} strokeWidth={1.5} />,
    title: 'Photography',
    desc: 'Timeless frames that tell your story with artistic precision.',
    color: 'from-rose-500/20 to-pink-500/10',
    accent: '#f43f5e',
    bg: '/photos/Wedding/09.webp',
  },
  {
    to: '/reels',
    icon: <Film size={28} strokeWidth={1.5} />,
    title: 'Reels',
    desc: 'Cinematic short films crafted for the social-first world.',
    color: 'from-violet-500/20 to-purple-500/10',
    accent: '#8b5cf6',
    bg: '/photos/Haldi/06.webp',
  },
  {
    to: '/videos',
    icon: <Video size={28} strokeWidth={1.5} />,
    title: 'Videography',
    desc: 'Full-length cinematic wedding films with emotion and depth.',
    color: 'from-blue-500/20 to-cyan-500/10',
    accent: '#3b82f6',
    bg: '/photos/Pre-Wedding/024.webp',
  },
  {
    to: '/instant-printing',
    icon: <ShoppingBag size={28} strokeWidth={1.5} />,
    title: 'Instant Printing',
    desc: 'Premium prints, mugs, frames — memories you can touch.',
    color: 'from-amber-500/20 to-orange-500/10',
    accent: '#f59e0b',
    bg: '/photos/Wedding/41.webp',
  },
];

const testimonials = [
  { name: 'Kinjal & Ronak', text: 'Krishna Creation captured every emotion of our wedding perfectly. The reels were magical!', stars: 5 },
  { name: 'Meera S.', text: 'The instant prints were so beautiful. Our family was blown away by the quality!', stars: 5 },
  { name: 'Kiran & Paren', text: 'Absolutely cinematic. Every frame felt like a painting. Highly recommended!', stars: 5 },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ value: number; suffix: string; label: string; start: boolean }> = ({ value, suffix, label, start }) => {
  const count = useCountUp(value, 1800, start);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl md:text-4xl font-black text-white tracking-tight">
        {count}{suffix}
      </span>
      <span className="text-xs md:text-sm text-white/60 uppercase tracking-widest font-medium">{label}</span>
    </div>
  );
};

// ─── Home Component ───────────────────────────────────────────────────────────
const Home: React.FC = () => {
  const isDesktop = useIsDesktop();
  const heroPhotos = isDesktop ? heroPhotosDesktop : heroPhotosMobile;
  const [heroIndex, setHeroIndex] = useState(0);
  const statsRef = useInView(0.3);
  const servicesRef = useInView(0.1);
  const testimonialRef = useInView(0.2);

  // Reset index when switching sets so we don't go out of bounds
  useEffect(() => {
    setHeroIndex(0);
  }, [isDesktop]);

  // Auto-cycle hero
  useEffect(() => {
    const t = setInterval(() => setHeroIndex(i => (i + 1) % heroPhotos.length), 4000);
    return () => clearInterval(t);
  }, [heroPhotos.length]);

  return (
    <div className="home-page">
      <Helmet>
        <title>Krishna Creation | Best Photography Studio in Mumbai – Wedding, Pre-Wedding & Event Photography</title>
        <meta name="description" content="Krishna Creation – Mumbai's best photography studio by Nikunj Sindhwad. Wedding photography, pre-wedding shoots, haldi, sangeet, engagement, portrait & candid photography. Cinematic reels & 4K videography. 15+ years, 2000+ happy clients. Book now!" />
        <meta name="keywords" content="best photography studio Mumbai, best wedding photographer Mumbai, photography near me Mumbai, wedding photography Mumbai, pre-wedding photography Mumbai, candid photography Mumbai, portrait photography, haldi photography Mumbai, sangeet photography, engagement photography Mumbai, event photographer Mumbai, cinematic reels, videography Mumbai, 4K wedding videography, top photographer Mumbai, professional photographer Mumbai, affordable wedding photographer Mumbai, Nikunj Sindhwad photographer, Krishna Creation Mumbai" />
        <link rel="canonical" href="https://krishnacreationphotography.com/" />
        <meta property="og:url" content="https://krishnacreationphotography.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Krishna Creation | Best Photography Studio Mumbai – Wedding & Pre-Wedding Photography" />
        <meta property="og:description" content="Mumbai's best photography studio – wedding, pre-wedding, portrait & candid photography. 4K cinematic reels & videography by Nikunj Sindhwad. 15+ years, 2000+ happy clients. Modern Vision, Timeless Memories." />
        <meta property="og:image" content="https://krishnacreationphotography.com/photos/Wedding/01.webp" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="800" />
        <meta property="og:image:alt" content="Krishna Creation – Best Wedding Photography in Mumbai" />
        <meta name="twitter:url" content="https://krishnacreationphotography.com/" />
        <meta name="twitter:title" content="Krishna Creation | Best Photography Studio Mumbai" />
        <meta name="twitter:description" content="Mumbai's top wedding & event photography studio. 15+ years, 2000+ happy clients. Book now!" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://krishnacreationphotography.com/" }
          ]
        })}</script>
      </Helmet>


      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero-section" aria-label="Hero">
        {/* Background slideshow */}
        {heroPhotos.map((src, i) => (
          <div
            key={src}
            className="hero-bg"
            style={{
              backgroundImage: `url(${src})`,
              opacity: i === heroIndex ? 1 : 0,
              transition: 'opacity 1.2s cubic-bezier(0.4,0,0.2,1)',
            }}
            aria-hidden="true"
          />
        ))}
        {/* Gradient overlay */}
        <div className="hero-overlay" />

        {/* Dot indicators */}
        {/* <div className="hero-dots">
          {heroPhotos.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className={`hero-dot ${i === heroIndex ? 'hero-dot--active' : ''}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div> */}

        {/* Content */}
        <div className="hero-content">
          <div className="hero-badge animate-fade-in">
            <Star size={12} fill="currentColor" />
            <span>Premium Photography Studio</span>
          </div>

          <h1 className="hero-title animate-slide-up">
            Modern Vision,<br />
            <span className="hero-title-accent">Timeless</span> Memories.
          </h1>

          <p className="hero-subtitle animate-fade-in">
            From breathtaking photography to cinematic reels — we craft every detail with artistry and passion.
          </p>

          <div className="hero-cta">
            <Link to="/photos" className="hero-btn-primary">
              View Portfolio
              <ArrowRight size={18} />
            </Link>
            <Link to="/contact" onClick={() => setTimeout(() => window.location.hash = "contact-us", 100)} className="hero-btn-secondary">
              Book a Session
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="hero-scroll-hint" onClick={() => servicesRef.ref.current?.scrollIntoView({ behavior: 'smooth' })}>
          <span>Scroll</span>
          <ChevronDown size={16} className="animate-bounce" />
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="stats-section justify-center" ref={statsRef.ref} aria-label="Our stats">
        <div className="stats-grid">
          {stats.map(s => (
            <StatCard key={s.label} {...s} start={statsRef.inView} />
          ))}
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      <section className="services-section" ref={servicesRef.ref} aria-label="Our services">
        <div className="section-header">
          <p className="section-eyebrow">What We Do</p>
          <h2 className="section-title">Crafting Every Moment</h2>
          <p className="section-sub">Four distinct services, one unified passion for visual storytelling.</p>
        </div>

        <div className="services-grid">
          {services.map((service, i) => (
            <Link
              to={service.to}
              key={service.title}
              className="service-card"
              style={{ animationDelay: `${i * 0.1}s` }}
              onClick={() => setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)}
            >
              {/* Background image */}
              <div
                className="service-card-bg"
                style={{ backgroundImage: `url(${service.bg})` }}
              />
              {/* Gradient overlay */}
              <div className="service-card-overlay" />

              {/* Content */}
              <div className="service-card-content">
                <div className="service-icon" style={{ color: service.accent }}>
                  {service.icon}
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-desc">{service.desc}</p>
                <div className="service-link" style={{ color: service.accent }}>
                  Explore <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── PORTFOLIO STRIP ──────────────────────────────────────────────── */}
      <section className="portfolio-strip" aria-label="Portfolio preview">
        <div className="section-header">
          <p className="section-eyebrow">The Gallery</p>
          <h2 className="section-title">Moments We've Captured</h2>
        </div>

        <div className="portfolio-mosaic">
          {[
            { src: '/photos/Wedding/05.webp', alt: 'Wedding photography Mumbai – bride and groom captured by Krishna Creation' },
            { src: '/photos/Pre-Wedding/02.webp', alt: 'Pre-wedding photography shoot Mumbai by Krishna Creation' },
            { src: '/photos/Wedding/13.webp', alt: 'Candid wedding photography Mumbai – emotional moment by Krishna Creation' },
            { src: '/photos/Wedding/40.webp', alt: 'Wedding ceremony photography Mumbai by Nikunj Sindhwad' },
            { src: '/photos/Haldi/05.webp', alt: 'Haldi ceremony photography Mumbai – vibrant colours by Krishna Creation' },
          ].map(({ src, alt }, i) => (
            <div key={i} className={`mosaic-item mosaic-item--${i + 1}`}>
              <img src={src} alt={alt} className="mosaic-img" loading="lazy" decoding="async" />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Link to="/photos" className="hero-btn-primary" onClick={() => setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)}>
            See Full Gallery <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── WHAT WE DO — DETAILED SERVICES ─────────────────────────────── */}
      <section className="wwd-section" aria-label="What We Do">
        <div className="section-header">
          <p className="section-eyebrow">What We Do</p>
          <h2 className="section-title" style={{ color: '#fff' }}>Complete Event Solutions</h2>
          <p className="section-sub" style={{ color: 'rgba(255,255,255,0.55)' }}>
            From capturing your moments to printing them on the spot — we deliver end-to-end event coverage.
          </p>
        </div>

        <div className="wwd-grid">
          {/* ─ Photography & Videography Card ─ */}
          <div className="wwd-card">
            <div className="wwd-card-icon" style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
              <Camera size={28} />
            </div>
            <h3 className="wwd-card-title">Photography & Videography</h3>
            <p className="wwd-card-desc">
              Professional photography and cinematic videography for all your special occasions.
              Our experienced team captures every emotion, every smile, and every unforgettable moment.
            </p>
            <div className="wwd-card-events">
              <span className="wwd-event-tag">💒 Wedding</span>
              <span className="wwd-event-tag">🎂 Birthday</span>
              <span className="wwd-event-tag">🏢 Corporate</span>
              <span className="wwd-event-tag">💍 Ring Ceremony</span>
              <span className="wwd-event-tag">🎉 Reception</span>
              <span className="wwd-event-tag">🎬 Pre-Wedding</span>
            </div>
            <ul className="wwd-features">
              <li><CheckCircle size={14} /> Candid & traditional photography</li>
              <li><CheckCircle size={14} /> 4K cinematic videography</li>
              <li><CheckCircle size={14} /> Drone aerial shots</li>
              <li><CheckCircle size={14} /> Same-day highlight reels</li>
            </ul>
            <Link to="/contact" className="wwd-enquiry-btn">
              <Heart size={14} />
              Enquire Now
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* ─ Instant Printing at Events Card ─ */}
          <div className="wwd-card">
            <div className="wwd-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
              <Printer size={28} />
            </div>
            <h3 className="wwd-card-title">Instant Printing at Events</h3>
            <p className="wwd-card-desc">
              On-the-spot photo printing and custom mug printing at your events!
              Guests take home personalized keepsakes — photo prints, custom mugs, and more, all created live.
            </p>
            <div className="wwd-card-events">
              <span className="wwd-event-tag">💒 Wedding</span>
              <span className="wwd-event-tag">🎂 Birthday</span>
              <span className="wwd-event-tag">🎉 Reception</span>
              <span className="wwd-event-tag">🏢 Corporate</span>
            </div>
            <ul className="wwd-features">
              <li><CheckCircle size={14} /> Live photo printing booth</li>
              <li><CheckCircle size={14} /> Custom mug printing on-site</li>
              <li><CheckCircle size={14} /> Personalized frames & keychains</li>
              <li><CheckCircle size={14} /> Ready in minutes — take home instantly</li>
            </ul>
            <Link to="/contact" className="wwd-enquiry-btn wwd-enquiry-btn--amber">
              <Sparkles size={14} />
              Book for Your Event
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* ─ Professional Team Card ─ */}
          <div className="wwd-card wwd-card--team">
            <div className="wwd-card-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
              <Users size={28} />
            </div>
            <h3 className="wwd-card-title">Professional Experienced Team</h3>
            <p className="wwd-card-desc">
              With <strong>15+ years</strong> of combined experience, our team of skilled photographers,
              videographers, and editors ensures every project meets the highest standards.
              We've covered <strong>500+ events</strong> and delivered <strong>50,000+ photos</strong>.
            </p>
            <div className="wwd-team-stats">
              <div className="wwd-stat">
                <span className="wwd-stat-value">15+</span>
                <span className="wwd-stat-label">Years Exp.</span>
              </div>
              <div className="wwd-stat">
                <span className="wwd-stat-value">500+</span>
                <span className="wwd-stat-label">Events</span>
              </div>
              <div className="wwd-stat">
                <span className="wwd-stat-value">200+</span>
                <span className="wwd-stat-label">Happy Clients</span>
              </div>
            </div>
            <Link to="/contact" className="wwd-enquiry-btn wwd-enquiry-btn--violet">
              <Users size={14} />
              Meet Our Team
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="testimonials-section" ref={testimonialRef.ref} aria-label="Testimonials">
        <div className="section-header">
          <p className="section-eyebrow">Kind Words</p>
          <h2 className="section-title" style={{ color: '#fff' }}>Love From Our Clients</h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="testimonial-card"
              style={{ animationDelay: `${i * 0.15}s`, opacity: testimonialRef.inView ? 1 : 0, transform: testimonialRef.inView ? 'translateY(0)' : 'translateY(24px)', transition: `all 0.6s ease ${i * 0.15}s` }}
            >
              <div className="testimonial-stars justify-center">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <Star key={si} size={14} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <span className="testimonial-name">— {t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER NAV ───────────────────────────────────────────────────── */}
      <footer className="home-footer" aria-label="Footer">
        {/* Brand block */}
        <div className="footer-brand">
          <div className="footer-logo"><img src="/logo.png" alt="Krishna Creation" /></div>
          <h2 className="footer-brand-name">Krishna Creation</h2>
          <p className="footer-tagline">Where every frame tells a timeless story.</p>
          <div className="footer-socials">
            <a href="https://www.instagram.com/krishna_creation10" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social-btn">
              <Instagram size={18} />
            </a>
            <a href={`tel:+${import.meta.env.VITE_CONTACT_NUMBER}`} aria-label="Call us" className="footer-social-btn">
              <Phone size={18} />
            </a>
            <a href={`mailto:${import.meta.env.VITE_EMAILJS_TO_EMAIL}`} aria-label="Email us" className="footer-social-btn">
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Navigation grid */}
        <div className="footer-nav-grid">
          <div className="footer-nav-col">
            <h3 className="footer-nav-heading">Services</h3>
            <Link to="/photos" className="footer-nav-link">Photography</Link>
            <Link to="/reels" className="footer-nav-link">Reels</Link>
            <Link to="/videos" className="footer-nav-link">Videography</Link>
            <Link to="/instant-printing" className="footer-nav-link">Instant Printing</Link>
          </div>
          <div className="footer-nav-col">
            <h3 className="footer-nav-heading">About</h3>
            <Link to="/" className="footer-nav-link">Home</Link>
            <Link to="/contact" className="footer-nav-link">Contact Us</Link>
          </div>
          <div className="footer-nav-col">
            <h3 className="footer-nav-heading">Get in Touch</h3>
            <a href={`tel:+${import.meta.env.VITE_CONTACT_NUMBER}`} className="footer-nav-link">📞 Call Us</a>
            <a href={`mailto:${import.meta.env.VITE_EMAILJS_TO_EMAIL}`} className="footer-nav-link">✉ Mail Us</a>
            <a href="https://www.instagram.com/krishna_creation10" target="_blank" rel="noopener noreferrer" className="footer-nav-link">📸 Instagram</a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Krishna Creation. All rights reserved.</span>
          <span>Made with ❤️ for timeless memories</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
