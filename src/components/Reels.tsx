import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Film, Loader2, CloudOff, Instagram, Volume2, VolumeX, AlertCircle } from "lucide-react";
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

// ── Loading skeleton ──────────────────────────────────────────────────────────
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
          <p style={{ fontSize: '0.9rem' }}>Loading reels…</p>
        </div>
      </div>
    </div>
  </div>
);

// ── Empty / Error state ───────────────────────────────────────────────────────
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

// ── Main reel viewer ──────────────────────────────────────────────────────────
const ReelViewer: React.FC<{ reelList: DriveVideoItem[] }> = ({ reelList }) => {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  /**
   * mode:
   *  'video'  — native <video> via uc?export=download (best: full control)
   *  'iframe' — Google Drive /preview iframe (fallback when video gets 403)
   *             iframes bypass the hotlink block because they are top-level navigations
   *  'error'  — both failed, show error UI
   */
  const [mode, setMode] = useState<'video' | 'error'>('video');

  /**
   * muted must start true — ALL browsers block unmuted autoplay (policy).
   * We unmute after the first user tap (same pattern as Instagram / TikTok).
   */
  const [isMuted, setIsMuted] = useState(true);
  const [userUnmuted, setUserUnmuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartY = useRef(0);
  const touchDelta = useRef(0);
  const swiped = useRef(false);
  const wheelLock = useRef(false);

  const reel = reelList[current];

  // ── Navigate ───────────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    if (current < reelList.length - 1) setCurrent(c => c + 1);
    else window.open("https://www.instagram.com/krishna_creation10/reels", "_blank");
  }, [current, reelList.length]);

  const goPrev = useCallback(() => {
    if (current > 0) setCurrent(c => c - 1);
  }, [current]);

  // Reset state on reel change
  useEffect(() => {
    setIsPlaying(false);
    setMode('video');   // always try native video first for each new reel
    const vid = videoRef.current;
    if (vid) vid.load();
  }, [current]);

  // webkit-playsinline for older iOS
  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      vid.setAttribute('webkit-playsinline', 'true');
      vid.setAttribute('x-webkit-airplay', 'allow');
    }
  }, []);

  // Sync isMuted → actual video element
  useEffect(() => {
    const vid = videoRef.current;
    if (vid) vid.muted = isMuted;
  }, [isMuted]);

  // ── Mute toggle ────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    setIsMuted(m => !m);
    setUserUnmuted(true);
  }, []);

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goNext();
      else if (e.key === "ArrowUp") goPrev();
      else if (e.key === "m" || e.key === "M") toggleMute();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goNext, goPrev, toggleMute]);

  // ── Wheel ──────────────────────────────────────────────────────────────────
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelLock.current) return;
    if (e.deltaY > 40) goNext();
    else if (e.deltaY < -40) goPrev();
    wheelLock.current = true;
    setTimeout(() => { wheelLock.current = false; }, 700);
  };

  // ── Tap on video — first tap unmutes, subsequent taps toggle play/pause ────
  const handleVideoTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!userUnmuted) {
      setIsMuted(false);
      setUserUnmuted(true);
      return;
    }
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) vid.play().catch(() => { });
    else vid.pause();
  }, [userUnmuted]);

  // ── Touch swipe ────────────────────────────────────────────────────────────
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

  // ── Video error handler — go straight to error state ────────────────────
  // We skip the iframe fallback entirely because the Google Drive /preview
  // iframe injects its own player UI with a black overlay and doesn't center
  // correctly inside a 9:16 portrait container (it's built for 16:9).
  const handleVideoError = useCallback(() => {
    setMode('error');
    setIsPlaying(false);
  }, []);

  return (
    <div className="reel-page">
      <Helmet>
        <title>Cinematic Reels – Best Wedding Highlight Films Mumbai | Krishna Creation</title>
        <meta name="description" content="Watch Krishna Creation's cinematic wedding reels & short highlight films – Mumbai's best wedding & event videographers. Emotional storytelling, vibrant 4K footage. Swipe & experience the magic!" />
        <meta name="keywords" content="wedding reels Mumbai, cinematic wedding reels, best wedding videographer Mumbai, short wedding films, wedding highlight video Mumbai, pre-wedding reel Mumbai, event reel, Instagram reels wedding Mumbai, Krishna Creation reels, wedding videographer Mumbai, 4K wedding reel, best wedding reel maker Mumbai" />
        <link rel="canonical" href="https://krishnacreationphotography.com/reels" />
        <meta property="og:url" content="https://krishnacreationphotography.com/reels" />
        <meta property="og:type" content="video.other" />
        <meta property="og:title" content="Cinematic Wedding Reels | Krishna Creation – Best Videographer Mumbai" />
        <meta property="og:description" content="Mumbai's best cinematic wedding reels & short highlight films by Krishna Creation. 4K, emotional, vibrant storytelling." />
        <meta property="og:image" content="https://krishnacreationphotography.com/logo.png" />
        <meta property="og:image:alt" content="Cinematic wedding reels by Krishna Creation Mumbai" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://krishnacreationphotography.com/" },
            { "@type": "ListItem", "position": 2, "name": "Cinematic Reels", "item": "https://krishnacreationphotography.com/reels" }
          ]
        })}</script>
      </Helmet>

      {/* Page Hero */}
      <div className="page-hero page-hero--dark">
        <div className="page-hero-icon"><Film size={32} strokeWidth={1.5} /></div>
        <h1 className="page-hero-title">Reels</h1>
        <p className="page-hero-sub">
          Short cinematic clips from our best sessions.
          Tap the video to turn sound on — swipe to watch more.
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

          {/* ── MODE: native <video> ────────────────────────────────────────
           *  `muted` is REQUIRED for autoplay on ALL browsers. Removing it
           *  blocks autoplay AND can cascade into load failures. We unmute
           *  via the mute button or first tap (same as Instagram / TikTok).
           * ─────────────────────────────────────────────────────────────── */}
          {mode === 'video' && (
            <video
              ref={videoRef}
              key={reel.id}
              src={reel.streamUrl}
              className="reel-video"
              autoPlay={true}
              muted={isMuted}
              playsInline
              preload="auto"
              poster={reel.thumbnailUrl}
              loop={false}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                // Do NOT set background here — it causes a black overlay on iOS Safari
                // when the video element is composited on its own GPU layer.
                // The container (.reel-container) already has background:#000.
                cursor: 'pointer',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
              }}
              onCanPlay={() => setIsPlaying(true)}
              onPlaying={() => setIsPlaying(true)}
              onWaiting={() => setIsPlaying(false)}
              onEnded={goNext}
              onClick={handleVideoTap}
              onError={handleVideoError}
            />
          )}

          {/* iframe mode removed — Drive /preview iframe injects its own
           *  player UI (black overlay + Google chrome) and doesn't center in
           *  9:16 containers. We go straight to error state instead. */}

          {/* ── MODE: error ─────────────────────────────────────────────── */}
          {mode === 'error' && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.75rem', background: 'rgba(0,0,0,0.85)',
              padding: '1.5rem',
            }}>
              <AlertCircle size={32} style={{ color: '#f87171' }} />
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', textAlign: 'center', margin: 0 }}>
                Couldn't load this reel.
              </p>
              <a
                href={`https://drive.google.com/file/d/${reel.id}/view`}
                target="_blank" rel="noopener noreferrer"
                className="reel-ctrl-btn reel-ctrl-btn--play"
                style={{ textDecoration: 'none', fontSize: '0.78rem' }}
              >
                Open in Drive
              </a>
            </div>
          )}

          {/* Buffering spinner (only in video mode) */}
          {mode === 'video' && !isPlaying && (
            <div className="reel-center-icon" style={{ pointerEvents: 'none' }}>
              <Loader2 size={36} className="gd-spinner" />
            </div>
          )}

          {/* "Tap for sound" badge — only in native video mode, before first unmute */}
          {mode === 'video' && isPlaying && !userUnmuted && (
            <div
              onClick={handleVideoTap}
              style={{
                position: 'absolute',
                bottom: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 6,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '999px',
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                animation: 'hintBounce 2s ease-in-out infinite',
                userSelect: 'none',
                letterSpacing: '0.03em',
              }}
            >
              <Volume2 size={14} />
              Tap for sound
            </div>
          )}

          {/* Mute / Unmute button — only shown in native video mode */}
          {mode === 'video' && (
            <button
              className="reel-mute-btn"
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              title={isMuted ? 'Sound off — click to unmute' : 'Sound on — click to mute'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
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

        {/* Prev / Next controls */}
        <div className="reel-controls">
          <button
            className={`reel-ctrl-btn ${current === 0 ? 'reel-ctrl-btn--disabled' : ''}`}
            onClick={goPrev}
            disabled={current === 0}
          >
            ← Previous
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
    return <ReelEmpty error="Reels folder not configured yet. Please add VITE_GOOGLE_DRIVE_REELS_FOLDER_ID to your .env file." />;
  }
  if (loading) return <ReelSkeleton />;
  if (error) return <ReelEmpty error={`Could not load reels: ${error}`} />;
  if (reelList.length === 0) return <ReelEmpty />;

  return <ReelViewer reelList={reelList} />;
};

export default ReelSwipe;
