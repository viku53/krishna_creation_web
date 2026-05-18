import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Video, Play, X, ChevronLeft, ChevronRight, CloudOff, Loader2 } from 'lucide-react';
import { useDriveVideos } from './useDriveVideos';
import type { DriveVideoItem } from './useDriveVideos';

const VIDEOS_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_VIDEOS_FOLDER_ID as string;

// ── Categories ────────────────────────────────────────────────────────────────
const categories = ['Wedding', 'Pre-Wedding'] as const;
type Category = (typeof categories)[number];

function categorize(name: string): Category {
  const lower = name.toLowerCase();
  if (lower.includes('prewedding') || lower.includes('pre-wedding') || lower.includes('pre wedding')) {
    return 'Pre-Wedding';
  }
  return 'Wedding';
}

// ── Drive Video Modal ─────────────────────────────────────────────────────────
interface VideoModalProps {
  video: DriveVideoItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, onClose, onPrev, onNext }) => {
  if (!video) return null;

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="media-modal-backdrop"
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{ position: 'relative', width: '95vw', maxWidth: 900, aspectRatio: '16/9', background: '#000', borderRadius: 12, overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.8)' }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 10,
            background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
            width: 36, height: 36, cursor: 'pointer', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Prev */}
        {onPrev && (
          <button
            onClick={onPrev}
            style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
              background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
              width: 40, height: 40, cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Previous"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Next */}
        {onNext && (
          <button
            onClick={onNext}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
              background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
              width: 40, height: 40, cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Next"
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* Google Drive Player */}
        <iframe
          key={video.id}
          src={video.embedUrl}
          title={video.caption}
          allow="autoplay; fullscreen"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </div>

      {/* Caption */}
      <div style={{
        position: 'fixed', bottom: 24, left: 0, right: 0, textAlign: 'center',
        color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', pointerEvents: 'none',
      }}>
        {video.caption}
      </div>
    </div>
  );
};

// ── Video Card ─────────────────────────────────────────────────────────────────
interface VideoCardProps {
  video: DriveVideoItem & { category: Category };
  onClick: () => void;
  index: number;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick, index }) => {
  const [thumbError, setThumbError] = useState(false);

  return (
    <div
      className="video-card"
      onClick={onClick}
      tabIndex={0}
      aria-label={`Play ${video.caption}`}
      onKeyDown={e => { if (e.key === 'Enter') onClick(); }}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Thumbnail */}
      <div className="video-thumb">
        {!thumbError ? (
          <img
            src={video.thumbnailUrl}
            alt={video.caption}
            className="video-thumb-img"
            loading="lazy"
            onError={() => setThumbError(true)}
          />
        ) : (
          <div className="video-thumb-placeholder">
            <Video size={40} strokeWidth={1} />
          </div>
        )}
        <div className="video-play-overlay">
          <div className="video-play-btn">
            <Play size={28} fill="white" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="video-card-info">
        <span className="video-category-tag">{video.category}</span>
        <h3 className="video-card-title">{video.caption}</h3>
      </div>
    </div>
  );
};

// ── Skeleton loader ────────────────────────────────────────────────────────────
const VideosSkeleton: React.FC = () => (
  <div className="videos-page">
    <div className="page-hero page-hero--dark">
      <div className="page-hero-icon"><Video size={32} strokeWidth={1.5} /></div>
      <h1 className="page-hero-title">Videography Portfolio</h1>
      <p className="page-hero-sub">Cinematic wedding films that capture every emotion, beautifully.</p>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'rgba(255,255,255,0.6)', flexDirection: 'column', gap: 12 }}>
      <Loader2 size={40} className="gd-spinner" />
      <p style={{ fontSize: '0.9rem' }}>Loading videos from Google Drive…</p>
    </div>
  </div>
);

// ── Empty / Error state ────────────────────────────────────────────────────────
const VideosEmpty: React.FC<{ error?: string | null }> = ({ error }) => (
  <div className="videos-page">
    <div className="page-hero page-hero--dark">
      <div className="page-hero-icon"><Video size={32} strokeWidth={1.5} /></div>
      <h1 className="page-hero-title">Videography Portfolio</h1>
      <p className="page-hero-sub">Cinematic wedding films that capture every emotion, beautifully.</p>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'rgba(255,255,255,0.5)', flexDirection: 'column', gap: 16, padding: '2rem' }}>
      <CloudOff size={48} />
      <p style={{ textAlign: 'center', maxWidth: 320, lineHeight: 1.6, fontSize: '0.9rem' }}>
        {error ?? 'No videos available yet. Check back soon!'}
      </p>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const Videos: React.FC = () => {
  const { videos: rawVideos, loading, error } = useDriveVideos(VIDEOS_FOLDER_ID);

  const [selected, setSelected] = useState<'All' | Category>('All');
  const [modalIdx, setModalIdx] = useState<number | null>(null);

  // Attach category to each video
  const videos = useMemo(
    () => rawVideos.map(v => ({ ...v, category: categorize(v.name) as Category })),
    [rawVideos]
  );

  const filtered = useMemo(() => {
    if (selected === 'All') return videos;
    return videos.filter(v => v.category === selected);
  }, [selected, videos]);

  const openModal = (idx: number) => setModalIdx(idx);
  const closeModal = () => setModalIdx(null);
  const prevModal = () => setModalIdx(i => (i !== null && i > 0 ? i - 1 : i));
  const nextModal = () => setModalIdx(i => (i !== null && i < filtered.length - 1 ? i + 1 : i));

  if (!VIDEOS_FOLDER_ID) {
    return <VideosEmpty error="Videos folder not configured yet. Please add VITE_GOOGLE_DRIVE_VIDEOS_FOLDER_ID to your .env file." />;
  }

  if (loading) return <VideosSkeleton />;
  if (error) return <VideosEmpty error={`Could not load videos: ${error}`} />;
  if (videos.length === 0) return <VideosEmpty />;

  return (
    <div className="videos-page">
      <Helmet>
        <title>Videography Portfolio – Cinematic Wedding Films | Krishna Creation</title>
        <meta name="description" content="Watch Krishna Creation's cinematic videography portfolio – full-length wedding films, pre-wedding videos & event coverage in Mumbai. Experience moving stories crafted into visual masterpieces." />
        <link rel="canonical" href="https://krishnacreationphotography.com/videos" />
        <meta property="og:url" content="https://krishnacreationphotography.com/videos" />
        <meta property="og:title" content="Videography Portfolio | Krishna Creation" />
        <meta property="og:description" content="Cinematic wedding films & event videography by Krishna Creation, Mumbai." />
        <meta property="og:image" content="https://krishnacreationphotography.com/logo.png" />
      </Helmet>

      {/* Page Hero */}
      <div className="page-hero page-hero--dark">
        <div className="page-hero-icon"><Video size={32} strokeWidth={1.5} /></div>
        <h1 className="page-hero-title">Videography Portfolio</h1>
        <p className="page-hero-sub">
          Cinematic wedding films that capture every emotion, beautifully.
          Experience the moving stories, grand celebrations, and intimate moments crafted into visual masterpieces.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar filter-bar--dark">
        <button
          onClick={() => setSelected('All')}
          className={`filter-pill filter-pill--dark ${selected === 'All' ? 'filter-pill--active-dark' : ''}`}
        >
          All ({videos.length})
        </button>
        {categories.map(cat => {
          const count = videos.filter(v => v.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className={`filter-pill filter-pill--dark ${selected === cat ? 'filter-pill--active-dark' : ''}`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Video Grid */}
      <div className="videos-grid">
        {filtered.map((video, idx) => (
          <VideoCard
            key={video.id}
            video={video}
            onClick={() => openModal(idx)}
            index={idx}
          />
        ))}
      </div>

      {/* Empty filter state */}
      {filtered.length === 0 && (
        <div className="photos-all-loaded" style={{ textAlign: 'center', padding: '3rem' }}>
          No videos found in this category
        </div>
      )}

      {/* Modal */}
      <VideoModal
        video={modalIdx !== null ? filtered[modalIdx] : null}
        onClose={closeModal}
        onPrev={modalIdx !== null && modalIdx > 0 ? prevModal : undefined}
        onNext={modalIdx !== null && modalIdx < filtered.length - 1 ? nextModal : undefined}
      />
    </div>
  );
};

export default Videos;
