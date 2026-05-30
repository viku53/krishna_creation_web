import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Package, Search, CheckCircle, RefreshCw, Truck, Star,
  Loader2, ShoppingBag, Shield, ArrowLeft,
} from 'lucide-react';
import { getOrderStatus, updateOrderStatus } from './uploadToDrive';
import { Link } from 'react-router-dom';
import type { OrderStatus } from './uploadToDrive';

// ── Order stages ──────────────────────────────────────────────────────────────
const STAGES = [
  {
    key: 'accepted',
    label: 'Order Accepted',
    desc: 'Your order has been received and confirmed. Kindly make the payment to proceed with processing.',
    icon: CheckCircle,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
  },
  {
    key: 'payment_received',
    label: 'Payment Received',
    desc: 'Thank you for your payment! We will start processing soon.',
    icon: CheckCircle,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)'
  },
  {
    key: 'in_process',
    label: 'In Process',
    desc: 'Your product is being crafted with care.',
    icon: RefreshCw,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
  },
  {
    key: 'in_transit',
    label: 'In Transit',
    desc: 'Your order is on its way to you!',
    icon: Truck,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
  },
  {
    key: 'completed',
    label: 'Completed',
    desc: 'Delivered! Enjoy your beautiful memories.',
    icon: Star,
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.12)',
  },
] as const;

type StageKey = (typeof STAGES)[number]['key'];

const ADMIN_STATUSES = [
  { value: 'Accepted', label: '✅ Accepted' },
  { value: 'Payment Received', label: '💰 Payment Received' },
  { value: 'In Process', label: '🔄 In Process' },
  { value: 'In Transit', label: '🚚 In Transit' },
  { value: 'Completed', label: '✅ Completed' },
];

// ── Normalize status string from Sheet → stage key ────────────────────────────
function toStageKey(status: string): StageKey {
  const s = status.toLowerCase().replace(/[\s-]+/g, '_');
  if (s.includes('accept')) return 'accepted';
  if (s.includes('payment') || s.includes('received')) return 'payment_received';
  if (s.includes('process')) return 'in_process';
  if (s.includes('transit')) return 'in_transit';
  if (s.includes('complet')) return 'completed';
  return 'accepted';
}

// ══════════════════════════════════════════════════════════════════════════════
const TrackOrder: React.FC = () => {
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';

  // ── Track state ────────────────────────────────────────────────────────────
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [notFound, setNotFound] = useState(false);

  // ── Admin state ────────────────────────────────────────────────────────────
  const [adminId, setAdminId] = useState('');
  const [adminStatus, setAdminStatus] = useState('Accepted');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim().toUpperCase();
    if (!id) return;
    setLoading(true);
    setOrder(null);
    setNotFound(false);

    const result = await getOrderStatus(id);
    if (result) {
      setOrder(result);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = adminId.trim().toUpperCase();
    if (!id) return;
    setUpdating(true);
    setUpdateMsg('');

    const ok = await updateOrderStatus(id, adminStatus);
    setUpdateMsg(ok
      ? `✅ Order ${id} updated to "${adminStatus}" successfully! (Refresh may take 30s to reflect)`
      : '❌ Update failed. Check order ID or script URL.'
    );
    setUpdating(false);
  };

  const currentKey = order ? toStageKey(order.status) : null;
  const currentIdx = currentKey ? STAGES.findIndex(s => s.key === currentKey) : -1;

  return (
    <div className="track-page">
      <Helmet>
        <title>Track Your Order | Krishna Creation Instant Printing</title>
        <meta name="description" content="Track your custom photo print order from Krishna Creation. Enter your order number to see real-time status." />
      </Helmet>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="track-hero">
        <div className="track-hero-icon"><Package size={32} strokeWidth={1.5} /></div>
        <h1 className="track-hero-title">Track Your Order</h1>
        <p className="track-hero-sub">
          Enter the order number you received after placing your print order.
        </p>
      </div>

      {/* ── Search ────────────────────────────────────────────────────── */}
      <div className="track-search-wrap">
        <form onSubmit={handleSearch} className="track-search-form">
          <input
            id="track-order-input"
            type="text"
            value={orderId}
            onChange={e => setOrderId(e.target.value.toUpperCase())}
            placeholder="e.g. KC-M8X2P1"
            className="track-search-input"
            autoComplete="off"
            required
          />
          <button type="submit" className="track-search-btn" disabled={loading} id="track-search-btn">
            {loading
              ? <><Loader2 size={17} className="spin-icon" /> Searching…</>
              : <><Search size={17} /> Track Order</>
            }
          </button>
        </form>

        {notFound && (
          <p className="track-not-found">
            ❌ Order <strong>{orderId}</strong> not found. Double-check the number from your confirmation screen.
          </p>
        )}
      </div>

      {/* ── Result ────────────────────────────────────────────────────── */}
      {order && (
        <div className="track-result-card">
          {/* Header */}
          <div className="track-result-header">
            <div>
              <p className="track-result-label">Order Number</p>
              <h2 className="track-result-id">#{order.orderId}</h2>
            </div>
            <div className="track-result-status-badge" style={{
              background: STAGES[Math.max(0, currentIdx)].bg,
              color: STAGES[Math.max(0, currentIdx)].color,
            }}>
              {STAGES[Math.max(0, currentIdx)].label}
            </div>
          </div>

          {/* Product info */}
          <div className="track-product-row">
            <div className="track-product-info">
              <span className="track-product-name">{order.product}</span>
              {order.theme && order.theme !== '-' && (
                <span className="track-product-theme">For : {order.clientName}</span>
              )}
            </div>
            {order.amount && (
              <span className="track-product-amount">₹{order.amount}</span>
            )}
          </div>

          {/* Timeline */}
          <div className="track-timeline">
            {STAGES.map((stage, idx) => {
              const isDone = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              const Icon = stage.icon;

              return (
                <div
                  key={stage.key}
                  className={`track-stage${isDone ? ' track-stage--done' : ''}${isCurrent ? ' track-stage--current' : ''}`}
                >
                  {/* Left: icon + connector */}
                  <div className="track-stage-left">
                    <div
                      className="track-stage-icon"
                      style={isDone ? { background: stage.color, color: '#fff' } : {}}
                    >
                      <Icon size={18} />
                    </div>
                    {idx < STAGES.length - 1 && (
                      <div className={`track-stage-connector${isDone && idx < currentIdx ? ' track-stage-connector--done' : ''}`} />
                    )}
                  </div>

                  {/* Right: content */}
                  <div className="track-stage-body">
                    <div className="track-stage-label">{stage.label}</div>
                    <div className="track-stage-desc">{stage.desc}</div>
                    {isCurrent && (
                      <div className="track-stage-current-chip">
                        ● Current Status
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer dates */}
          <div className="track-result-footer">
            <span>📅 Ordered: <strong>{order.createdAt}</strong></span>
            <span>🔄 Updated: <strong>{order.updatedAt}</strong></span>
          </div>

          {/* Payment reminder */}
          <div className="track-payment-note text-align-center">
            <Shield size={15} />
            <span>
              Orders are processed with love as soon as payment is received. 💖<br />
              For payment details or any queries, please call/WhatsApp us at <a href="tel:+919769989807">+91 97699 89807</a>.
            </span>
          </div>
        </div>
      )
      }

      {/* ── Back link ─────────────────────────────────────────────────── */}
      <div className="track-back-row">
        <Link to="/instant-printing" className="track-back-link">
          <ArrowLeft size={16} /> Back to Instant Printing
        </Link>
        <Link to="/" className="track-back-link">
          <ShoppingBag size={16} /> Home
        </Link>
      </div>

      {/* ── Admin Panel ───────────────────────────────────────────────── */}
      {
        isAdmin && (
          <div className="track-admin-panel">
            <div className="track-admin-header">
              <Shield size={18} />
              <h2 className="track-admin-title">Admin – Update Order Status</h2>
            </div>
            <p className="track-admin-note">
              Only accessible via <code>?admin=1</code>. Changes reflect in the Google Sheet.
            </p>
            <form onSubmit={handleAdminUpdate} className="track-admin-form">
              <input
                type="text"
                value={adminId}
                onChange={e => setAdminId(e.target.value.toUpperCase())}
                placeholder="Order ID (e.g. KC-M8X2P1)"
                className="track-search-input"
                required
              />
              <select
                value={adminStatus}
                onChange={e => setAdminStatus(e.target.value)}
                className="track-admin-select"
              >
                {ADMIN_STATUSES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button type="submit" className="track-search-btn" disabled={updating}>
                {updating
                  ? <><Loader2 size={16} className="spin-icon" /> Updating…</>
                  : 'Update Status'
                }
              </button>
            </form>
            {updateMsg && <p className="track-admin-msg">{updateMsg}</p>}
          </div>
        )
      }
    </div >
  );
};

export default TrackOrder;
