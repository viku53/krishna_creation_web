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
  /** Direct stream URL — may hit redirect for large files */
  streamUrl: string;
}

function titleFromFilename(name: string): string {
  return name
    .replace(/\.(mp4|mov|avi|webm|mkv|m4v)$/i, '')
    .replace(/[_-]/g, ' ')
    .trim();
}

// ── Cache key per folder ──────────────────────────────────────────────────────
const cacheKey = (folderId: string) => `kc_drive_videos_${folderId}`;

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
    `&fields=files(id,name,mimeType)` +
    `&pageSize=100` +
    `&orderBy=name`;

  inFlight[folderId] = fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.error) throw new Error(data.error.message || 'Google Drive API error');
      if (!data.files || data.files.length === 0) return [];

      const items: DriveVideoItem[] = data.files.map(
        (file: { id: string; name: string }) => ({
          id: file.id,
          name: file.name,
          caption: titleFromFilename(file.name),
          // preview URL — Google's player picks the highest available quality
          embedUrl: `https://drive.google.com/file/d/${file.id}/preview`,
          // High-res thumbnail: w1920 gives sharp cards even on retina displays
          thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1920`,
          streamUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
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
