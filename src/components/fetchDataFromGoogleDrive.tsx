import React, { useEffect, useState, useRef, useCallback } from 'react';
import { cacheGet, cacheSet } from '../lib/localCache';

const FOLDER_ID = '1WFTV04WsMj09Ptx-p0O7TJ87iZJE5f3U';
const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY as string;

const CACHE_KEY = 'kc_drive_photos_main';

const BATCH_SIZE = 6; // How many images to reveal per batch

interface DrivePhoto {
  id: string;
  url: string;
  name: string;
  loaded: boolean;
}

// ── Cache the API response so we only call it once per session ────────────────
let cachedPhotos: DrivePhoto[] | null = null;

const getDrivePhotos = async (): Promise<DrivePhoto[]> => {
  // 1️⃣ Return in-memory cache (same session)
  if (cachedPhotos) return cachedPhotos;

  // 2️⃣ Return localStorage cache (across sessions, 2-month TTL)
  const stored = cacheGet<DrivePhoto[]>(CACHE_KEY);
  if (stored) {
    cachedPhotos = stored;
    return stored;
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType='image/jpeg'&key=${API_KEY}&fields=files(id,name)&pageSize=100`
    );
    const data = await res.json();

    if (data.error) {
      console.error('Google Drive API error:', data.error.message);
      return [];
    }

    if (!data.files) return [];

    cachedPhotos = data.files.map((file: { id: string; name: string }) => ({
      id: file.id,
      url: `https://lh3.googleusercontent.com/d/${file.id}=w800`,
      name: file.name,
      loaded: false,
    }));

    // 3️⃣ Persist to localStorage for 2 months
    cacheSet(CACHE_KEY, cachedPhotos);

    return cachedPhotos || [];
  } catch (err) {
    console.error('Failed to fetch Google Drive photos:', err);
    return [];
  }
};

// ── Lazy image component — only loads src when scrolled into view ─────────────
const LazyImage: React.FC<{
  src: string;
  alt: string;
  delay: number;
}> = ({ src, alt, delay }) => {
  const imgRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger loading with a small delay to avoid burst requests
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { rootMargin: '200px' } // Start loading 200px before it scrolls into view
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={imgRef} className="photo-card gd-photo-card">
      {isVisible ? (
        <>
          <img
            src={src}
            alt={alt}
            className={`photo-card-img gd-img ${isLoaded ? 'gd-img--loaded' : ''}`}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onError={(e) => {
              // Hide broken images
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {!isLoaded && <div className="gd-img-skeleton" />}
        </>
      ) : (
        <div className="gd-img-skeleton" />
      )}
      <div className="photo-card-overlay">
        <div className="photo-card-zoom">⊕</div>
      </div>
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
const GdPhotos: React.FC = () => {
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDrivePhotos()
      .then((data) => {
        setPhotos(data);
        setError(null);
      })
      .catch(() => setError('Failed to load photos from Google Drive'))
      .finally(() => setLoading(false));
  }, []);

  // ── Infinite scroll: load more when sentinel enters viewport ───────────
  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + BATCH_SIZE, photos.length));
  }, [photos.length]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || visibleCount >= photos.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: '300px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, photos.length, loadMore]);

  if (!loading && photos.length === 0 && !error) return null;

  const visiblePhotos = photos.slice(0, visibleCount);

  return (
    <div className="gd-photos-section">
      {/* Section header */}
      {photos.length > 0 && (
        <div className="gd-header">
          <h3 className="gd-title">More from Google Drive</h3>
          <span className="gd-count">{photos.length} photos</span>
        </div>
      )}

      {loading && (
        <div className="gd-loading">
          <div className="gd-spinner" />
          Loading photos from Google Drive...
        </div>
      )}

      {error && <div className="gd-error">{error}</div>}

      {visiblePhotos.length > 0 && (
        <div className="photos-grid">
          {visiblePhotos.map((photo, idx) => (
            <LazyImage
              key={photo.id}
              src={photo.url}
              alt={photo.name}
              delay={(idx % BATCH_SIZE) * 150} // Stagger within each batch
            />
          ))}
        </div>
      )}

      {/* Sentinel for infinite scroll */}
      {visibleCount < photos.length && (
        <div ref={loadMoreRef} className="gd-load-more">
          <div className="gd-spinner" />
          Loading more...
        </div>
      )}
    </div>
  );
};

export default GdPhotos;