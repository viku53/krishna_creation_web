import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Instagram, Mail, Phone, Sparkles } from 'lucide-react';

const ComingSoon: React.FC = () => {
  return (
    <div className="home-page min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      <Helmet>
        <title>Coming Soon | Krishna Creation</title>
        <meta name="description" content="Krishna Creation - Premium Photography Studio. Our new website is launching soon." />
      </Helmet>

      {/* Background Image & Overlay */}
      <div
        className="hero-bg"
        style={{
          backgroundImage: 'url(/photos/Haldi/04.webp)',
          opacity: 0.6,
          filter: 'blur(4px) saturate(120%)',
          transform: 'scale(1.05)'
        }}
      />
      <div className="hero-overlay" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.8) 100%)' }} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 flex flex-col items-center max-w-2xl mx-auto">

        {/* Animated Badge */}
        <div className="hero-badge animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
          <Sparkles size={14} className="text-amber-400" />
          <span className="tracking-widest">Premium Photography</span>
        </div>

        {/* Main Title */}
        <h1 className="hero-title animate-slide-up mt-6" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards', fontSize: 'clamp(3rem, 10vw, 5.5rem)' }}>
          Coming <span className="hero-title-accent">Soon</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle mt-6 mb-10 animate-fade-in" style={{ animationDelay: '0.6s', opacity: 0, animationFillMode: 'forwards' }}>
          We are currently crafting a beautifully new digital experience.
          Stay tuned for our breathtaking portfolio and cinematic stories.
        </p>

        {/* Contact Links */}
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

      {/* Decorative CSS keyframes added directly if needed, but App.css already has fade/slide anims */}
      <style>{`
        @keyframes slideUpFade {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;
