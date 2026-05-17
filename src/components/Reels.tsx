import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { FaPlay } from "react-icons/fa";
import { Film, Loader2, CloudOff, Instagram } from "lucide-react";
import { useDriveVideos } from "./useDriveVideos";
import type { DriveVideoItem } from "./useDriveVideos";

const REELS_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_REELS_FOLDER_ID as string;

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Loading skeleton ─────────────────────────────────────────────────────────
const ReelSkeleton: React.FC = () => (
  <div className="reel-page">
    <div className="page-hero page-hero--dark">
      <div className="page-hero-icon"><Film size={32} strokeWidth={1.5} /></div>
      <h1 className="page-hero-title">Reels</h1>
      <p className="page-hero-sub">Short cinematic clips from our best sessions.</p>
    </div>
    <div className="reel-wrapper">
      <div className="reel-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
          <Loader2 size={40} className="gd-spinner" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: '0.9rem' }}>Loading reels from Google Drive…</p>
        </div>
      </div>
    </div>
  </div>
);

// ── Empty / Error state ──────────────────────────────────────────────────────
const ReelEmpty: React.FC<{ error?: string | null }> = ({ error }) => (
  <div className="reel-page">
    <div className="page-hero page-hero--dark">
      <div className="page-hero-icon"><Film size={32} strokeWidth={1.5} /></div>
      <h1 className="page-hero-title">Reels</h1>
      <p className="page-hero-sub">Short cinematic clips from our best sessions.</p>
    </div>
    <div className="reel-wrapper">
      <div className="reel-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#111' }}>
        <CloudOff size={40} style={{ color: 'rgba(255,255,255,0.4)' }} />
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textAlign: 'center', maxWidth: 260 }}>
          {error ?? 'No reels available yet. Check back soon!'}
        </p>
        <a
          href="https://www.instagram.com/krishna_creation10/reels"
          target="_blank"
          rel="noopener noreferrer"
          className="reel-ctrl-btn reel-ctrl-btn--play"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
        >
          <Instagram size={16} /> Watch on Instagram
        </a>
      </div>
    </div>
  </div>
);

// ── Main reel viewer ─────────────────────────────────────────────────────────
const ReelViewer: React.FC<{ reelList: DriveVideoItem[] }> = ({ reelList }) => {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const touchStartY = useRef(0);
  const touchDelta = useRef(0);
  const swiped = useRef(false);
  const wheelLock = useRef(false);

  const reel = reelList[current];

  // ── Navigate ──────────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    if (current < reelList.length - 1) setCurrent(c => c + 1);
    else window.open("https://www.instagram.com/krishna_creation10/reels", "_blank");
  }, [current, reelList.length]);

  const goPrev = useCallback(() => {
    if (current > 0) setCurrent(c => c - 1);
  }, [current]);

  // Reset play state on reel change
  useEffect(() => { setIsPlaying(false); }, [current]);

  // ── Auto-advance when reel finishes ──────────────────────────────────────
  useEffect(() => {
    // Only start the timer once the iframe has loaded and playback begins
    if (!isPlaying) return;
    // If Drive didn't return duration metadata, we can't auto-advance
    if (!reel.duration) return;

    // Add a 3 s buffer: onLoad fires when iframe HTML loads, not when video
    // actually starts playing, so we account for that startup lag.
    const timer = setTimeout(() => {
      goNext();
    }, reel.duration + 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, current, reel.duration, goNext]);


  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goNext();
      else if (e.key === "ArrowUp") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  // ── Wheel ─────────────────────────────────────────────────────────────────
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelLock.current) return;
    if (e.deltaY > 40) goNext();
    else if (e.deltaY < -40) goPrev();
    wheelLock.current = true;
    setTimeout(() => { wheelLock.current = false; }, 700);
  };

  // ── Touch ─────────────────────────────────────────────────────────────────
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
    if (!swiped.current) return;
    if (touchDelta.current > 60) goNext();
    else if (touchDelta.current < -60) goPrev();
  };

  return (
    <div className="reel-page">
      <Helmet>
        <title>Cinematic Reels | Krishna Creation</title>
        <meta name="description" content="Watch short cinematic clips and beautiful moments from our best photography sessions. Swipe up for more." />
      </Helmet>

      {/* Page Hero */}
      <div className="page-hero page-hero--dark">
        <div className="page-hero-icon"><Film size={32} strokeWidth={1.5} /></div>
        <h1 className="page-hero-title">Reels</h1>
        <p className="page-hero-sub">
          Short cinematic clips from our best sessions.
          Swipe up to watch more — sound on for the full experience.
        </p>
      </div>

      {/* Reel Container */}
      <div className="reel-wrapper">
        <div
          className="reel-container"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Google Drive iframe player — overflow hidden to clip the Drive control bar */}
          <div style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}>
            <iframe
              ref={iframeRef}
              key={reel.id}
              src={`${reel.embedUrl}?rm=minimal&autoplay=1`}
              className="reel-video"
              title={reel.caption}
              allow="autoplay; fullscreen"
              allowFullScreen
              style={{
                border: 'none',
                width: '100%',
                /* extend below the container so the Drive control bar is clipped */
                height: 'calc(100% + 56px)',
                background: '#000',
                pointerEvents: 'all',
              }}
              onLoad={() => setIsPlaying(true)}
            />
            {/* Black strip that sits over the Drive control bar area */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 56,
              background: '#000',
              pointerEvents: 'none',
            }} />
          </div>

          {/* Loading overlay before iframe loads */}
          {!isPlaying && (
            <div className="reel-center-icon" style={{ pointerEvents: 'none' }}>
              <Loader2 size={36} className="gd-spinner" />
            </div>
          )}

          {/* Progress dots */}
          <div className="reel-dots">
            {reelList.map((_, i) => (
              <div
                key={i}
                className={`reel-dot ${i === current ? 'reel-dot--active' : ''}`}
                onClick={() => setCurrent(i)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>

          {/* Bottom caption */}
          <div className="reel-bottom">
            <div className="reel-caption">{reel.caption}</div>
            <div className="reel-counter">{current + 1} / {reelList.length}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="reel-controls">
          <button
            className={`reel-ctrl-btn ${current === 0 ? 'reel-ctrl-btn--disabled' : ''}`}
            onClick={goPrev}
            disabled={current === 0}
          >
            ← Previous
          </button>
          <button
            className="reel-ctrl-btn reel-ctrl-btn--play"
            onClick={() => window.open(`https://drive.google.com/file/d/${reel.id}/view`, '_blank')}
          >
            <FaPlay size={13} /> Open Full
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

// ── Root export ───────────────────────────────────────────────────────────────
const ReelSwipe: React.FC = () => {
  const { videos, loading, error } = useDriveVideos(REELS_FOLDER_ID);

  const reelList = useMemo(() => shuffle(videos), [videos]);

  if (!REELS_FOLDER_ID) {
    return (
      <ReelEmpty error="Reels folder not configured yet. Please add VITE_GOOGLE_DRIVE_REELS_FOLDER_ID to your .env file." />
    );
  }

  if (loading) return <ReelSkeleton />;
  if (error) return <ReelEmpty error={`Could not load reels: ${error}`} />;
  if (reelList.length === 0) return <ReelEmpty />;

  return <ReelViewer reelList={reelList} />;
};

export default ReelSwipe;
