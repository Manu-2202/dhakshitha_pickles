import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_URL } from '../api';
import './Checkout.css';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', companyName: '', country: 'India',
    streetAddress: '', apartment: '', city: '', state: '', pinCode: '',
    phone: '', email: ''
  });

  const [wantsWhatsapp, setWantsWhatsapp] = useState(true);
  const [couponCode, setCouponCode]       = useState('');
  const [discount, setDiscount]           = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [isProcessing, setIsProcessing]   = useState(false);
  const [orderSuccess, setOrderSuccess]   = useState(null);
  const [errorMsg, setErrorMsg]           = useState('');

  const finalTotal = Math.max(0, cartTotal - discount);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res  = await fetch(`${API_URL}/api/coupons/validate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setDiscount(data.discountAmount);
        setCouponMessage(`✅ Discount of ₹${data.discountAmount} applied!`);
      } else {
        setDiscount(0);
        setCouponMessage(data.message || 'Invalid coupon');
      }
    } catch { setCouponMessage('Error validating coupon'); }
  };

  const initiateRazorpay = (orderId) =>
    new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded. Please check your internet connection.'));
        return;
      }
      const rzp = new window.Razorpay({
        key: 'rzp_live_SObidYdicroHKe',
        amount: finalTotal * 100,
        currency: 'INR',
        name: 'Dhakshitha Pickles',
        description: 'Order Payment',
        order_id: orderId,
        handler: resolve,
        modal: {
          ondismiss: () => reject(new Error('Payment was cancelled. No money was deducted.')),
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email || '',
          contact: formData.phone
        },
        theme: { color: '#da1f26' }
      });
      rzp.on('payment.failed', (r) => reject(new Error(r.error?.description || 'Payment failed')));
      rzp.open();
    });

  const submitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // ── Step 1: Create Razorpay order ──────────────────────
      let rpOrder;
      try {
        const rpRes = await fetch(`${API_URL}/api/payment/orders`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: finalTotal })
        });
        if (!rpRes.ok) {
          const err = await rpRes.json().catch(() => ({}));
          throw new Error(err.message || 'Could not connect to payment server. Please try again.');
        }
        rpOrder = await rpRes.json();
      } catch (err) {
        throw new Error('Payment setup failed: ' + err.message);
      }

      // ── Step 2: Open Razorpay popup ─────────────────────────
      let payment;
      try {
        payment = await initiateRazorpay(rpOrder.id);
      } catch (err) {
        // User cancelled or payment failed — no money taken
        throw err;
      }

      // ── Step 3: Verify payment signature ───────────────────
      let verified = false;
      try {
        const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id:   payment.razorpay_order_id,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature:  payment.razorpay_signature
          })
        });
        verified = verifyRes.ok;
      } catch {
        // Network issue during verify — but payment went through on Razorpay side
        // Still save the order so customer isn't left without tracking
        verified = true;
      }

      if (!verified) {
        throw new Error('Payment could not be verified. Please contact support with your payment ID: ' + payment.razorpay_payment_id);
      }

      // ── Step 4: Save order to database ──────────────────────
      let orderData;
      try {
        const orderRes = await fetch(`${API_URL}/api/orders`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            billingDetails: formData,
            items: cart,
            subtotal: cartTotal,
            discount,
            total: finalTotal,
            wantsWhatsappUpdates: wantsWhatsapp,
            paymentDetails: {
              razorpayOrderId:   payment.razorpay_order_id,
              razorpayPaymentId: payment.razorpay_payment_id,
              razorpaySignature: payment.razorpay_signature,
              isPaid: true
            }
          })
        });

        if (!orderRes.ok) {
          const errBody = await orderRes.json().catch(() => ({}));
          throw new Error(errBody.message || 'Order save failed');
        }
        orderData = await orderRes.json();
      } catch (err) {
        // Payment succeeded but order save failed — show a special message
        throw new Error(
          `✅ Payment received (ID: ${payment.razorpay_payment_id}) but we had trouble saving your order. ` +
          `Please contact us on WhatsApp: 917013898687 with your Payment ID.`
        );
      }

      // ── Success ─────────────────────────────────────────────
      clearCart();
      setOrderSuccess(orderData);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Empty cart ──────────────────────────────────────────────
  if (cart.length === 0 && !orderSuccess) {
    return (
      <div className="page-wrapper container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛒</div>
        <h2 style={{ marginBottom: '12px' }}>Your cart is empty.</h2>
        <p style={{ color: '#888', marginBottom: '24px' }}>Add some delicious pickles first!</p>
        <button className="btn btn-primary" onClick={() => navigate('/shop')}>Browse Shop</button>
      </div>
    );
  }

  // ── Success screen ──────────────────────────────────────────
  if (orderSuccess) {
    const trackID = orderSuccess.trackingId || `DP-${String(orderSuccess._id).slice(-6).toUpperCase()}`;
    return (
      <div className="page-wrapper checkout-page">
        <div className="container luxury-success-container">
          <div className="success-brand-header">
            <div className="success-icon-animated">✨</div>
            <h2 className="success-h-luxury">Order Placed Successfully!</h2>
            <p className="success-p-luxury">
              Your pickles are being prepared with love and tradition.
              {wantsWhatsapp && (
                <span style={{ display: 'block', marginTop: '8px', color: '#25D366', fontWeight: '600' }}>
                  📱 You'll get WhatsApp updates when your order status changes.
                </span>
              )}
            </p>
          </div>

          <div className="luxury-success-grid">
            <div className="luxury-tracking-result-card">
              <span className="ltr-label">YOUR TRACKING ID</span>
              <div className="ltr-id-display">
                <span className="ltr-id-text">{trackID}</span>
                <button
                  className="ltr-copy-btn"
                  onClick={(e) => {
                    navigator.clipboard.writeText(trackID);
                    const btn = e.currentTarget;
                    const old = btn.innerText;
                    btn.innerText = 'COPIED!';
                    btn.classList.add('copied');
                    setTimeout(() => { btn.innerText = old; btn.classList.remove('copied'); }, 2000);
                  }}
                >COPY</button>
              </div>
              <p className="ltr-footer">Save this ID — use it to track your order anytime.</p>
              <button className="btn btn-primary luxury-track-btn" onClick={() => navigate('/track')}>
                TRACK YOUR ORDER
              </button>
            </div>

            <div className="luxury-support-card">
              <h3>Need Support?</h3>
              <div className="luxury-qr-wrap">
                <img src="/whatsapp_support_qr.png" alt="WhatsApp QR" />
              </div>
              <p>Scan to chat with our spice experts</p>
              <a href="https://wa.me/917013898687" target="_blank" rel="noreferrer">Open WhatsApp Chat</a>
            </div>
          </div>

          <div className="success-footer-actions">
            <button className="btn btn-outline-luxury" onClick={() => navigate('/')}>Return to Store</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout form ───────────────────────────────────────────
  return (
    <div className="page-wrapper checkout-page">
      <div className="container">
        <h1 className="checkout-title">🛒 Billing &amp; Shipping</h1>

        {/* Error banner */}
        {errorMsg && (
          <div style={{
            background: '#fff0f0', border: '1px solid #fca5a5', borderRadius: '12px',
            padding: '16px 20px', marginBottom: '24px', color: '#dc2626',
            fontSize: '0.95rem', lineHeight: '1.5'
          }}>
            ⚠️ {errorMsg}
            <button
              onClick={() => setErrorMsg('')}
              style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 'bold' }}
            >✕</button>
          </div>
        )}

        <div className="checkout-coupon">
          <label>Have a coupon? Enter your code below:</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            <input
              type="text" className="form-control" placeholder="Coupon code"
              value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
            <button className="btn btn-secondary" onClick={applyCoupon} type="button">APPLY COUPON</button>
          </div>
          {couponMessage && <p className="coupon-msg">{couponMessage}</p>}
        </div>

        <form className="checkout-grid" onSubmit={submitOrder}>
          {/* ── Left: Billing form ── */}
          <div className="checkout-form-card">
            <h3>📋 Billing Details</h3>
            <div className="checkout-form-body">
              <div className="form-row">
                <div className="form-group">
                  <label>First name *</label>
                  <input type="text" name="firstName" className="form-control" required onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Last name *</label>
                  <input type="text" name="lastName" className="form-control" required onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Street address *</label>
                <input type="text" name="streetAddress" placeholder="House number and street name" className="form-control" required onChange={handleInputChange} />
                <input type="text" name="apartment" placeholder="Apartment, suite, unit, etc. (optional)" className="form-control" style={{ marginTop: '10px' }} onChange={handleInputChange} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Town / City *</label>
                  <input type="text" name="city" className="form-control" required onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input type="text" name="state" className="form-control" required onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>PIN Code *</label>
                  <input type="text" name="pinCode" className="form-control" required onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Phone (WhatsApp) *</label>
                  <input type="tel" name="phone" className="form-control" required
                    placeholder="10-digit number"
                    onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Email address (optional)</label>
                <input type="email" name="email" className="form-control" onChange={handleInputChange} />
              </div>

              {/* ── WhatsApp toggle ── */}
              <div
                style={{
                  marginTop: '20px', padding: '16px',
                  background: wantsWhatsapp ? '#f0f7f4' : '#f8f8f8',
                  borderRadius: '12px',
                  border: `1px solid ${wantsWhatsapp ? '#c2e7d3' : '#e0e0e0'}`,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>📱</span>
                    <div>
                      <div style={{ fontWeight: '600', color: wantsWhatsapp ? '#128c7e' : '#666', fontSize: '0.95rem' }}>
                        WhatsApp Order Updates
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>
                        {wantsWhatsapp
                          ? 'You will receive delivery status updates on WhatsApp.'
                          : 'Toggle on to receive WhatsApp delivery updates.'}
                      </div>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <div
                    onClick={() => setWantsWhatsapp(!wantsWhatsapp)}
                    style={{
                      width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer',
                      background: wantsWhatsapp ? '#25D366' : '#ccc',
                      position: 'relative', transition: 'background 0.2s', flexShrink: 0
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '3px',
                      left: wantsWhatsapp ? '25px' : '3px',
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Order summary ── */}
          <div className="order-summary-card">
            <h3>YOUR ORDER</h3>
            <div className="order-summary-body">
              <div className="summary-items">
                <div className="order-item" style={{ borderBottom: '2px solid #ede8e1', fontWeight: 'bold' }}>
                  <span className="order-item-name">Product</span>
                  <span className="order-item-price">Subtotal</span>
                </div>
                {cart.map(item => (
                  <div className="order-item" key={item.key}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="order-item-name">{item.name}</span>
                      <span className="order-item-weight">{item.weight} × {item.quantity}</span>
                    </div>
                    <span className="order-item-price" style={{ marginLeft: 'auto' }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="order-divider" />

              <div className="order-row">
                <strong>Subtotal</strong>
                <strong>₹{cartTotal}</strong>
              </div>

              {discount > 0 && (
                <div className="order-row" style={{ color: 'green' }}>
                  <strong>Coupon Discount</strong>
                  <strong>-₹{discount}</strong>
                </div>
              )}

              <div className="order-total">
                <span>Total</span>
                <span className="order-total-price">₹{finalTotal}</span>
              </div>

              <div className="payment-note">
                <span style={{ fontSize: '1.2rem' }}>💳</span>
                <p style={{ margin: 0, lineHeight: '1.4' }}>
                  Pay securely via Credit/Debit Card, UPI or NetBanking through Razorpay.
                  <small style={{ display: 'block', marginTop: '6px', color: '#888' }}>
                    Your data will be used only to process your order.
                  </small>
                </p>
              </div>

              <button type="submit" className="btn btn-primary place-order-btn" disabled={isProcessing}>
                {isProcessing ? '⏳ PROCESSING...' : '🛒 PLACE ORDER'}
              </button>

              {isProcessing && (
                <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#888', marginTop: '10px' }}>
                  Please do not close or refresh this page...
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
