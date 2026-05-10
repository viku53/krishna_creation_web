import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Star, ShoppingCart, ImagePlus, ZoomIn } from 'lucide-react';
import { products } from './InstantPrinting';
import { useMediaModal } from './useMediaModal';
import MediaModal from './MediaModal';

const MAX_IMAGES = 3;

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const {
    modalOpen,
    openModal,
    closeModal,
    prevModal,
    nextModal,
    modalItem,
    hasPrev,
    hasNext,
  } = useMediaModal(previewUrls.map((url, idx) => ({ url, caption: `Upload ${idx + 1} of ${previewUrls.length}` })));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const combined = [...images, ...newFiles].slice(0, MAX_IMAGES);
    setImages(combined);
    setPreviewUrls(combined.map(file => URL.createObjectURL(file)));
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    const newImages = images.filter((_, i) => i !== idx);
    const newUrls = previewUrls.filter((_, i) => i !== idx);
    setImages(newImages);
    setPreviewUrls(newUrls);
  };

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
      {/* ── Back button ──────────────────────────────────── */}
      <div className="pdp-topbar">
        <button onClick={() => navigate('/instant-printing')} className="pdp-back-btn">
          <ArrowLeft size={18} />
          <span>All Products</span>
        </button>
      </div>

      {/* ── Product visual ───────────────────────────────── */}
      <div className="pdp-visual" style={{ background: product.gradient }}>
        <span className="pdp-emoji">{product.emoji}</span>
        <div className="pdp-visual-ring" />
      </div>

      {/* ── Product Info ─────────────────────────────────── */}
      <div className="pdp-info">
        <div className="pdp-price-badge">{product.price}</div>
        <h1 className="pdp-title">{product.title}</h1>
        <p className="pdp-subtitle">{product.subtitle}</p>

        {/* Rating */}
        <div className="pdp-rating-row">
          <div className="pdp-stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                fill={i < Math.floor(product.rating) ? '#f59e0b' : 'transparent'}
                color={i < Math.floor(product.rating) ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
              />
            ))}
          </div>
          <span className="pdp-rating-text">{product.rating} · {product.reviews} reviews</span>
        </div>

        {/* Tags */}
        <div className="pdp-tags">
          {product.tags.map(tag => (
            <span key={tag} className="pdp-tag">{tag}</span>
          ))}
        </div>

        {/* ── Description section ────────────────────────── */}
        <div className="pdp-desc-section">
          <h3 className="pdp-section-heading">About This Product</h3>
          <p className="pdp-desc-text">
            Create a one-of-a-kind {product.title.toLowerCase()} with your favorite photos.
            Upload up to <strong>3 photos</strong> and we'll craft a beautiful, personalized
            product just for you. Premium quality materials, vibrant colors, and fast delivery.
          </p>
        </div>

        {/* ── Upload Section ─────────────────────────────── */}
        <div className="pdp-upload-section">
          <h3 className="pdp-section-heading">
            <ImagePlus size={18} />
            Upload Your Photos
            <span className="pdp-upload-count">{images.length}/{MAX_IMAGES}</span>
          </h3>

          {/* Upload area */}
          <div
            className={`pdp-upload-area ${images.length >= MAX_IMAGES ? 'pdp-upload-area--full' : ''}`}
            onClick={() => images.length < MAX_IMAGES && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              aria-label="Upload images"
            />
            {images.length >= MAX_IMAGES ? (
              <>
                <div className="pdp-upload-icon-done">✓</div>
                <p className="pdp-upload-text">All {MAX_IMAGES} photos uploaded!</p>
              </>
            ) : (
              <>
                <div className="pdp-upload-icon">
                  <Upload size={28} />
                </div>
                <p className="pdp-upload-text">
                  Tap to upload photos
                </p>
                <p className="pdp-upload-hint">
                  PNG, JPG up to 10MB · Max {MAX_IMAGES} photos
                </p>
              </>
            )}
          </div>

          {/* Preview grid */}
          {previewUrls.length > 0 && (
            <div className="pdp-preview-grid">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="pdp-preview-card">
                  <img
                    src={url}
                    alt={`Upload ${idx + 1}`}
                    className="pdp-preview-img"
                    onClick={() => openModal(idx)}
                  />
                  <button
                    className="pdp-preview-zoom"
                    onClick={() => openModal(idx)}
                    aria-label="Zoom image"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    className="pdp-preview-remove"
                    onClick={() => removeImage(idx)}
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                  <div className="pdp-preview-label">Photo {idx + 1}</div>
                </div>
              ))}

              {/* Placeholder slots */}
              {Array.from({ length: MAX_IMAGES - previewUrls.length }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="pdp-preview-card pdp-preview-card--empty"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus size={24} />
                  <span>Add</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CTA ────────────────────────────────────────── */}
        <div className="pdp-cta-section">
          <button
            className={`pdp-cta-btn ${images.length === 0 ? 'pdp-cta-btn--disabled' : ''}`}
            disabled={images.length === 0}
            onClick={() => navigate('/checkout', { state: { product, imageCount: images.length, previewUrls } })}
          >
            <ShoppingCart size={18} />
            {images.length === 0 ? 'Upload photos to continue' : `Add to Cart · ${product.price}`}
          </button>
          {images.length === 0 && (
            <p className="pdp-cta-hint">Please upload at least 1 photo to proceed</p>
          )}
        </div>
      </div>

      {/* ── Media Modal ──────────────────────────────────── */}
      <MediaModal
        open={modalOpen}
        src={modalItem?.url}
        type="image"
        onClose={closeModal}
        onPrev={hasPrev ? prevModal : undefined}
        onNext={hasNext ? nextModal : undefined}
        caption={modalItem?.caption}
      />
    </div>
  );
};

export default ProductDetail;
