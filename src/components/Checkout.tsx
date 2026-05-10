import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
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
} from 'lucide-react';
import type { PrintProduct } from './InstantPrinting';
import { sendOrderNotification, ENABLE_NOTIFICATIONS } from './sendNotification';

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { key: 'review', label: 'Review', icon: <ShoppingBag size={16} /> },
  { key: 'details', label: 'Details', icon: <User size={16} /> },
  { key: 'payment', label: 'Payment', icon: <CreditCard size={16} /> },
  { key: 'confirm', label: 'Done', icon: <CheckCircle size={16} /> },
];

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Data from PDP
  const state = location.state as {
    product?: PrintProduct;
    imageCount?: number;
    previewUrls?: string[];
  } | null;

  const product = state?.product;
  const imageCount = state?.imageCount ?? 0;
  const previewUrls = state?.previewUrls ?? [];

  // ─── Form state ────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');
  const [upiRef, setUpiRef] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderId] = useState(() => Date.now().toString(36).toUpperCase());
  const [showUnavailable, setShowUnavailable] = useState(false);

  // Price calculation
  const basePrice = product ? parseInt(product.price.replace(/[^\d]/g, '')) : 499;
  const deliveryFee = basePrice >= 999 ? 0 : 49;
  const totalPrice = basePrice + deliveryFee;

  // ─── Step handlers ─────────────────────────────────────────
  const goNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep(s => Math.max(s - 1, 0));

  const handlePlaceOrder = async () => {
    if (!product) return;

    if (!ENABLE_NOTIFICATIONS) {
      setShowUnavailable(true);
      return;
    }

    setPlacing(true);

    // Send email notification to owner
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
      paymentMethod,
      upiRef,
      notes,
    });

    setPlacing(false);
    setOrderPlaced(true);
    setStep(3);
  };

  // ─── No product fallback ──────────────────────────────────
  if (!product) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">
            <ShoppingBag size={48} />
          </div>
          <h2>Your cart is empty</h2>
          <p>Browse our products and add items to your cart.</p>
          <Link to="/instant-printing" className="checkout-empty-btn">
            <ShoppingBag size={16} />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* ── Top bar ──────────────────────────────────── */}
      <div className="checkout-topbar">
        <button onClick={() => navigate(-1)} className="checkout-back-btn">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <span className="checkout-topbar-title">Checkout</span>
        <div style={{ width: 80 }} />
      </div>

      {/* ── Stepper ──────────────────────────────────── */}
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

      {/* ── Step Content ─────────────────────────────── */}
      <div className="checkout-content">

        {/* ═══ STEP 0: ORDER REVIEW ═══ */}
        {step === 0 && (
          <div className="checkout-step-content checkout-animate-in">
            <div className="checkout-section-title">
              <Package size={18} />
              Order Review
            </div>

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

            {/* Uploaded previews */}
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
                <span>Product Price</span>
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
                <span>Total</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="checkout-trust-row">
              <div className="checkout-trust-badge">
                <Shield size={14} />
                <span>Secure Checkout</span>
              </div>
              <div className="checkout-trust-badge">
                <Truck size={14} />
                <span>Fast Delivery</span>
              </div>
              <div className="checkout-trust-badge">
                <Clock size={14} />
                <span>3-5 Days</span>
              </div>
            </div>

            <button className="checkout-next-btn" onClick={goNext}>
              Continue to Details
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ═══ STEP 1: SHIPPING DETAILS ═══ */}
        {step === 1 && (
          <div className="checkout-step-content checkout-animate-in">
            <div className="checkout-section-title">
              <MapPin size={18} />
              Shipping Details
            </div>

            <form onSubmit={e => { e.preventDefault(); goNext(); }} className="checkout-form">
              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <label className="checkout-label">
                    <User size={14} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="checkout-input"
                    minLength={2}
                    required
                  />
                </div>
                <div className="checkout-form-group">
                  <label className="checkout-label">
                    <Phone size={14} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="checkout-input"
                    pattern="^[0-9+\-\s()]{10,15}$"
                    title="Please enter a valid phone number (10-15 digits)"
                    required
                  />
                </div>
              </div>

              <div className="checkout-form-group">
                <label className="checkout-label">
                  <Mail size={14} />
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="checkout-input"
                  pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                  title="Please enter a valid email address"
                  required
                />
              </div>

              <div className="checkout-form-group">
                <label className="checkout-label">
                  <MapPin size={14} />
                  Delivery Address
                </label>
                <textarea
                  placeholder="House no, Street, Locality"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="checkout-textarea"
                  rows={3}
                  minLength={5}
                  required
                />
              </div>

              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <label className="checkout-label">City</label>
                  <input
                    type="text"
                    placeholder="Mumbai"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="checkout-input"
                    minLength={2}
                    required
                  />
                </div>
                <div className="checkout-form-group">
                  <label className="checkout-label">Pincode</label>
                  <input
                    type="text"
                    placeholder="400001"
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="checkout-input"
                    pattern="^[0-9]{6}$"
                    title="Please enter a 6-digit Pincode"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div className="checkout-form-group">
                <label className="checkout-label">Order Notes (optional)</label>
                <textarea
                  placeholder="Any special instructions..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="checkout-textarea"
                  rows={2}
                />
              </div>
              <div className="checkout-btn-row">
                <button type="button" className="checkout-back-step-btn" onClick={goBack}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  className="checkout-next-btn"
                >
                  Continue to Payment
                  <ChevronRight size={18} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══ STEP 2: PAYMENT ═══ */}
        {step === 2 && (
          <div className="checkout-step-content checkout-animate-in">
            <div className="checkout-section-title">
              <CreditCard size={18} />
              Payment
            </div>

            {/* Order summary mini */}
            <div className="checkout-order-mini">
              <div className="checkout-order-mini-left">
                <div className="checkout-order-mini-emoji" style={{ background: product.gradient }}>
                  {product.emoji}
                </div>
                <div>
                  <div className="checkout-order-mini-name">{product.title}</div>
                  <div className="checkout-order-mini-meta">{imageCount} photos · Ships to {city}</div>
                </div>
              </div>
              <div className="checkout-order-mini-price">₹{totalPrice}</div>
            </div>

            {/* Payment methods */}
            <form onSubmit={e => { e.preventDefault(); handlePlaceOrder(); }}>
              <div className="checkout-payment-methods">
                <div className="checkout-mini-heading">Choose Payment Method</div>
                <div className="checkout-payment-options">
                  <button
                    className={`checkout-payment-option ${paymentMethod === 'upi' ? 'checkout-payment-option--active' : ''}`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <div className="checkout-payment-icon">💳</div>
                    <div>
                      <div className="checkout-payment-title">UPI / QR Code</div>
                      <div className="checkout-payment-desc">Pay via Google Pay, PhonePe, etc.</div>
                    </div>
                  </button>
                  <button
                    className={`checkout-payment-option ${paymentMethod === 'cod' ? 'checkout-payment-option--active' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className="checkout-payment-icon">🏠</div>
                    <div>
                      <div className="checkout-payment-title">Cash on Delivery</div>
                      <div className="checkout-payment-desc">Pay when you receive</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* UPI section */}
              {paymentMethod === 'upi' && (
                <div className="checkout-upi-section">
                  <div className="checkout-qr-wrap">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=krishnacreation@upi&am=${totalPrice}&tn=Order-${product.id}`}
                      alt="UPI QR Code"
                      className="checkout-qr-img"
                    />
                    <div className="checkout-upi-id">
                      UPI ID: <strong>krishnacreation@upi</strong>
                    </div>
                    <div className="checkout-upi-amount">Amount: ₹{totalPrice}</div>
                  </div>

                  <div className="checkout-form-group">
                    <label className="checkout-label">UPI Transaction Reference ID</label>
                    <input
                      type="text"
                      placeholder="Enter 12-digit UPI reference number"
                      value={upiRef}
                      onChange={e => setUpiRef(e.target.value)}
                      className="checkout-input"
                      required={paymentMethod === 'upi'}
                      pattern="^[0-9]{12}$"
                      title="UPI reference must be a 12-digit number"
                      maxLength={12}
                    />
                    <p className="checkout-input-hint">Enter the reference number after completing payment</p>
                  </div>
                </div>
              )}

              {/* COD info */}
              {paymentMethod === 'cod' && (
                <div className="checkout-cod-info">
                  <div className="checkout-cod-icon">🏠</div>
                  <p>Pay <strong>₹{totalPrice}</strong> when the product is delivered to your doorstep.</p>
                  <div className="checkout-cod-note">
                    Note: Cash on Delivery is available for orders within India.
                  </div>
                </div>
              )}

              <div className="checkout-btn-row">
                <button type="button" className="checkout-back-step-btn" onClick={goBack}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  className={`checkout-place-btn ${placing ? 'checkout-place-btn--disabled' : ''}`}
                  disabled={placing}
                >
                  {placing ? (
                    <>
                      <Loader2 size={16} className="spin-icon" /> Placing Order...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Place Order · ₹{totalPrice}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══ STEP 3: CONFIRMATION ═══ */}
        {step === 3 && orderPlaced && (
          <div className="checkout-step-content checkout-animate-in">
            <div className="checkout-success-section">
              <div className="checkout-success-icon">
                <CheckCircle size={48} />
              </div>
              <h2 className="checkout-success-title">Order Placed Successfully!</h2>
              <p className="checkout-success-text">
                Thank you, <strong>{name}</strong>! Your order has been placed.
              </p>

              {/* Order details */}
              <div className="checkout-success-card">
                <div className="checkout-success-row">
                  <span>Order</span>
                  <span className="checkout-success-val">#{orderId}</span>
                </div>
                <div className="checkout-success-row">
                  <span>Product</span>
                  <span className="checkout-success-val">{product.title}</span>
                </div>
                <div className="checkout-success-row">
                  <span>Photos</span>
                  <span className="checkout-success-val">{imageCount}</span>
                </div>
                <div className="checkout-success-row">
                  <span>Delivery</span>
                  <span className="checkout-success-val">{address}, {city} - {pincode}</span>
                </div>
                <div className="checkout-success-row">
                  <span>Payment</span>
                  <span className="checkout-success-val">{paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}</span>
                </div>
                <div className="checkout-success-divider" />
                <div className="checkout-success-row checkout-success-total">
                  <span>Total Paid</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>

              <p className="checkout-success-note">
                📧 Confirmation sent to <strong>{email}</strong><br />
                📞 We'll call you at <strong>{phone}</strong> for confirmation
              </p>

              <div className="checkout-success-actions">
                <Link to="/" className="checkout-success-btn checkout-success-btn--primary">
                  Back to Home
                </Link>
                <Link to="/instant-printing" className="checkout-success-btn checkout-success-btn--secondary">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      {showUnavailable && (
        <div className="unavailable-overlay" onClick={() => setShowUnavailable(false)}>
          <div className="unavailable-modal" onClick={e => e.stopPropagation()}>
            <button className="unavailable-close" onClick={() => setShowUnavailable(false)}>
              <X size={18} />
            </button>
            <div className="unavailable-icon">⚠️</div>
            <h3 className="unavailable-title">Service Temporarily Unavailable</h3>
            <p className="unavailable-text">
              Our online order service is currently unavailable. We apologize for the inconvenience.
              Please reach out to us directly to place your order — we'd love to hear from you!
            </p>
            <div className="unavailable-actions">
              <a href={`tel:+${import.meta.env.VITE_CONTACT_NUMBER}`} className="unavailable-btn unavailable-btn--call">
                <Phone size={16} />
                Call Us
              </a>
              <a
                href={`https://wa.me/${import.meta.env.VITE_CONTACT_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="unavailable-btn unavailable-btn--wa"
              >
                <MessageCircle size={16} />
                WhatsApp
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
