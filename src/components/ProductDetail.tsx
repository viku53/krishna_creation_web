import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, X, Star, ImagePlus, ZoomIn,
  Check, Minus, Plus, Sparkles, PackageCheck,
} from 'lucide-react';
import { products } from './InstantPrinting';
import { useMediaModal } from './useMediaModal';
import MediaModal from './MediaModal';

// ── Mug Themes (loaded from src/assets/mug_themes/) ───────────────────────────
// Vite's import.meta.glob eagerly imports all images from the folder.
const _themeGlob = import.meta.glob(
  '../assets/mug_themes/*.{webp,png,jpg,jpeg,PNG,JPG,JPEG,WEBP}',
  { eager: true }
) as Record<string, { default: string }>;

interface MugTheme { id: string; name: string; url: string }

const MUG_THEMES: MugTheme[] = Object.entries(_themeGlob).map(([path, mod]) => {
  const filename = path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? path;
  const name = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return { id: filename, name, url: mod.default };
});

const MAX_IMAGES_DEFAULT = 3;

// ═══════════════════════════════════════════════════════════════
// 3D INTERACTIVE MUG — CSS POLYGON CYLINDER
// ═══════════════════════════════════════════════════════════════
const N_FACES = 20;
const MUG_R = 90;
const MUG_H = 200;
const PRINT_H = 144;
const PRINT_Y = 28;
const PRINT_N = 15;
const PRINT_OFF = 2;
const DEG = 360 / N_FACES;
const FACE_W = 2 * MUG_R * Math.tan(Math.PI / N_FACES);
const FACE_L = MUG_R - FACE_W / 2;
// Faces used for user photo overlay when theme is selected (left ~1/3)
const USER_PHOTO_FACES = 5;

interface Mug3DViewerProps {
  photoUrls: string[];
  themeUrl?: string;
}

const Mug3DViewer: React.FC<Mug3DViewerProps> = ({ photoUrls, themeUrl }) => {
  const [rotY, setRotY] = useState(-20);
  const [grabbing, setGrabbing] = useState(false);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const vel = useRef(0);
  const rafId = useRef<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const stopRaf = () => {
    if (rafId.current !== null) { cancelAnimationFrame(rafId.current); rafId.current = null; }
  };

  const runInertia = useCallback(() => {
    vel.current *= 0.92;
    if (Math.abs(vel.current) < 0.04) { vel.current = 0; return; }
    setRotY(y => y + vel.current);
    rafId.current = requestAnimationFrame(runInertia);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      vel.current = dx * 0.6;
      setRotY(y => y + vel.current);
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setGrabbing(false);
      stopRaf();
      rafId.current = requestAnimationFrame(runInertia);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); stopRaf(); };
  }, [runInertia]);

  // Attach wheel listener as non-passive so preventDefault() works
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setRotY(y => y + e.deltaY * 0.25);
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true; lastX.current = e.clientX; vel.current = 0;
    setGrabbing(true); stopRaf(); e.preventDefault();
  };

  const onTouchStart = (e: React.TouchEvent) => { lastX.current = e.touches[0].clientX; vel.current = 0; stopRaf(); };
  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - lastX.current;
    lastX.current = e.touches[0].clientX; vel.current = dx * 0.6;
    setRotY(y => y + vel.current); e.preventDefault();
  };
  const onTouchEnd = () => { stopRaf(); rafId.current = requestAnimationFrame(runInertia); };

  // ── Style helpers ─────────────────────────────────────────────
  const getThemeStyle = (printIdx: number): React.CSSProperties => {
    if (!themeUrl) return {};
    return {
      backgroundImage: `url(${themeUrl})`,
      backgroundSize: `${FACE_W * PRINT_N}px ${PRINT_H}px`,
      backgroundPosition: `${-(printIdx * FACE_W)}px ${PRINT_Y}px`,
      backgroundRepeat: 'no-repeat',
    };
  };

  // Without theme: spread user photos across all print faces (original behaviour)
  const getPhotoStyleNoTheme = (printIdx: number): React.CSSProperties => {
    if (!photoUrls.length) return {};
    const n = photoUrls.length;
    const segs = Array.from({ length: n }, (_, i) => ({
      start: Math.round((PRINT_N * i) / n),
      end: Math.round((PRINT_N * (i + 1)) / n),
    }));
    const si = segs.findIndex(s => printIdx >= s.start && printIdx < s.end);
    if (si === -1) return {};
    const { start, end } = segs[si];
    const faces = end - start;
    const posInSeg = printIdx - start;
    return {
      backgroundImage: `url(${photoUrls[si]})`,
      backgroundSize: `${FACE_W * faces}px ${PRINT_H}px`,
      backgroundPosition: `${-(posInSeg * FACE_W)}px ${PRINT_Y}px`,
      backgroundRepeat: 'no-repeat',
    };
  };

  // With theme: user photo overlaid on left USER_PHOTO_FACES faces
  const getUserPhotoOverlayStyle = (printIdx: number): React.CSSProperties | null => {
    if (!themeUrl || !photoUrls.length) return null;
    if (printIdx >= USER_PHOTO_FACES) return null;
    return {
      position: 'absolute',
      top: `${PRINT_Y}px`,
      left: 0,
      right: 0,
      height: `${PRINT_H}px`,
      backgroundImage: `url(${photoUrls[0]})`,
      backgroundSize: `${FACE_W * USER_PHOTO_FACES}px ${PRINT_H}px`,
      backgroundPosition: `${-(printIdx * FACE_W)}px 0`,
      backgroundRepeat: 'no-repeat',
      pointerEvents: 'none',
    };
  };

  // Placeholder box on left faces when theme selected but no user photo yet
  const showPlaceholder = themeUrl && !photoUrls.length;

  const normRot = ((rotY % 360) + 360) % 360;
  const handleVis = Math.max(0, Math.cos(normRot * Math.PI / 180));
  const handleScale = 0.55 + 0.45 * handleVis;

  return (
    <div className="mug3d-outer">
      <div className="mug3d-bg-dots" aria-hidden />

      <div className="mug3d-topbar">
        <span className="mug3d-drag-hint">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          Drag · Scroll · Touch to rotate
        </span>
        <span className="mug3d-spec-badge">200 × 90 mm print</span>
      </div>

      <div
        id="mug-3d-preview"
        ref={viewportRef}
        className={`mug3d-viewport ${grabbing ? 'mug3d-viewport--grabbing' : ''}`}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="img"
        aria-label="Interactive 3D mug preview – drag or scroll to rotate"
      >
        <div className="mug3d-tilt">
          <div className="mug3d-world" style={{ transform: `rotateY(${rotY}deg)` }}>
            {Array.from({ length: N_FACES }, (_, i) => {
              const angle = i * DEG;
              const inPrint = i >= PRINT_OFF && i < PRINT_OFF + PRINT_N;
              const printIdx = i - PRINT_OFF;

              const worldAngle = ((angle + rotY) % 360 + 360) % 360;
              const cosA = Math.cos(worldAngle * Math.PI / 180);
              const bright = Math.round((0.68 + 0.32 * cosA) * 100);

              // Determine face style
              let faceStyle: React.CSSProperties;
              let faceClass = 'mug3d-face';

              if (inPrint) {
                if (themeUrl) {
                  // Theme wraps all print faces
                  faceStyle = { ...getThemeStyle(printIdx) };
                } else if (photoUrls.length) {
                  // No theme: original behaviour
                  faceStyle = { ...getPhotoStyleNoTheme(printIdx) };
                } else {
                  faceClass += ' mug3d-face--ceramic';
                  faceStyle = {};
                }

                // Placeholder highlight for left faces when theme set, no photo yet
                if (showPlaceholder && printIdx < USER_PHOTO_FACES) {
                  faceStyle = {
                    ...faceStyle,
                    outline: '2px dashed rgba(255,255,255,0.5)',
                    outlineOffset: '-2px',
                  };
                }
              } else {
                faceClass += ' mug3d-face--ceramic';
                faceStyle = {};
              }

              const overlayStyle = getUserPhotoOverlayStyle(printIdx);

              return (
                <div
                  key={i}
                  className={faceClass}
                  style={{
                    width: `${FACE_W}px`,
                    height: `${MUG_H}px`,
                    left: `${FACE_L}px`,
                    transform: `rotateY(${angle}deg) translateZ(${MUG_R}px)`,
                    filter: `brightness(${bright}%)`,
                    position: 'absolute',
                    ...faceStyle,
                  }}
                >
                  {/* User photo overlay on left faces when theme is active */}
                  {overlayStyle && <div style={overlayStyle} />}
                  {/* Placeholder "Your photo here" box */}
                  {showPlaceholder && inPrint && printIdx < USER_PHOTO_FACES && (
                    <div className="mug3d-photo-placeholder" style={{
                      position: 'absolute',
                      top: `${PRINT_Y}px`,
                      left: 0,
                      right: 0,
                      height: `${PRINT_H}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      color: 'rgba(255,255,255,0.7)',
                      textAlign: 'center',
                      padding: '2px',
                      background: 'rgba(255,255,255,0.08)',
                      pointerEvents: 'none',
                    }}>
                      {printIdx === 2 ? '📷' : ''}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="mug3d-cap mug3d-cap--top" />
            <div className="mug3d-cap mug3d-cap--bottom" />
          </div>
        </div>

        <div
          className="mug3d-handle"
          aria-hidden
          style={{ opacity: handleVis, transform: `scaleX(${handleScale})`, transformOrigin: 'left center' }}
        />
        <div className="mug3d-shadow" aria-hidden />
      </div>

      {/* Hints */}
      {!themeUrl && photoUrls.length === 0 && (
        <p className="mug3d-empty-hint">Upload your photos — they'll wrap around the mug ✨</p>
      )}
      {themeUrl && photoUrls.length === 0 && (
        <p className="mug3d-empty-hint mug3d-theme-hint">
          📷 Your photo will appear in the <strong>left highlighted box</strong>
        </p>
      )}
    </div>
  );
};

// ── Mug Theme Selector ────────────────────────────────────────────────────────
interface MugThemeSelectorProps {
  themes: MugTheme[];
  selected: MugTheme | null;
  onSelect: (theme: MugTheme | null) => void;
}

const MugThemeSelector: React.FC<MugThemeSelectorProps> = ({ themes, selected, onSelect }) => {
  if (themes.length === 0) return null;

  return (
    <div className="mug-theme-section">
      <h3 className="pdp-section-heading">
        <Sparkles size={18} />
        Choose a Theme
        <span className="pdp-upload-count">Optional</span>
      </h3>
      <p className="mug-theme-intro">
        Pick a designer theme to wrap around your mug. Your photo will be placed in the
        <strong> highlighted left area</strong>. Skip to wrap your photos across the full mug.
      </p>

      <div className="mug-theme-grid">
        {/* "No theme" card */}
        <button
          className={`mug-theme-card mug-theme-card--none ${!selected ? 'mug-theme-card--selected' : ''}`}
          onClick={() => onSelect(null)}
          aria-label="No theme – use my own photos"
        >
          {!selected && <div className="mug-theme-check"><Check size={12} /></div>}
          <div className="mug-theme-none-icon">🖼️</div>
          <span className="mug-theme-name">My Photos Only</span>
        </button>

        {themes.map(theme => (
          <button
            key={theme.id}
            className={`mug-theme-card ${selected?.id === theme.id ? 'mug-theme-card--selected' : ''}`}
            onClick={() => onSelect(selected?.id === theme.id ? null : theme)}
            aria-label={`Select theme: ${theme.name}`}
          >
            {selected?.id === theme.id && (
              <div className="mug-theme-check"><Check size={12} /></div>
            )}
            <img src={theme.url} alt={theme.name} className="mug-theme-img" loading="lazy" />
            <span className="mug-theme-name">{theme.name}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mug-theme-selected-hint">
          <PackageCheck size={15} />
          <span>
            Theme <strong>"{selected.name}"</strong> selected — upload <strong>1 photo</strong> to fill the left box.
            Your photo will be merged with the theme on the final print.
          </span>
        </div>
      )}
    </div>
  );
};

// ── Frame Styles & Print Sizes ────────────────────────────────────────────────
const FRAME_STYLES = [
  { id: 'classic-wood', name: 'Classic Wood', color: '#8B4513', bw: 16 },
  { id: 'modern-black', name: 'Modern Black', color: '#1a1a1a', bw: 12 },
  { id: 'white-minimal', name: 'White Minimal', color: '#ddd', bw: 12 },
  { id: 'antique-gold', name: 'Antique Gold', color: '#B8860B', bw: 16 },
  { id: 'silver-steel', name: 'Silver Steel', color: '#9E9E9E', bw: 12 },
  { id: 'rustic-oak', name: 'Rustic Oak', color: '#6B3A2A', bw: 18 },
] as const;

const PRINT_SIZES = [
  { id: '4x6', label: '4×6', dims: '10×15 cm', price: 15 },
  { id: '5x7', label: '5×7', dims: '13×18 cm', price: 25 },
  { id: '6x8', label: '6×8', dims: '15×20 cm', price: 35 },
  { id: '8x10', label: '8×10', dims: '20×25 cm', price: 55 },
  { id: 'a4', label: 'A4', dims: '21×29.7 cm', price: 75 }
] as const;

// ── Frame Preview ─────────────────────────────────────────────────────────────
interface FramePreviewProps {
  frame: typeof FRAME_STYLES[number] | null;
  photoUrl: string | null;
}
const FramePreview: React.FC<FramePreviewProps> = ({ frame, photoUrl }) => {
  const f = frame || FRAME_STYLES[0];
  return (
    <div className="frame-preview-wrap">
      <div className="frame-preview-badge">Live Preview</div>
      <div className="frame-preview-box" style={{
        border: `${f.bw}px solid ${f.color}`,
        boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.15), 0 12px 40px rgba(0,0,0,0.5)`,
      }}>
        {photoUrl
          ? <img src={photoUrl} alt="Frame preview" className="frame-preview-img" />
          : (
            <div className="frame-preview-placeholder">
              <ImagePlus size={28} /><span>Upload a photo to preview</span>
            </div>
          )}
      </div>
      {frame && <div className="frame-preview-label">{frame.name}</div>}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Image state ────────────────────────────────────────────────
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // ── Mug theme state ────────────────────────────────────────────
  const [selectedTheme, setSelectedTheme] = useState<MugTheme | null>(null);

  // ── Frame ──────────────────────────────────────────────────────
  const [selectedFrame, setSelectedFrame] = useState<typeof FRAME_STYLES[number] | null>(null);

  // ── Print ──────────────────────────────────────────────────────
  const [selectedSize, setSelectedSize] = useState<typeof PRINT_SIZES[number] | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Limit: mug with theme = 1 photo; mug without theme = 3; frame = 1; others = 3
  const maxImages = useMemo(() => {
    if (id === 'photo-frame') return 1;
    if (id === 'photo-mug' && selectedTheme) return 1;
    return MAX_IMAGES_DEFAULT;
  }, [id, selectedTheme]);

  // When theme changes and user has too many images, trim
  useEffect(() => {
    if (images.length > maxImages) {
      const trimmed = images.slice(0, maxImages);
      setImages(trimmed);
      setPreviewUrls(trimmed.map(f => URL.createObjectURL(f)));
    }
  }, [maxImages]);

  const { modalOpen, openModal, closeModal, prevModal, nextModal, modalItem, hasPrev, hasNext } =
    useMediaModal(previewUrls.map((url, i) => ({ url, caption: `Photo ${i + 1} of ${previewUrls.length}` })));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const combined = [...images, ...Array.from(e.target.files)].slice(0, maxImages);
    setImages(combined);
    setPreviewUrls(combined.map(f => URL.createObjectURL(f)));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const printPrice = id === 'photo-print' && selectedSize ? selectedSize.price * quantity : null;
  const ctaPrice = printPrice !== null ? `₹${printPrice}` : product?.price ?? '';

  const canCheckout = () => {
    if (images.length === 0) return false;
    if (id === 'photo-print' && !selectedSize) return false;
    return true;
  };

  const ctaHint = () =>
    id === 'photo-print' && !selectedSize
      ? 'Select a size to continue'
      : 'Upload photos to continue';

  // ── Upload section renderer ────────────────────────────────────
  const renderUploadSection = (label: string, multi: boolean, hint?: string) => (
    <div className="pdp-upload-section">
      <h3 className="pdp-section-heading">
        <ImagePlus size={18} />
        {label}
        <span className="pdp-upload-count">{images.length}/{maxImages}</span>
      </h3>

      <div
        className={`pdp-upload-area ${images.length >= maxImages ? 'pdp-upload-area--full' : ''}`}
        onClick={() => images.length < maxImages && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef} type="file" accept="image/*" multiple={multi}
          onChange={handleImageUpload} style={{ display: 'none' }} aria-label="Upload images"
        />
        {images.length >= maxImages ? (
          <>
            <div className="pdp-upload-icon-done">✓</div>
            <p className="pdp-upload-text">
              {maxImages === 1 ? 'Photo uploaded!' : `All ${maxImages} photos uploaded!`}
            </p>
            {maxImages === 1 && (
              <button className="pdp-change-photo-btn"
                onClick={e => { e.stopPropagation(); removeImage(0); }}>
                Change Photo
              </button>
            )}
          </>
        ) : (
          <>
            <div className="pdp-upload-icon"><Upload size={28} /></div>
            <p className="pdp-upload-text">Tap to upload {multi ? 'photos' : '1 photo'}</p>
            <p className="pdp-upload-hint">{hint ?? 'PNG, JPG up to 10MB'}</p>
          </>
        )}
      </div>

      {previewUrls.length > 0 && (
        <div className="pdp-preview-grid">
          {previewUrls.map((url, idx) => (
            <div key={idx} className="pdp-preview-card">
              <img src={url} alt={`Upload ${idx + 1}`} className="pdp-preview-img"
                onClick={() => openModal(idx)} />
              <button className="pdp-preview-zoom" onClick={() => openModal(idx)} aria-label="Zoom"><ZoomIn size={14} /></button>
              <button className="pdp-preview-remove" onClick={() => removeImage(idx)} aria-label="Remove"><X size={14} /></button>
              <div className="pdp-preview-label">Photo {idx + 1}</div>
            </div>
          ))}
          {images.length < maxImages &&
            Array.from({ length: maxImages - previewUrls.length }).map((_, idx) => (
              <div key={`e-${idx}`} className="pdp-preview-card pdp-preview-card--empty"
                onClick={() => fileInputRef.current?.click()}>
                <ImagePlus size={24} /><span>Add</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );

  // ── Not found ──────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="pdp-page">
        <div className="pdp-not-found">
          <h2>Product not found</h2>
          <Link to="/instant-printing" className="pdp-back-link">
            <ArrowLeft size={16} /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pdp-page">
      {/* Back */}
      <div className="pdp-topbar">
        <button onClick={() => navigate('/instant-printing')} className="pdp-back-btn">
          <ArrowLeft size={18} /><span>All Products</span>
        </button>
      </div>

      {/* Hero visual */}
      <div className="pdp-visual" style={{ background: product.gradient }}>
        <span className="pdp-emoji">{product.emoji}</span>
        <div className="pdp-visual-ring" />
      </div>

      {/* Info */}
      <div className="pdp-info">
        <div className="pdp-price-badge">
          {id === 'photo-print' && selectedSize ? `₹${selectedSize.price}/print` : product.price}
        </div>
        <h1 className="pdp-title">{product.title}</h1>
        <p className="pdp-subtitle">{product.subtitle}</p>

        {/* Rating */}
        <div className="pdp-rating-row">
          <div className="pdp-stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16}
                fill={i < Math.floor(product.rating) ? '#f59e0b' : 'transparent'}
                color={i < Math.floor(product.rating) ? '#f59e0b' : 'rgba(255,255,255,0.2)'} />
            ))}
          </div>
          <span className="pdp-rating-text">{product.rating} · {product.reviews} reviews</span>
        </div>

        {/* Tags */}
        <div className="pdp-tags">
          {product.tags.map(tag => <span key={tag} className="pdp-tag">{tag}</span>)}
        </div>

        {/* ══════════════ MUG FLOW ══════════════ */}
        {id === 'photo-mug' && (
          <>
            <div className="pdp-desc-section">
              <h3 className="pdp-section-heading">☕ Ceramic Photo Mug</h3>
              <p className="pdp-desc-text">
                Choose a designer theme <em>or</em> upload <strong>1–3 of your own photos</strong> to
                wrap beautifully around a white ceramic mug. Drag the 3D preview to inspect every angle.
              </p>
            </div>

            {/* Theme Selector */}
            <MugThemeSelector
              themes={MUG_THEMES}
              selected={selectedTheme}
              onSelect={theme => {
                setSelectedTheme(theme);
                // Clear extra images if switching to theme mode
                if (theme && images.length > 1) {
                  setImages(prev => [prev[0]]);
                  setPreviewUrls(prev => [prev[0]]);
                }
              }}
            />

            {/* 3D Mug */}
            {images.length > 0 && <Mug3DViewer photoUrls={previewUrls} themeUrl={selectedTheme?.url} />}

            {/* Upload */}
            {renderUploadSection(
              selectedTheme ? 'Upload Your Photo (1 Photo for the Left Box)' : 'Upload Your Photos',
              !selectedTheme,
              selectedTheme
                ? 'PNG, JPG up to 10MB · 1 photo · will be placed in the left box'
                : 'PNG, JPG up to 10MB · 1–3 photos · 200×90 mm print area',
            )}
          </>
        )}

        {/* ══════════════ FRAME FLOW ══════════════ */}
        {id === 'photo-frame' && (
          <>
            <div className="pdp-desc-section">
              <h3 className="pdp-section-heading">🖼️ Choose a Frame Style</h3>
              <p className="pdp-desc-text">
                Select your preferred frame material and finish, then upload 1 photo.
              </p>
            </div>

            <div className="frame-styles-grid">
              {FRAME_STYLES.map(frame => (
                <button
                  key={frame.id}
                  className={`frame-style-card ${selectedFrame?.id === frame.id ? 'frame-style-card--selected' : ''}`}
                  onClick={() => setSelectedFrame(selectedFrame?.id === frame.id ? null : frame)}
                  aria-label={`Select frame: ${frame.name}`}
                >
                  <div className="frame-style-swatch"
                    style={{ border: `${Math.min(frame.bw, 10)}px solid ${frame.color}`, background: '#1a1a2e' }}>
                    {selectedFrame?.id === frame.id && <div className="frame-check"><Check size={11} /></div>}
                  </div>
                  <span className="frame-style-name">{frame.name}</span>
                </button>
              ))}
            </div>

            {(selectedFrame || previewUrls.length > 0) && (
              <FramePreview frame={selectedFrame} photoUrl={previewUrls[0] ?? null} />
            )}

            {renderUploadSection('Upload Your Photo', false)}
          </>
        )}

        {/* ══════════════ PRINT FLOW ══════════════ */}
        {id === 'photo-print' && (
          <>
            <div className="pdp-desc-section">
              <h3 className="pdp-section-heading">🖨️ Choose Print Size</h3>
              <p className="pdp-desc-text">
                Gallery-quality prints on premium archival paper. Select your size and quantity.
              </p>
            </div>

            <div className="print-size-grid">
              {PRINT_SIZES.map(size => (
                <button
                  key={size.id}
                  className={`print-size-chip ${selectedSize?.id === size.id ? 'print-size-chip--selected' : ''}`}
                  onClick={() => setSelectedSize(selectedSize?.id === size.id ? null : size)}
                  aria-label={`Select size ${size.label}`}
                >
                  <span className="print-size-label">{size.label}</span>
                  <span className="print-size-dims">{size.dims}</span>
                  <span className="print-size-price">₹{size.price}</span>
                </button>
              ))}
            </div>

            {selectedSize && (
              <div className="print-quantity-section">
                <div className="print-quantity-row">
                  <span className="print-quantity-label">Quantity</span>
                  <div className="print-total-badge">Total: <strong>₹{selectedSize.price * quantity}</strong></div>
                </div>
                <div className="print-quantity-stepper">
                  <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1} aria-label="Decrease"><Minus size={16} /></button>
                  <span className="qty-value">{quantity}</span>
                  <button className="qty-btn" onClick={() => setQuantity(q => Math.min(50, q + 1))}
                    disabled={quantity >= 50} aria-label="Increase"><Plus size={16} /></button>
                </div>
                <p className="qty-hint">{quantity} × ₹{selectedSize.price} = ₹{selectedSize.price * quantity}</p>
              </div>
            )}

            {renderUploadSection('Upload Your Photos', true,
              `PNG, JPG up to 10MB · Max ${MAX_IMAGES_DEFAULT} photos`)}
          </>
        )}

        {/* ══════════════ DEFAULT FLOW ══════════════ */}
        {id !== 'photo-mug' && id !== 'photo-frame' && id !== 'photo-print' && (
          <>
            <div className="pdp-desc-section">
              <h3 className="pdp-section-heading">About This Product</h3>
              <p className="pdp-desc-text">
                Create a one-of-a-kind {product.title.toLowerCase()} with your favourite photos.
                Upload up to <strong>3 photos</strong> and we'll craft a beautiful personalised product.
              </p>
            </div>
            {renderUploadSection('Upload Your Photos', true,
              `PNG, JPG up to 10MB · Max ${MAX_IMAGES_DEFAULT} photos`)}
          </>
        )}

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <div className="pdp-cta-section">
          <button
            id="pdp-add-to-cart-btn"
            className={`pdp-cta-btn ${!canCheckout() ? 'pdp-cta-btn--disabled' : ''}`}
            disabled={!canCheckout()}
            onClick={() =>
              navigate('/checkout', {
                state: {
                  product,
                  images,           // File[] for Drive upload
                  imageCount: images.length,
                  previewUrls,
                  selectedTheme: selectedTheme?.name,
                  selectedFrame: selectedFrame?.name,
                  selectedSize: selectedSize?.label,
                  selectedSizeDims: selectedSize?.dims,
                  quantity,
                  customPrice: printPrice ?? undefined,
                },
              })
            }
          >
            <PackageCheck size={18} />
            {!canCheckout() ? ctaHint() : `Place Order · ${ctaPrice}`}
          </button>
          {!canCheckout() && <p className="pdp-cta-hint">{ctaHint()}</p>}
        </div>
      </div>

      {/* Media Modal */}
      <MediaModal
        open={modalOpen} src={modalItem?.url} type="image"
        onClose={closeModal}
        onPrev={hasPrev ? prevModal : undefined}
        onNext={hasNext ? nextModal : undefined}
        caption={modalItem?.caption}
      />
    </div>
  );
};

export default ProductDetail;
