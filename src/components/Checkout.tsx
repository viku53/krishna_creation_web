import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  User,
  MapPin,
  CheckCircle,
  Image as ImageIcon,
  Phone,
  Mail,
  Truck,
  Shield,
  Clock,
  ChevronRight,
  Package,
  Sparkles,
  Loader2,
  MessageCircle,
  X,
  PackageCheck,
  Search,
} from 'lucide-react';
import type { PrintProduct } from './InstantPrinting';
import { sendOrderNotification, ENABLE_NOTIFICATIONS } from './sendNotification';
import { uploadOrderToDrive } from './uploadToDrive';

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = [
  { key: 'review', label: 'Review', icon: <ShoppingBag size={16} /> },
  { key: 'details', label: 'Details', icon: <User size={16} /> },
  { key: 'done', label: 'Done', icon: <CheckCircle size={16} /> },
];

// ── Order-ID generator ────────────────────────────────────────────────────────
function genOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `KC-${ts.slice(-4)}${rnd}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as {
    product?: PrintProduct;
    images?: File[];
    imageCount?: number;
    previewUrls?: string[];
    selectedTheme?: string;
    selectedFrame?: string;
    selectedSize?: string;
    selectedSizeDims?: string;
    quantity?: number;
    customPrice?: number;
  } | null;

  const product = state?.product;
  const imageFiles = state?.images ?? [];
  const imageCount = state?.imageCount ?? 0;
  const previewUrls = state?.previewUrls ?? [];
  const selectedTheme = state?.selectedTheme;
  const selectedFrame = state?.selectedFrame;
  const selectedSize = state?.selectedSize;
  const selectedSizeDims = state?.selectedSizeDims;
  const quantity = state?.quantity ?? 1;
  const customPrice = state?.customPrice;

  // ── Form state ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');

  const [placing, setPlacing] = useState(false);
  const [orderId] = useState(genOrderId);
  const [showUnavailable, setShowUnavailable] = useState(false);

  // ── Prevent refresh on Place Order step ────────────────────────────────────
  useEffect(() => {
    // Only block refresh when user is on the details/place-order step (step 1)
    // or while the order is actively being submitted
    const shouldBlock = step === 1 || placing;
    if (!shouldBlock) return;

    // Block browser reload / tab close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Your order details will be lost if you leave. Are you sure?';
      return e.returnValue;
    };

    // Block F5 / Ctrl+R / Cmd+R keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isRefreshKey =
        e.key === 'F5' ||
        ((e.ctrlKey || e.metaKey) && e.key === 'r') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'R');
      if (isRefreshKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [step, placing]);

  // ── Price ──────────────────────────────────────────────────────────────────
  const basePrice = customPrice ?? (product ? parseInt(product.price.replace(/[^\d]/g, '')) : 499);
  const deliveryFee = basePrice >= 999 ? 0 : 49;
  const totalPrice = basePrice + deliveryFee;

  // ── Step helpers ───────────────────────────────────────────────────────────
  const goNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep(s => Math.max(s - 1, 0));

  // ── Place order ────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!product) return;
    setPlacing(true);

    try {
      // 1. Upload images to Google Drive (non-blocking, best-effort)
      await uploadOrderToDrive({
        orderId,
        clientName: name,
        phone,
        email,
        product: product.title,
        theme: selectedTheme,
        address: `${address}, ${city} - ${pincode}`,
        notes,
        amount: totalPrice.toString(),
        images: imageFiles,
      });

      // 2. Send EmailJS notification (if configured)
      if (ENABLE_NOTIFICATIONS) {
        const extraNotes = [
          selectedTheme ? `Theme: ${selectedTheme}` : '',
          selectedFrame ? `Frame: ${selectedFrame}` : '',
          selectedSize ? `Size: ${selectedSize}${selectedSizeDims ? ` (${selectedSizeDims})` : ''}` : '',
          quantity > 1 ? `Qty: ${quantity}` : '',
          notes ? `Notes: ${notes}` : '',
        ].filter(Boolean).join(' | ');

        await sendOrderNotification({
          orderId,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          address,
          city,
          pincode,
          productName: product.title,
          productPrice: product.price,
          totalAmount: totalPrice.toString(),
          imageCount,
          notes: extraNotes,
        });
      }
    } catch (err) {
      console.error('Order placement error (non-fatal):', err);
    }

    setPlacing(false);
    setStep(2); // Done step
  };

  const hasCustomisation = selectedTheme || selectedFrame || selectedSize;

  if (!product) {
    return null;
  }

  return (
    <div className="checkout-page">
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="checkout-topbar">
        <button onClick={() => navigate(-1)} className="checkout-back-btn">
          <ArrowLeft size={18} /><span>Back</span>
        </button>
        <span className="checkout-topbar-title">Place Order</span>
        <div style={{ width: 80 }} />
      </div>

      {/* ── Stepper ──────────────────────────────────────────────────── */}
      <div className="checkout-stepper">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className={`checkout-step ${i <= step ? 'checkout-step--active' : ''} ${i < step ? 'checkout-step--done' : ''}`}>
              <div className="checkout-step-circle">
                {i < step ? <CheckCircle size={16} /> : s.icon}
              </div>
              <span className="checkout-step-label">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`checkout-step-line ${i < step ? 'checkout-step-line--done' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="checkout-content">

        {/* ═══ STEP 0: ORDER REVIEW ═══ */}
        {step === 0 && (
          <div className="checkout-step-content checkout-animate-in">
            <div className="checkout-section-title"><Package size={18} /> Order Review</div>

            {/* Product card */}
            <div className="checkout-product-card">
              <div className="checkout-product-visual" style={{ background: product.gradient }}>
                <span className="checkout-product-emoji">{product.emoji}</span>
              </div>
              <div className="checkout-product-info">
                <h3 className="checkout-product-name">{product.title}</h3>
                <p className="checkout-product-desc">{product.subtitle}</p>
                <div className="checkout-product-meta">
                  <span className="checkout-product-photos">
                    <ImageIcon size={14} />
                    {imageCount} photo{imageCount !== 1 ? 's' : ''} uploaded
                  </span>
                </div>
              </div>
            </div>

            {/* Customisation */}
            {hasCustomisation && (
              <div className="checkout-custom-card">
                <div className="checkout-mini-heading">✨ Customisation Details</div>
                {selectedTheme && (
                  <div className="checkout-custom-row">
                    <span>🎨 Theme</span><span>{selectedTheme}</span>
                  </div>
                )}
                {selectedFrame && (
                  <div className="checkout-custom-row">
                    <span>🖼️ Frame Style</span><span>{selectedFrame}</span>
                  </div>
                )}
                {selectedSize && (
                  <div className="checkout-custom-row">
                    <span>📐 Print Size</span>
                    <span>{selectedSize}{selectedSizeDims ? ` · ${selectedSizeDims}` : ''}</span>
                  </div>
                )}
                {quantity > 1 && (
                  <div className="checkout-custom-row">
                    <span>🔢 Quantity</span><span>{quantity} prints</span>
                  </div>
                )}
              </div>
            )}

            {/* Photo previews */}
            {previewUrls.length > 0 && (
              <div className="checkout-preview-section">
                <div className="checkout-mini-heading">Your Uploaded Photos</div>
                <div className="checkout-preview-row">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="checkout-preview-thumb">
                      <img src={url} alt={`Photo ${idx + 1}`} />
                      <span>Photo {idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price breakdown */}
            <div className="checkout-price-card">
              <div className="checkout-price-row">
                <span>
                  Product Price
                  {quantity > 1 && selectedSize && (
                    <span className="checkout-price-small"> ({quantity} × ₹{basePrice / quantity})</span>
                  )}
                </span>
                <span>₹{basePrice}</span>
              </div>
              <div className="checkout-price-row">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'checkout-free' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="checkout-price-divider" />
              <div className="checkout-price-row checkout-price-total">
                <span>Total</span><span>₹{totalPrice}</span>
              </div>
            </div>

            {/* Payment handled by Nikunj note */}
            <div className="checkout-offline-payment-note text-align-center">
              <div>
                <p className='flex text-align-center'><Shield size={16} /><strong className='ml-1'>Custom Crafted With Care</strong></p>
                <p>To ensure the finest quality for your custom prints, we begin the production process as soon as payment is confirmed. Simple payment instructions will be shared with you immediately after placing your order! ✨</p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="checkout-trust-row">
              <div className="checkout-trust-badge"><Shield size={14} /><span>Secure</span></div>
              <div className="checkout-trust-badge"><Truck size={14} /><span>Fast Delivery</span></div>
              <div className="checkout-trust-badge"><Clock size={14} /><span>3-5 Days</span></div>
            </div>

            <button className="checkout-next-btn" onClick={goNext}>
              Continue to Details <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ═══ STEP 1: SHIPPING DETAILS + PLACE ORDER ═══ */}
        {step === 1 && (
          <div className="checkout-step-content checkout-animate-in">
            <div className="checkout-section-title"><MapPin size={18} /> Your Details</div>

            <form
              onSubmit={e => { e.preventDefault(); handlePlaceOrder(); }}
              className="checkout-form"
            >
              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <label className="checkout-label"><User size={14} /> Full Name</label>
                  <input type="text" placeholder="Your full name" value={name}
                    onChange={e => setName(e.target.value)} className="checkout-input"
                    minLength={2} required />
                </div>
                <div className="checkout-form-group">
                  <label className="checkout-label"><Phone size={14} /> Phone Number</label>
                  <input type="tel" placeholder="+91 98765 43210" value={phone}
                    onChange={e => setPhone(e.target.value)} className="checkout-input"
                    pattern="^[0-9+\-\s()]{10,15}$"
                    title="Please enter a valid phone number (10-15 digits)" required />
                </div>
              </div>

              <div className="checkout-form-group">
                <label className="checkout-label"><Mail size={14} /> Email Address</label>
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} className="checkout-input"
                  pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                  title="Please enter a valid email address" required />
              </div>

              <div className="checkout-form-group">
                <label className="checkout-label"><MapPin size={14} /> Delivery Address</label>
                <textarea placeholder="House no, Street, Locality" value={address}
                  onChange={e => setAddress(e.target.value)} className="checkout-textarea"
                  rows={3} minLength={5} required />
              </div>

              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <label className="checkout-label">City</label>
                  <input type="text" placeholder="Mumbai" value={city}
                    onChange={e => setCity(e.target.value)} className="checkout-input"
                    minLength={2} required />
                </div>
                <div className="checkout-form-group">
                  <label className="checkout-label">Pincode</label>
                  <input type="text" placeholder="400001" value={pincode}
                    onChange={e => setPincode(e.target.value)} className="checkout-input"
                    pattern="^[0-9]{6}$" title="Please enter a 6-digit Pincode"
                    maxLength={6} required />
                </div>
              </div>

              <div className="checkout-form-group">
                <label className="checkout-label">Order Notes (optional)</label>
                <textarea placeholder="Any special instructions, size, or colour preferences..." value={notes}
                  onChange={e => setNotes(e.target.value)} className="checkout-textarea" rows={2} />
              </div>

              {/* Total mini-summary */}
              <div className="checkout-order-mini" style={{ marginTop: '1rem' }}>
                <div className="checkout-order-mini-left">
                  <div className="checkout-order-mini-emoji" style={{ background: product.gradient }}>
                    {product.emoji}
                  </div>
                  <div>
                    <div className="checkout-order-mini-name">{product.title}</div>
                    <div className="checkout-order-mini-meta">
                      {imageCount} photo{imageCount !== 1 ? 's' : ''}
                      {selectedTheme ? ` · ${selectedTheme}` : ''}
                      {selectedSize ? ` · ${selectedSize}` : ''}
                    </div>
                  </div>
                </div>
                <div className="checkout-order-mini-price">₹{totalPrice}</div>
              </div>

              <div className="checkout-btn-row">
                <button type="button" className="checkout-back-step-btn" onClick={goBack}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  id="place-order-btn"
                  className={`checkout-place-btn ${placing ? 'checkout-place-btn--disabled' : ''}`}
                  disabled={placing}
                >
                  {placing
                    ? <><Loader2 size={16} className="spin-icon" /> Placing Order…</>
                    : <><Sparkles size={16} /> Place Order · ₹{totalPrice}</>
                  }
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══ STEP 2: CONFIRMATION ═══ */}
        {step === 2 && (
          <div className="checkout-step-content checkout-animate-in">
            <div className="checkout-success-section">
              {/* Animated checkmark */}
              <div className="checkout-success-icon"><CheckCircle size={56} /></div>
              <h2 className="checkout-success-title">Order Placed! 🎉</h2>
              <p className="checkout-success-text">
                Thank you, <strong>{name}</strong>! Your order has been received.
              </p>

              {/* Order card */}
              <div className="checkout-success-card">
                <div className="checkout-success-row">
                  <span>Order Number</span>
                  <span className="checkout-success-val checkout-order-id">#{orderId}</span>
                </div>
                <div className="checkout-success-row">
                  <span>Product</span>
                  <span className="checkout-success-val">{product.title}</span>
                </div>
                {selectedTheme && (
                  <div className="checkout-success-row">
                    <span>Theme</span>
                    <span className="checkout-success-val">{selectedTheme}</span>
                  </div>
                )}
                {selectedFrame && (
                  <div className="checkout-success-row">
                    <span>Frame</span>
                    <span className="checkout-success-val">{selectedFrame}</span>
                  </div>
                )}
                {selectedSize && (
                  <div className="checkout-success-row">
                    <span>Size</span>
                    <span className="checkout-success-val">
                      {selectedSize}{quantity > 1 ? ` × ${quantity}` : ''}
                    </span>
                  </div>
                )}
                <div className="checkout-success-row">
                  <span>Photos</span>
                  <span className="checkout-success-val">{imageCount}</span>
                </div>
                <div className="checkout-success-row">
                  <span>Delivery To</span>
                  <span className="checkout-success-val">{address}, {city} – {pincode}</span>
                </div>
                <div className="checkout-success-divider" />
                <div className="checkout-success-row checkout-success-total">
                  <span>Amount Due</span><span>₹{totalPrice}</span>
                </div>
              </div>

              {/* Payment collection note */}
              <div className="checkout-payment-collected-note">
                <PackageCheck size={20} />
                <div>
                  <strong>Let's Get Started! ✨</strong>
                  <p>
                    We will begin crafting your beautiful custom prints as soon as your payment is received. We'll reach out to you shortly on <strong className='inline'>{phone}</strong> with the details to complete your payment!
                  </p>
                </div>
              </div>

              {/* Contact note */}
              <p className="checkout-success-note">
                📞 Confirmation call to <strong>{phone}</strong><br />
                📧 Details sent to <strong>{email}</strong>
              </p>

              {/* Actions */}
              <div className="checkout-success-actions">
                <Link
                  to={`/track-order`}
                  state={{ prefillOrderId: orderId }}
                  className="checkout-success-btn checkout-success-btn--primary"
                >
                  <Search size={16} /> Track Order #{orderId}
                </Link>
                <Link to="/instant-printing" className="checkout-success-btn checkout-success-btn--secondary">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Unavailable modal (fallback) */}
      {showUnavailable && (
        <div className="unavailable-overlay" onClick={() => setShowUnavailable(false)}>
          <div className="unavailable-modal" onClick={e => e.stopPropagation()}>
            <button className="unavailable-close" onClick={() => setShowUnavailable(false)}>
              <X size={18} />
            </button>
            <div className="unavailable-icon">⚠️</div>
            <h3 className="unavailable-title">Service Temporarily Unavailable</h3>
            <p className="unavailable-text">
              Please reach out to us directly to place your order!
            </p>
            <div className="unavailable-actions">
              <a href={`tel:+${import.meta.env.VITE_CONTACT_NUMBER}`} className="unavailable-btn unavailable-btn--call">
                <Phone size={16} /> Call Us
              </a>
              <a
                href={`https://wa.me/${import.meta.env.VITE_CONTACT_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="unavailable-btn unavailable-btn--wa"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
            <p className="unavailable-thanks">Thank you for your understanding 🙏</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
