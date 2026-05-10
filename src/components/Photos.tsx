import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import MediaModal from './MediaModal';
import { useMediaModal } from './useMediaModal';
import { Camera } from 'lucide-react';

// ─── Categories ───────────────────────────────────────────────────────────────
const categories = ['Wedding', 'Haldi', 'Sangeet', 'Pre-Wedding', 'Engagement'] as const;
type Category = (typeof categories)[number];

// ─── Build photo list from public/photos ──────────────────────────────────────
interface PhotoItem {
  id: number;
  url: string;
  category: Category | 'General';
}

function buildPhotoList(): PhotoItem[] {
  const photos: PhotoItem[] = [];
  let id = 1;

  // Root-level photos (General)
  const rootFiles = [
    '01.webp', '02.webp', '03.webp', '04.webp', '05.webp', '06.webp', '07.webp',
    '08.webp', '09.webp', '10.webp', '12.webp', '13.webp', '14.webp',
  ];
  for (const f of rootFiles) {
    photos.push({ id: id++, url: `/photos/${f}`, category: 'General' });
  }

  // Wedding (83 files)
  const weddingNumbered = Array.from({ length: 49 }, (_, i) => {
    const n = String(i + 1).padStart(2, '0');
    return `${n}.webp`;
  });
  const weddingDSC = [
    '0C8A7299.webp', '0C8A7303.webp', '0C8A7321.webp', '0C8A7348.webp',
    '0C8A7358.webp', '0C8A7380.webp', '0C8A7381.webp', '0C8A7383.webp',
    '0C8A7451.webp', '0C8A7462.webp', '0C8A7463.webp', '0C8A7504.webp',
    '0C8A7515.webp', '0C8A7631.webp', '0C8A7683.webp', '0C8A7695.webp',
    '0C8A7830.webp', '0C8A7949.webp', '0C8A8082.webp', '0C8A8120.webp',
    '0C8A8199.webp', '0C8A8309.webp', '0C8A8332.webp', '0C8A8402.webp',
    '0C8A8412.webp', '0C8A8462.webp', '0C8A8491.webp', '0C8A8502.webp',
    '0C8A8574.webp',
    'DSC_0875.webp', 'DSC_0883.webp', 'DSC_0887.webp', 'DSC_0894.webp', 'DSC_1292.webp',
  ];
  for (const f of [...weddingNumbered, ...weddingDSC]) {
    photos.push({ id: id++, url: `/photos/Wedding/${f}`, category: 'Wedding' });
  }

  // Haldi (13 files)
  const haldiFiles = [
    '01.webp', '02.webp', '03.webp', '04.webp', '05.webp', '06.webp', '07.webp',
    '08.webp', '09.webp', '10.webp', '12.webp', '13.webp', '14.webp',
  ];
  for (const f of haldiFiles) {
    photos.push({ id: id++, url: `/photos/Haldi/${f}`, category: 'Haldi' });
  }

  // Sangeet (4 files)
  const sangeetFiles = ['01.webp', '02.webp', '03.webp', '04.webp'];
  for (const f of sangeetFiles) {
    photos.push({ id: id++, url: `/photos/Sangeet/${f}`, category: 'Sangeet' });
  }

  // Pre Wedding (55 files from "Pre Wedding" folder)
  const preWeddingFiles = [
    '001.webp', '002.webp', '003.webp', '004.webp', '005.webp', '006.webp', '007.webp',
    '008.webp', '009.webp', '01.webp', '010.webp', '011.webp', '012.webp', '013.webp',
    '014.webp', '015.webp', '016.webp', '017.webp', '018.webp', '019.webp', '02.webp',
    '020.webp', '021.webp', '022.webp', '023.webp', '024.webp', '025.webp', '026.webp',
    '03.webp', '04.webp', '05.webp', '06.webp', '07.webp', '08.webp', '09.webp',
    '10.webp', '11.webp', '12.webp', '13.webp', '14.webp', '16.webp', '17.webp',
    '18.webp', '19.webp', '20.webp', '21.webp', '22.webp', '23.webp', '24.webp',
    '25.webp', '27.webp', '28.webp', '29.webp', '30.webp', '31.webp',
  ];
  for (const f of preWeddingFiles) {
    photos.push({ id: id++, url: `/photos/Pre Wedding/${f}`, category: 'Pre-Wedding' });
  }

  // Engagement (9 files)
  const engagementFiles = [
    '01.webp', '02.webp', '03.webp', '04.webp', '05.webp', '06.webp', '07.webp',
    '08.webp', '09.webp',
  ];
  for (const f of engagementFiles) {
    photos.push({ id: id++, url: `/photos/Engagment/${f}`, category: 'Engagement' });
  }

  return photos;
}

const ALL_PHOTOS = buildPhotoList();

// ─── Fisher-Yates shuffle (seeded per session) ───────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const INITIAL_BATCH = 20;
const LOAD_MORE_BATCH = 12;

// ─── Component ────────────────────────────────────────────────────────────────
const Photos: React.FC = () => {
  const [selected, setSelected] = useState<'All' | Category>('All');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [prevCount, setPrevCount] = useState(0);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const lastScrollY = React.useRef(0);

  // Shuffle once per mount, then filter
  const shuffled = useMemo(() => shuffle(ALL_PHOTOS), []);

  const filteredPhotos = useMemo(() => {
    if (selected === 'All') return shuffled;
    return shuffled.filter(p => p.category === selected);
  }, [selected, shuffled]);

  // Reset visible count when category changes
  React.useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
    setPrevCount(0);
  }, [selected]);

  // The photos actually shown on screen
  const visiblePhotos = useMemo(
    () => filteredPhotos.slice(0, visibleCount),
    [filteredPhotos, visibleCount]
  );
  const hasMore = visibleCount < filteredPhotos.length;

  // Track scroll direction
  React.useEffect(() => {
    const onScroll = () => { lastScrollY.current = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ─── IntersectionObserver for infinite scroll (DOWN only) ──────
  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    let prevY = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Only load more when scrolling DOWN and sentinel is visible
        const isScrollingDown = entry.boundingClientRect.y < prevY;
        prevY = entry.boundingClientRect.y;

        if (entry.isIntersecting && isScrollingDown && hasMore) {
          // Small delay for smooth feel
          setTimeout(() => {
            setPrevCount(visibleCount);
            setVisibleCount(prev => Math.min(prev + LOAD_MORE_BATCH, filteredPhotos.length));
          }, 150);
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, filteredPhotos.length, visibleCount]);

  const { modalOpen, openModal, closeModal, prevModal, nextModal, modalItem, hasPrev, hasNext } = useMediaModal(filteredPhotos);

  return (
    <div className="photos-page dark-theme pb-4">
      <Helmet>
        <title>Photography Portfolio | Krishna Creation</title>
        <meta name="description" content="Explore our collection of timeless captures that define the essence of your special day. Premium photography portfolio by Nikunj Sindhwad." />
      </Helmet>

      {/* ── Page Hero ──────────────────────────────────────────── */}
      <div className="page-hero page-hero--dark">
        <div className="page-hero-icon"><Camera size={32} strokeWidth={1.5} /></div>
        <h1 className="page-hero-title">Photography Portfolio</h1>
        <p className="page-hero-sub">
          Every frame tells a story. From candid moments of pure joy to breathtaking portraits,
          explore our collection of timeless captures that define the essence of your special day.
        </p>
      </div>

      {/* ── Category Filter ────────────────────────────────────── */}
      <div className="filter-bar filter-bar--dark">
        <button
          onClick={() => setSelected('All')}
          className={`filter-pill filter-pill--dark ${selected === 'All' ? 'filter-pill--active-dark' : ''}`}
        >
          All ({shuffled.length})
        </button>
        {categories.map(cat => {
          const count = shuffled.filter(p => p.category === cat).length;
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

      {/* ── Photo count ────────────────────────────────────────── */}
      <div className="photos-count">
        Showing {visiblePhotos.length} of {filteredPhotos.length} photos
      </div>

      {/* ── Photo Grid ─────────────────────────────────────────── */}
      <div className="photos-grid">
        {visiblePhotos.map((photo, idx) => (
          <div
            key={photo.id}
            className={`photo-card ${hoveredIdx === idx ? 'photo-card--hovered' : ''} ${idx >= prevCount ? 'photo-card--new' : ''}`}
            style={idx >= prevCount ? { animationDelay: `${(idx - prevCount) * 60}ms` } : undefined}
            onClick={() => openModal(idx)}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            tabIndex={0}
            aria-label={`View photo ${idx + 1}`}
            onKeyDown={e => { if (e.key === 'Enter') openModal(idx); }}
          >
            <img
              src={photo.url}
              alt={`${photo.category} photo`}
              className="photo-card-img"
              loading={idx < 8 ? "eager" : "lazy"}
              decoding="async"
            />
            <div className="photo-card-overlay">
              <div className="photo-card-zoom">⊕</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Scroll sentinel / loading indicator ────────────────── */}
      <div ref={sentinelRef} className="photos-sentinel mb-3">
        {hasMore ? (
          <div className="photos-loader">
            <div className="photos-loader-spinner" />
            <span>Loading more photos...</span>
          </div>
        ) : (
          <div className="photos-all-loaded">
            ✨ You've seen all {filteredPhotos.length} photos
          </div>
        )}
      </div>

      {/* ── Modal ──────────────────────────────────────────────── */}
      <MediaModal
        open={modalOpen}
        src={modalItem?.url}
        type="image"
        onClose={closeModal}
        onPrev={hasPrev ? prevModal : undefined}
        onNext={hasNext ? nextModal : undefined}
        caption={undefined}
      />
    </div>
  );
};

export default Photos;


