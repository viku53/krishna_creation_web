/**
 * recompress-webp.mjs
 * Re-compresses all WebP images in public/photos/ in-place using Sharp.
 *
 * Strategy:
 *  - Quality 75 (visually identical on screens, ~60-80% smaller vs quality 90+)
 *  - Max width / height capped at 1920px (landscape) or 1440px (portrait)
 *  - Effort 6 (best compression ratio without being extremely slow)
 *  - Skips files already under 200 KB (already optimised)
 *
 * Usage:  node scripts/recompress-webp.mjs
 */

import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PHOTOS_DIR = join(ROOT, 'public', 'photos');

const QUALITY = 75;          // WebP quality (0-100). 75 is the sweet spot for photography
const MAX_LONG_EDGE = 1920;  // Longest edge cap in pixels
const SKIP_BELOW_KB = 200;   // Files already under this size are skipped

// ── Helper: collect all .webp files recursively ───────────────────────────────
async function* walkWebp(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkWebp(full);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.webp')) {
      yield full;
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
let processed = 0, skipped = 0, saved = 0;

console.log('🔍 Scanning', PHOTOS_DIR);
console.log(`   Quality: ${QUALITY}  |  Max edge: ${MAX_LONG_EDGE}px  |  Skip below: ${SKIP_BELOW_KB} KB\n`);

for await (const filePath of walkWebp(PHOTOS_DIR)) {
  const rel = relative(ROOT, filePath);
  const { size: originalSize } = await stat(filePath);
  const originalKb = originalSize / 1024;

  if (originalKb < SKIP_BELOW_KB) {
    skipped++;
    continue;
  }

  try {
    const img = sharp(filePath);
    const meta = await img.metadata();
    const { width = 0, height = 0 } = meta;

    // Resize only if the image exceeds the cap
    const needsResize = width > MAX_LONG_EDGE || height > MAX_LONG_EDGE;
    const pipeline = needsResize
      ? img.resize(MAX_LONG_EDGE, MAX_LONG_EDGE, { fit: 'inside', withoutEnlargement: true })
      : img;

    // Re-encode to WebP
    const buffer = await pipeline
      .webp({ quality: QUALITY, effort: 6, smartSubsample: true })
      .toBuffer();

    const newKb = buffer.length / 1024;
    const savedKb = originalKb - newKb;

    if (savedKb > 0) {
      // Only write if we actually made it smaller
      await sharp(buffer).toFile(filePath);
      saved += savedKb;
      processed++;
      console.log(
        `  ✅  ${rel.padEnd(70)} ${(originalKb / 1024).toFixed(1)} MB → ${(newKb / 1024).toFixed(1)} MB  (-${Math.round((savedKb / originalKb) * 100)}%)`
      );
    } else {
      skipped++;
      console.log(`  ⏭   ${rel.padEnd(70)} already optimal (${(originalKb / 1024).toFixed(1)} MB)`);
    }
  } catch (err) {
    console.error(`  ❌  ${rel} — ${err.message}`);
  }
}

console.log(`
────────────────────────────────────────
  Processed : ${processed} files
  Skipped   : ${skipped} files
  Space saved: ${(saved / 1024).toFixed(1)} MB
────────────────────────────────────────`);
