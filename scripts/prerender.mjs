import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const ssrDir = path.join(rootDir, 'dist-ssr');

const ROUTES = [
  '/',
  '/instant-printing',
  '/instant-printing/custom-photo-mugs',
  '/instant-printing/magic-mugs',
  '/instant-printing/photo-frames',
  '/instant-printing/custom-keychains',
  '/instant-printing/photo-print-packs',
  '/instant-printing/gift-combos',
  '/photos',
  '/videos',
  '/reels',
  '/contact',
  '/track-order',
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Merge route-level react-helmet-async tags into the base index.html <head>,
 * replacing matching fallback tags so crawlers never see duplicate titles/descriptions/canonicals.
 */
function injectHeadTags(html, head) {
  let result = html;
  const toInject = [];

  if (head.title && head.title.trim()) {
    result = result.replace(/<title>[\s\S]*?<\/title>\s*/i, '');
    toInject.push(head.title.trim());
  }

  if (head.meta && head.meta.trim()) {
    const metaTags = head.meta.match(/<meta\b[^>]*>/gi) ?? [];
    for (const tag of metaTags) {
      const nameMatch = tag.match(/\bname=["']([^"']+)["']/i);
      const propMatch = tag.match(/\bproperty=["']([^"']+)["']/i);
      if (nameMatch) {
        const attrRegex = new RegExp(
          `<meta\\b[^>]*\\bname=["']${escapeRegex(nameMatch[1])}["'][^>]*>\\s*`,
          'gi'
        );
        result = result.replace(attrRegex, '');
      }
      if (propMatch) {
        const propRegex = new RegExp(
          `<meta\\b[^>]*\\bproperty=["']${escapeRegex(propMatch[1])}["'][^>]*>\\s*`,
          'gi'
        );
        result = result.replace(propRegex, '');
      }
      toInject.push(tag);
    }
  }

  if (head.link && head.link.trim()) {
    const linkTags = head.link.match(/<link\b[^>]*>/gi) ?? [];
    for (const tag of linkTags) {
      const relMatch = tag.match(/\brel=["']([^"']+)["']/i);
      if (relMatch && relMatch[1].toLowerCase() === 'canonical') {
        result = result.replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>\s*/gi, '');
      }
      toInject.push(tag);
    }
  }

  if (head.script && head.script.trim()) {
    toInject.push(head.script.trim());
  }

  if (toInject.length > 0) {
    result = result.replace('</head>', `  ${toInject.join('\n  ')}\n</head>`);
  }

  return result;
}

async function run() {
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Missing client build template at ${templatePath}`);
  }
  const template = fs.readFileSync(templatePath, 'utf-8');
  if (!template.includes('<div id="root"></div>')) {
    throw new Error('Could not find <div id="root"></div> mount point in dist/index.html');
  }

  const ssrEntryPath = path.join(ssrDir, 'entry-server.js');
  if (!fs.existsSync(ssrEntryPath)) {
    throw new Error(`Missing SSR bundle at ${ssrEntryPath}`);
  }

  const { render } = await import(pathToFileURL(ssrEntryPath).href);

  for (const route of ROUTES) {
    const { html: appHtml, head } = await render(route);
    if (!appHtml || !appHtml.trim()) {
      throw new Error(`Pre-render produced empty HTML for route "${route}"`);
    }

    let pageHtml = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
    pageHtml = injectHeadTags(pageHtml, head);

    const outPath =
      route === '/'
        ? path.join(distDir, 'index.html')
        : path.join(distDir, route.replace(/^\//, ''), 'index.html');

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, pageHtml, 'utf-8');
    console.log(`[prerender] ${route} -> ${path.relative(rootDir, outPath)}`);
  }

  // Verify /instant-printing generated HTML contains real content (not empty root or spinner fallback)
  const ipHtml = fs.readFileSync(path.join(distDir, 'instant-printing', 'index.html'), 'utf-8');
  if (
    ipHtml.includes('<div id="root"></div>') ||
    ipHtml.includes('aria-label="Loading page"') ||
    !ipHtml.includes('Custom Photo Mugs') ||
    !ipHtml.includes('Popular Gift Combos') ||
    !ipHtml.includes('Live Event Printing Booth')
  ) {
    throw new Error('Pre-rendered /instant-printing/index.html failed content verification');
  }

  // Keep Workbox SW precache revision for index.html aligned with pre-rendered output
  const swPath = path.join(distDir, 'sw.js');
  if (fs.existsSync(swPath)) {
    const newHash = crypto.createHash('md5').update(fs.readFileSync(templatePath)).digest('hex');
    const swContent = fs.readFileSync(swPath, 'utf-8').replace(
      /(url:"index\.html",revision:")[a-f0-9]{32}(")/,
      `$1${newHash}$2`
    );
    fs.writeFileSync(swPath, swContent, 'utf-8');
  }

  fs.rmSync(ssrDir, { recursive: true, force: true });
  console.log('[prerender] Static pre-rendering complete.');
}

run().catch((err) => {
  console.error('[prerender] Failed:', err);
  process.exit(1);
});
