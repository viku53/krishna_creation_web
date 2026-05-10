import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import MediaModal from './MediaModal';
import { useMediaModal } from './useMediaModal';
import { Video, Play, Clock } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface VideoItem {
  id: number;
  url: string;
  title: string;
  category: string;
  duration?: string;
  thumb?: string;
}

// ─── Categories derived from filenames ────────────────────────────────────────
const categories = ['Wedding', 'Pre-Wedding'] as const;
type Category = (typeof categories)[number];

// ─── Build video list from public/videos ──────────────────────────────────────
function categorize(filename: string): Category {
  const lower = filename.toLowerCase();
  if (lower.includes('prewedding') || lower.includes('pre-wedding') || lower.includes('pre wedding')) {
    return 'Pre-Wedding';
  }
  return 'Wedding';
}

function titleFromFilename(filename: string): string {
  // Remove extension, clean up
  return filename
    .replace(/\.(mp4|mov|avi|webm|mkv)$/i, '')
    .replace(/[_-]/g, ' ')
    .trim();
}

const videoFiles = [
  { file: 'Wedding Highlight.mp4', duration: '11:08', thumb: '/photos/Wedding/09.webp' },
  { file: 'Wedding Teaser.mp4', duration: '2:26', thumb: '/photos/Wedding/05.webp' },
  { file: 'Bhakti & Kashyap Prewedding Highlight.mp4', duration: '8:57', thumb: '/photos/Pre Wedding/015.webp' },
  { file: 'Navin & Ayushi Prewedding .mp4', duration: '9:11', thumb: '/photos/Pre Wedding/03.webp' },
  { file: 'Navin & Ayushi Prewedding Teaser New.mp4', duration: '2:09', thumb: '/photos/Pre Wedding/06.webp' },
  { file: 'Teaser Bhakti & Kashyap .mp4', duration: '3:12', thumb: '/photos/Wedding/01.webp' },
];

const allVideos: VideoItem[] = videoFiles.map((v, i) => ({
  id: i + 1,
  url: `/videos/${v.file}`,
  title: titleFromFilename(v.file),
  category: categorize(v.file),
  duration: v.duration,
  thumb: v.thumb,
}));

// ─── Shuffle ──────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Component ────────────────────────────────────────────────────────────────
const Videos: React.FC = () => {
  const [selected, setSelected] = useState<'All' | Category>('All');

  const shuffled = useMemo(() => shuffle(allVideos), []);

  const filteredVideos = useMemo(() => {
    if (selected === 'All') return shuffled;
    return shuffled.filter(v => v.category === selected);
  }, [selected, shuffled]);

  const { modalOpen, openModal, closeModal, prevModal, nextModal, modalItem, hasPrev, hasNext } = useMediaModal(filteredVideos);

  return (
    <div className="videos-page">
      <Helmet>
        <title>Video Productions | Krishna Creation</title>
        <meta name="description" content="Cinematic wedding films that capture every emotion, beautifully. Experience moving stories and grand celebrations crafted into visual masterpieces." />
      </Helmet>

      {/* ── Page Hero ──────────────────────────────────────────── */}
      <div className="page-hero page-hero--dark">
        <div className="page-hero-icon"><Video size={32} strokeWidth={1.5} /></div>
        <h1 className="page-hero-title">Videography Portfolio</h1>
        <p className="page-hero-sub">
          Cinematic wedding films that capture every emotion, beautifully.
          Experience the moving stories, grand celebrations, and intimate moments crafted into visual masterpieces.
        </p>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────── */}
      <div className="filter-bar filter-bar--dark">
        <button
          onClick={() => setSelected('All')}
          className={`filter-pill filter-pill--dark ${selected === 'All' ? 'filter-pill--active-dark' : ''}`}
        >
          All ({shuffled.length})
        </button>
        {categories.map(cat => {
          const count = shuffled.filter(v => v.category === cat).length;
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

      {/* ── Video Grid ─────────────────────────────────────────── */}
      <div className="videos-grid">
        {filteredVideos.map((video, idx) => (
          <div
            key={video.id}
            className="video-card"
            onClick={() => openModal(idx)}
            tabIndex={0}
            aria-label={`Play ${video.title}`}
            onKeyDown={e => { if (e.key === 'Enter') openModal(idx); }}
          >
            {/* Thumbnail */}
            <div className="video-thumb">
              {video.thumb
                ? <img src={video.thumb} alt={video.title} className="video-thumb-img" />
                : <div className="video-thumb-placeholder"><Video size={40} strokeWidth={1} /></div>
              }
              <div className="video-play-overlay">
                <div className="video-play-btn">
                  <Play size={28} fill="white" />
                </div>
              </div>
              {video.duration && (
                <div className="video-duration">
                  <Clock size={11} />
                  {video.duration}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="video-card-info">
              <span className="video-category-tag">{video.category}</span>
              <h3 className="video-card-title">{video.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredVideos.length === 0 && (
        <div className="photos-all-loaded" style={{ textAlign: 'center', padding: '3rem' }}>
          No videos found in this category
        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────────── */}
      <MediaModal
        open={modalOpen}
        src={modalItem?.url}
        type="video"
        onClose={closeModal}
        onPrev={hasPrev ? prevModal : undefined}
        onNext={hasNext ? nextModal : undefined}
        caption={modalItem?.title}
      />
    </div>
  );
};

export default Videos;
