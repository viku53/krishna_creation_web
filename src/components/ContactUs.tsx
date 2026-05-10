import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Phone,
  MessageCircle,
  Instagram,
  // Video,
  MapPin,
  Clock,
  Camera,
  Award,
  Star,
  Send,
  Heart,
  Users,
  Loader2,
  CheckCircle,
  X,
} from 'lucide-react';
import { sendContactNotification, ENABLE_NOTIFICATIONS } from './sendNotification';

// ── Owner Data ─────────────────────────────────────────────────
const owners = [
  {
    name: 'Nikunj Sindhwad',
    role: 'Owner & Lead Photographer',
    experience: '15+',
    avatar: '👨‍🎨',
    description:
      'With over 15 years behind the lens, Nikunj brings a masterful eye for candid storytelling and cinematic wedding photography. His passion for capturing genuine emotions has made Krishna Creation a trusted name across hundreds of celebrations.',
    specialties: ['Wedding Photography', 'Candid Portraits'],
  },
  {
    name: 'Kunj Sindhwad',
    role: 'Owner & Creative Director',
    experience: '10+',
    avatar: '🎬',
    description:
      'Kunj\'s 10+ years of creative expertise shine through every frame and film. Specializing in pre-wedding shoots and event videography, he blends modern aesthetics with timeless artistry to craft unforgettable visual experiences.',
    specialties: ['Pre-wedding Shoots', 'Creative Direction'],
  },
];

// ── Contact Info ───────────────────────────────────────────────
const contactInfo = [
  {
    icon: Phone,
    label: 'Call Us',
    value: `+${import.meta.env.VITE_CONTACT_NUMBER}`,
    href: 'tel:+' + import.meta.env.VITE_CONTACT_NUMBER,
    color: '#3b82f6',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: 'Chat with us',
    href: 'https://wa.me/' + import.meta.env.VITE_CONTACT_NUMBER,
    color: '#22c55e',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: '@krishna_creation10',
    href: 'https://instagram.com/krishna_creation10',
    color: '#e879a8',
    // },
    // {
    //   icon: Video,
    //   label: 'Google Meet',
    //   value: 'Schedule a call',
    //   href: 'https://meet.google.com/',
    //   color: '#a78bfa',
  }
];

const ContactUs: React.FC = () => {
  const dateRef = React.useRef<HTMLInputElement>(null);

  // ─── Form state ──────────────────────────────────────────────
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [locationType, setLocationType] = useState('');
  const [guests, setGuests] = useState('');
  const [message, setMessage] = useState('');
  const [showUnavailable, setShowUnavailable] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ENABLE_NOTIFICATIONS) {
      setShowUnavailable(true);
      return;
    }

    setFormState('sending');

    try {
      const success = await sendContactNotification({
        name,
        email,
        phone,
        eventType,
        eventDate,
        locationType,
        guests,
        message,
      });

      if (success) {
        setFormState('sent');
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  };

  const resetForm = () => {
    setFormState('idle');
    setName('');
    setEmail('');
    setPhone('');
    setEventType('');
    setEventDate('');
    setLocationType('');
    setGuests('');
    setMessage('');
  };

  return (
    <div className="contact-page">
      <Helmet>
        <title>Contact Us | Krishna Creation</title>
        <meta name="description" content="Get in touch with Krishna Creation for your upcoming celebration. We bring your vision to life with cinematic storytelling and heartfelt photography." />
      </Helmet>
      {/* ── Decorative blobs ──────────────────────────────────── */}
      <div className="cs-blob cs-blob--1" />
      <div className="cs-blob cs-blob--2" />

      {/* ══════════════════════════════════════════════════════════
           HERO SECTION
      ══════════════════════════════════════════════════════════ */}
      <section className="contact-hero">
        <div className="contact-hero-badge">
          <Heart size={14} /> Get In Touch
        </div>
        <h1 className="contact-hero-title">
          Let's Create<br />
          <span className="contact-hero-accent">Something Beautiful</span>
        </h1>
        <p className="contact-hero-sub">
          Have an upcoming celebration? From intimate ring ceremonies to grand
          destination weddings — we bring your vision to life with cinematic
          storytelling and heartfelt photography.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════
           OWNERS / TEAM SECTION
      ══════════════════════════════════════════════════════════ */}
      <section className="contact-section">
        <div className="section-label">
          <Users size={16} /> Meet the Artists
        </div>
        <h2 className="section-heading">The Creative Minds Behind Krishna Creation</h2>
        <p className="section-desc">
          Two brothers, one shared passion — capturing life's most beautiful
          moments with artistry and authenticity.
        </p>

        <div className="owners-grid">
          {owners.map((owner) => (
            <div key={owner.name} className="owner-card">
              {/* Avatar */}
              <div className="owner-avatar">{owner.avatar}</div>

              {/* Info */}
              <div className="owner-info">
                <h3 className="owner-name">{owner.name}</h3>
                <span className="owner-role">{owner.role}</span>
                <p className="owner-desc">{owner.description}</p>

                {/* Experience badge */}
                <div className="owner-exp">
                  <Award size={16} />
                  <span>
                    <strong>{owner.experience} Years</strong> of Experience
                  </span>
                </div>

                {/* Specialties */}
                <div className="owner-tags">
                  {owner.specialties.map((tag) => (
                    <span key={tag} className="owner-tag">
                      <Star size={10} /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
           CONTACT INFO CARDS
      ══════════════════════════════════════════════════════════ */}
      <section className="contact-section" id='contact-us'>
        <div className="section-label">
          <Phone size={16} /> Reach Us Directly
        </div>
        <div className="contact-cards-row">
          {contactInfo.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-info-card"
            >
              <div
                className="contact-info-icon"
                style={{ background: `${item.color}20`, color: item.color }}
              >
                <item.icon size={22} />
              </div>
              <div className="contact-info-text">
                <span className="contact-info-label">{item.label}</span>
                <span className="contact-info-value">{item.value}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
           BOOKING FORM
      ══════════════════════════════════════════════════════════ */}
      <section className="contact-section">
        <div className="section-label">
          <Camera size={16} /> Book a Session
        </div>
        <h2 className="section-heading">Tell Us About Your Event</h2>
        <p className="section-desc">
          Fill in the details below and we'll get back to you within 24 hours
          with a personalized quote.
        </p>

        {/* ── Success State ──────────────────────────────── */}
        {formState === 'sent' ? (
          <div className="contact-success-card">
            <div className="contact-success-icon">
              <CheckCircle size={40} />
            </div>
            <h3 className="contact-success-title">Request Sent Successfully!</h3>
            <p className="contact-success-text">
              Thank you, <strong>{name}</strong>! We've received your callback request and will get back to you within 24 hours.
            </p>
            <div className="contact-success-details">
              <div className="contact-success-row">
                <span>📧 Email</span>
                <span>{email}</span>
              </div>
              <div className="contact-success-row">
                <span>📞 Phone</span>
                <span>{phone}</span>
              </div>
              <div className="contact-success-row">
                <span>🎉 Event</span>
                <span>{eventType}</span>
              </div>
            </div>
            <button onClick={resetForm} className="contact-success-btn">
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            {/* Row 1 — Name & Email */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="cf-name">Full Name</label>
                <input
                  id="cf-name"
                  className="form-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="off"
                  placeholder="Your full name"
                  minLength={2}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cf-email">Email</label>
                <input
                  id="cf-email"
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="off"
                  placeholder="you@example.com"
                  pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                  title="Please enter a valid email address"
                  required
                />
              </div>
            </div>

            {/* Row 2 — Phone & Event Type */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="cf-phone">Phone</label>
                <input
                  id="cf-phone"
                  className="form-input"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoComplete="off"
                  placeholder="+91 XXXXX XXXXX"
                  pattern="^[0-9+\-\s()]{10,15}$"
                  title="Please enter a valid phone number (10-15 digits)"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cf-event">Event Type</label>
                <div className="form-select-wrap">
                  <select
                    id="cf-event"
                    className="form-select"
                    required
                    value={eventType}
                    onChange={e => setEventType(e.target.value)}
                  >
                    <option value="" disabled hidden>Choose one…</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Pre-Wedding">Pre-Wedding</option>
                    <option value="Ring Ceremony">Ring Ceremony</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Corporate Event">Corporate Event</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 3 — Date & Location */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="cf-date">
                  <Clock size={14} /> Event Date
                </label>
                <input
                  id="cf-date"
                  ref={dateRef}
                  className="form-input"
                  type="text"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  placeholder="Select a date"
                  required
                  onFocus={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.type !== 'date') {
                      target.type = 'date';
                    }
                    dateRef.current?.showPicker();
                  }}
                  onBlur={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (!target.value) {
                      setTimeout(() => { target.type = 'text'; }, 0);
                    }
                  }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cf-location">
                  <MapPin size={14} /> Location Type
                </label>
                <div className="form-select-wrap">
                  <select
                    id="cf-location"
                    className="form-select"
                    required
                    value={locationType}
                    onChange={e => setLocationType(e.target.value)}
                  >
                    <option value="" disabled hidden>Choose one…</option>
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Destination">Destination</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 4 — Guests */}
            <div className="form-group">
              <label className="form-label" htmlFor="cf-guests">Approx. Guests</label>
              <input
                id="cf-guests"
                className="form-input"
                type="number"
                min="1"
                value={guests}
                onChange={e => setGuests(e.target.value)}
                autoComplete="off"
                placeholder="e.g. 200"
              />
            </div>

            {/* Row 5 — Message */}
            <div className="form-group">
              <label className="form-label" htmlFor="cf-message">Additional Details</label>
              <textarea
                id="cf-message"
                className="form-textarea"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder="Tell us about your vision — 2-day wedding, candid style, outdoor venue…"
              />
            </div>

            {/* Error message */}
            {formState === 'error' && (
              <div className="contact-form-error">
                ⚠️ Something went wrong. Please try again or contact us directly via WhatsApp.
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="form-submit"
              disabled={formState === 'sending'}
            >
              {formState === 'sending' ? (
                <>
                  <Loader2 size={16} className="spin-icon" /> Sending...
                </>
              ) : (
                <>
                  <Send size={16} /> Request a Callback
                </>
              )}
            </button>
            <p className="form-privacy">
              🔒 We respect your privacy. Your information is kept confidential
              and used solely to respond to your inquiry.
            </p>
          </form>
        )}
      </section>

      {/* ── Service Unavailable Modal ─────────────────────────── */}
      {showUnavailable && (
        <div className="unavailable-overlay" onClick={() => setShowUnavailable(false)}>
          <div className="unavailable-modal" onClick={e => e.stopPropagation()}>
            <button className="unavailable-close" onClick={() => setShowUnavailable(false)}>
              <X size={18} />
            </button>
            <div className="unavailable-icon">⚠️</div>
            <h3 className="unavailable-title">Service Temporarily Unavailable</h3>
            <p className="unavailable-text">
              Our online booking service is currently unavailable. We apologize for the inconvenience.
              Please reach out to us directly — we'd love to hear from you!
            </p>
            <div className="unavailable-actions">
              <a href={`tel:+${import.meta.env.VITE_CONTACT_NUMBER}`} className="unavailable-btn unavailable-btn--call">
                <Phone size={16} />
                Call Us
              </a>
              <a
                href={`https://wa.me/${import.meta.env.VITE_CONTACT_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="unavailable-btn unavailable-btn--wa"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>
            <p className="unavailable-thanks">Thank you for your understanding 🙏</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactUs;
