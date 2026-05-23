import { useEffect, useState } from 'react';
import { cacheGet, cacheSet } from '../lib/localCache';

const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY as string;

export interface DriveVideoItem {
  id: string;
  name: string;
  caption: string;
  /** Embed in <iframe> — works for any file size, no download warning */
  embedUrl: string;
  /** Thumbnail from Drive */
  thumbnailUrl: string;
  /** Direct stream URL via uc?export=download — works for public files up to ~100 MB */
  streamUrl: string;
  /** Duration in milliseconds from Drive videoMediaMetadata (may be undefined) */
  duration?: number;
}

function titleFromFilename(name: string): string {
  return name
    .replace(/\.(mp4|mov|avi|webm|mkv|m4v)$/i, '')
    .replace(/[_-]/g, ' ')
    .trim();
}

// ── Cache key per folder (v6 = API v3 alt=media as primary streamUrl) ──────────
const cacheKey = (folderId: string) => `kc_drive_videos_v6_${folderId}`;

// ── In-memory dedup (so parallel mounts share one in-flight request) ──────────
const inFlight: Record<string, Promise<DriveVideoItem[]> | undefined> = {};

async function fetchDriveVideos(folderId: string): Promise<DriveVideoItem[]> {
  // 1️⃣ Check localStorage cache first (2-month TTL)
  const cached = cacheGet<DriveVideoItem[]>(cacheKey(folderId));
  if (cached) return cached;

  // 2️⃣ Deduplicate concurrent fetches for the same folder
  if (inFlight[folderId]) return inFlight[folderId];

  const query = encodeURIComponent(
    `'${folderId}' in parents and trashed = false and (mimeType contains 'video/' or name contains '.mp4' or name contains '.mov' or name contains '.MP4')`
  );

  const url =
    `https://www.googleapis.com/drive/v3/files` +
    `?q=${query}` +
    `&key=${API_KEY}` +
    `&fields=files(id,name,mimeType,videoMediaMetadata(durationMillis,width,height))` +
    `&pageSize=100` +
    `&orderBy=name`;

  inFlight[folderId] = fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.error) throw new Error(data.error.message || 'Google Drive API error');
      if (!data.files || data.files.length === 0) return [];

      const items: DriveVideoItem[] = data.files.map(
        (file: { id: string; name: string; videoMediaMetadata?: { durationMillis?: string } }) => ({
          id: file.id,
          name: file.name,
          caption: titleFromFilename(file.name),
          // preview URL — used as iframe fallback
          embedUrl: `https://drive.google.com/file/d/${file.id}/preview`,
          // Thumbnail — sz=w400 is reliably served for public files
          // (sz=w1920 can be blocked or return 403 for large dimension requests)
          thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`,
          // PRIMARY: Drive API v3 alt=media
          // - Confirmed working for up to 200MB+ files (tested)
          // - No virus-scan warning page
          // - Proper HTTP byte-range support (required for Safari/iOS)
          // - Requires the file to be shared as "Anyone with the link can view"
          // - Requires API key to be unrestricted OR allow the production domain
          // If this 403s (e.g. API key domain restriction), Reels.tsx auto-falls
          // back to the iframe embed which always works.
          streamUrl: `https://www.googleapis.com/drive/v3/files/${file.id}?key=${API_KEY}&alt=media`,
          // Drive returns durationMillis as a string
          duration: file.videoMediaMetadata?.durationMillis
            ? Number(file.videoMediaMetadata.durationMillis)
            : undefined,
        })
      );

      // 3️⃣ Persist to localStorage for 2 months
      cacheSet(cacheKey(folderId), items);
      return items;
    })
    .finally(() => {
      delete inFlight[folderId];
    });

  return inFlight[folderId];
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useDriveVideos(folderId: string | undefined) {
  const [videos, setVideos] = useState<DriveVideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!folderId || folderId.trim() === '') {
      setVideos([]);
      setLoading(false);
      return;
    }

    // Show cached data instantly while still showing loading = false
    const cached = cacheGet<DriveVideoItem[]>(cacheKey(folderId));
    if (cached) {
      setVideos(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchDriveVideos(folderId)
      .then(setVideos)
      .catch(err => setError(err.message ?? 'Failed to load videos'))
      .finally(() => setLoading(false));
  }, [folderId]);

  return { videos, loading, error };
}
