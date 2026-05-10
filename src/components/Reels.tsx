import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { FaPlay, FaPause } from "react-icons/fa";
import { Film } from "lucide-react";

// ─── All reel files with captions ─────────────────────────────────────────────
const allReels = [
  { id: 1, url: '/reels/wedding.mp4', caption: 'Beautiful Wedding Moments ✨' },
  { id: 2, url: '/reels/Prewedding.mp4', caption: 'Pre-Wedding Story 💕' },
  { id: 3, url: '/reels/Reel-1.mp4', caption: 'Cinematic Highlights 🎬' },
  { id: 4, url: '/reels/Reel-2.mp4', caption: 'Magical Frames 📸' },
  { id: 5, url: '/reels/carnival.mp4', caption: 'Carnival Vibes 🎪' },
  { id: 6, url: '/reels/dj.mp4', caption: 'DJ Night Energy 🎶' },
  { id: 7, url: '/reels/getting-ready.mp4', caption: 'Getting Ready Moments 💄' },
  { id: 8, url: '/reels/haldi.mp4', caption: 'Haldi Ceremony 💛' },
  { id: 9, url: '/reels/prewedding-1.mp4', caption: 'Pre-Wedding Love Story 💑' },
  { id: 10, url: '/reels/reception.mp4', caption: 'Grand Reception Night 🌟' },
];

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ReelSwipe = () => {
  const reelList = useMemo(() => shuffle(allReels), []);

  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartY = useRef(0);
  const touchDelta = useRef(0);
  const swiped = useRef(false);

  const reel = reelList[current];

  // ── Navigate ───────────────────────────────────────────────
  const goNext = useCallback(() => {
    if (current < reelList.length - 1) setCurrent(c => c + 1);
  }, [current]);

  const goPrev = useCallback(() => {
    if (current > 0) setCurrent(c => c - 1);
  }, [current]);

  // ── Play / Pause ──────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // ── Reset on reel change ──────────────────────────────────
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => { });
    }
  }, [current]);

  // ── Keyboard ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goNext();
      else if (e.key === "ArrowUp") goPrev();
      else if (e.key === " ") { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, togglePlay]);

  // ── Wheel ─────────────────────────────────────────────────
  const wheelLock = useRef(false);
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelLock.current) return;
    if (e.deltaY > 40) goNext();
    else if (e.deltaY < -40) goPrev();
    wheelLock.current = true;
    setTimeout(() => { wheelLock.current = false; }, 700);
  };

  // ── Touch swipe ───────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchDelta.current = 0;
    swiped.current = false;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchDelta.current = touchStartY.current - e.touches[0].clientY;
    if (Math.abs(touchDelta.current) > 15) swiped.current = true;
  };
  const handleTouchEnd = () => {
    if (!swiped.current) { togglePlay(); return; }
    if (touchDelta.current > 60) goNext();
    else if (touchDelta.current < -60) goPrev();
  };

  // ── Auto-advance / redirect ───────────────────────────────
  const handleVideoEnd = () => {
    if (current < reelList.length - 1) {
      setTimeout(() => setCurrent(c => c + 1), 500);
    } else {
      // Last reel finished → go to Instagram
      window.location.href = "https://www.instagram.com/krishna_creation10/reels";
    }
  };

  return (
    <div className="reel-page">
      <Helmet>
        <title>Cinematic Reels | Krishna Creation</title>
        <meta name="description" content="Watch short cinematic clips and beautiful moments from our best photography sessions. Swipe up for more." />
      </Helmet>
      {/* ── Page Hero (matches other pages) ─────────────────── */}
      <div className="page-hero page-hero--dark">
        <div className="page-hero-icon"><Film size={32} strokeWidth={1.5} /></div>
        <h1 className="page-hero-title">Reels</h1>
        <p className="page-hero-sub">
          Short cinematic clips from our best sessions.
          Swipe up to watch more — sound on for the full experience.
        </p>
      </div>

      {/* ── Reel Container ─────────────────────────────────── */}
      <div className="reel-wrapper">
        <div
          className="reel-container"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={togglePlay}
        >
          {/* Video */}
          <video
            ref={videoRef}
            key={reel.id}
            className="reel-video"
            src={reel.url}
            autoPlay
            muted={false}
            playsInline
            loop={false}
            onEnded={handleVideoEnd}
          />

          {/* Progress dots */}
          <div className="reel-dots">
            {reelList.map((_, i) => (
              <div key={i} className={`reel-dot ${i === current ? 'reel-dot--active' : ''}`} />
            ))}
          </div>

          {/* Mute button */}
          {/* <button
            className="reel-mute-btn"
            onClick={(e) => { e.stopPropagation(); setIsMuted(m => !m); }}
            aria-label="Toggle sound"
          >
            {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
          </button> */}

          {/* Play / Pause center indicator */}
          {!isPlaying && (
            <div className="reel-center-icon">
              <FaPlay size={36} />
            </div>
          )}

          {/* Bottom gradient + caption */}
          <div className="reel-bottom">
            <div className="reel-caption">{reel.caption}</div>
            <div className="reel-counter">{current + 1} / {reelList.length}</div>
          </div>

          {/* Swipe hint */}
          {current < reelList.length - 1 && (
            <div className="reel-swipe-hint">
              <span>↑ Swipe up for next</span>
            </div>
          )}
        </div>

        {/* Controls below container */}
        <div className="reel-controls">
          <button
            className={`reel-ctrl-btn ${current === 0 ? 'reel-ctrl-btn--disabled' : ''}`}
            onClick={goPrev}
            disabled={current === 0}
          >
            ← Previous
          </button>
          <button className="reel-ctrl-btn reel-ctrl-btn--play" onClick={togglePlay}>
            {isPlaying ? <><FaPause size={14} /> Pause</> : <><FaPlay size={14} /> Play</>}
          </button>
          <button
            className={`reel-ctrl-btn ${current === reelList.length - 1 ? 'reel-ctrl-btn--disabled' : ''}`}
            onClick={goNext}
            disabled={current === reelList.length - 1}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReelSwipe;
