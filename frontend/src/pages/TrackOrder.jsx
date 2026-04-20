import { useState, useEffect } from 'react';
import { API_URL } from '../api';
import './TrackOrder.css';

// 1. Redesign TrackOrder.jsx for premium feel
const STATUS_STEPS = [
  { label: 'Ordered', icon: '🛒', desc: 'Received & flavoring' },
  { label: 'Packed', icon: '📦', desc: 'Sealed with love' },
  { label: 'Waiting for Transport', icon: '🚛', desc: 'Handed to courier' },
  { label: 'Out for Delivery', icon: '🚚', desc: 'Arriving at your city' },
  { label: 'Delivered', icon: '🥒', desc: 'Deliciously delivered' }
];

export default function TrackOrder() {
  const [trackId, setTrackId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!trackId.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`${API_URL}/api/orders/track/${trackId.trim()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Order not found');
      setOrder(data);
    } catch (err) {
      setError('Could not find order. Please check the ID (e.g., DP-1001 or A24F896E).');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => STATUS_STEPS.findIndex(s => s.label === status);

  return (
    <div className="page-wrapper track-page premium-view">
      <div className="track-hero-section">
        <div className="container">
          <header className="track-header-fancy">
            <h1 className="track-title-luxury">Trace Your <span>Authenticity</span></h1>
            <p className="track-subtitle-luxury">Real-time status of your handmade Dhakshitha Pickles</p>
          </header>

          <form onSubmit={handleTrack} className="track-form-luxury fade-in">
            <div className="track-input-container">
              <span className="premium-icon">🔍</span>
              <input
                type="text"
                placeholder="Enter ID (e.g., DP-1001)"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                className="luxury-input"
                required
              />
              <button type="submit" className="luxury-submit" disabled={loading}>
                {loading ? '...' : 'FIND ORDER'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1000px', paddingBottom: '100px' }}>
        {error && (
          <div className="luxury-alert error-alert fade-in">
            <span className="alert-icon">⚠️</span>
            <div className="alert-text">{error}</div>
          </div>
        )}

        {order && (
          <div className="tracking-results-luxury fade-in">
            {order.status === 'Cancelled' ? (
              <div className="luxury-alert cancel-alert">
                 <span className="alert-icon">❌</span>
                 <div className="alert-text">
                   <h3>Order Cancelled</h3>
                   <p>This order was cancelled. Please contact us for details.</p>
                 </div>
              </div>
            ) : (
              <div className="luxury-tracking-card">
                <div className="ltc-header">
                  <div className="ltc-meta">
                    <span className="ltc-label">Order Reference</span>
                    <strong className="ltc-id">{order.trackingId || order._id.slice(-8).toUpperCase()}</strong>
                  </div>
                  <div className={`ltc-badge-status status-${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
                    {order.status}
                  </div>
                </div>

                <div className="luxury-stepper-horizontal">
                  {STATUS_STEPS.map((step, idx) => {
                    const currentIndex = getStepIndex(order.status);
                    const isDone = idx <= currentIndex;
                    const isCurrent = idx === currentIndex;

                    return (
                      <div key={idx} className={`lstep-node ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                        <div className="lstep-icon-wrap">
                          <span className="lstep-icon">{step.icon}</span>
                          {isDone && !isCurrent && <span className="lstep-check">✓</span>}
                        </div>
                        <div className="lstep-info">
                          <label className="lstep-label">{step.label}</label>
                          <small className="lstep-desc">{step.desc}</small>
                        </div>
                        {idx < STATUS_STEPS.length - 1 && <div className="lstep-connector" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="luxury-details-grid">
              <div className="l-order-items-card glass-card">
                <h3>📦 Harvest Selection</h3>
                <div className="l-items-list">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="l-item-row">
                      <div className="l-item-main">
                        <strong>{item.name}</strong>
                        <span className="l-item-weight">{item.weight}</span>
                      </div>
                      <div className="l-item-qty">Qty: {item.quantity}</div>
                    </div>
                  ))}
                </div>
                <div className="l-item-total-line">
                  <span>Grand Total</span>
                  <strong>₹{order.total}</strong>
                </div>
              </div>

              <div className="l-order-info-card glass-card">
                <h3>🧾 Delivery Details</h3>
                <div className="l-info-stack">
                  <div className="l-info-item">
                    <span>Customer</span>
                    <p>{order.billingDetails?.firstName} {order.billingDetails?.lastName}</p>
                  </div>
                  <div className="l-info-item">
                    <span>Contact Info</span>
                    <p>📱 {order.billingDetails?.phone}</p>
                  </div>
                  <div className="l-info-item">
                    <span>Shipping Address</span>
                    <p>{order.billingDetails?.streetAddress}, {order.billingDetails?.city}, {order.billingDetails?.state} - {order.billingDetails?.pinCode}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
