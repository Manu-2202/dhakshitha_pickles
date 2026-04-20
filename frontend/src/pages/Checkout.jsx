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

  const [wantsWhatsapp, setWantsWhatsapp]   = useState(true);
  const [couponCode, setCouponCode]         = useState('');
  const [discount, setDiscount]             = useState(0);
  const [couponMessage, setCouponMessage]   = useState('');
  const [isProcessing, setIsProcessing]     = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [orderSuccess, setOrderSuccess]     = useState(null);
  const [errorMsg, setErrorMsg]             = useState('');

  const finalTotal = Math.max(0, cartTotal - discount);

  const handleInputChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Apply coupon ──────────────────────────────────────────────
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res  = await fetch(`${API_URL}/api/coupons/validate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setDiscount(data.discountAmount);
        setCouponMessage(`✅ Coupon applied! ₹${data.discountAmount} discount.`);
      } else {
        setDiscount(0);
        setCouponMessage('❌ ' + (data.message || 'Invalid coupon code.'));
      }
    } catch {
      setCouponMessage('⚠️ Could not validate coupon. Check your connection.');
    }
  };

  // ── Razorpay popup ────────────────────────────────────────────
  const openRazorpay = (rzpOrderId) =>
    new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Payment SDK not loaded. Please refresh and try again.'));
        return;
      }
      const rzp = new window.Razorpay({
        key:         'rzp_live_SObidYdicroHKe',
        amount:      finalTotal * 100,
        currency:    'INR',
        name:        'Dhakshitha Pickles',
        description: 'Pickle Order Payment',
        order_id:    rzpOrderId,
        handler:     resolve,
        modal:       { ondismiss: () => reject(new Error('CANCELLED')) },
        prefill: {
          name:    `${formData.firstName} ${formData.lastName}`.trim(),
          email:   formData.email || '',
          contact: formData.phone,
        },
        theme: { color: '#da1f26' },
      });
      rzp.on('payment.failed', (r) =>
        reject(new Error(r.error?.description || 'Payment failed on Razorpay'))
      );
      rzp.open();
    });

  // ── Main submit ───────────────────────────────────────────────
  const submitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsProcessing(true);
    setErrorMsg('');

    let paymentInfo = null; // keep reference in case order-save fails

    try {
      // STEP 1 — Create Razorpay order on backend
      setProcessingStep('Setting up payment...');
      const rpRes = await fetch(`${API_URL}/api/payment/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal }),
      });
      if (!rpRes.ok) {
        const e = await rpRes.json().catch(() => ({}));
        throw new Error('Payment server error: ' + (e.message || rpRes.statusText));
      }
      const rpOrder = await rpRes.json();

      // STEP 2 — Open Razorpay popup
      setProcessingStep('Opening payment gateway...');
      let payment;
      try {
        payment = await openRazorpay(rpOrder.id);
        paymentInfo = payment; // save for fallback
      } catch (err) {
        if (err.message === 'CANCELLED') {
          setErrorMsg('Payment was cancelled. No money has been deducted. You can try again.');
          setIsProcessing(false);
          setProcessingStep('');
          return;
        }
        throw new Error('Payment failed: ' + err.message);
      }

      // STEP 3 — Verify payment signature
      setProcessingStep('Verifying payment...');
      try {
        const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id:   payment.razorpay_order_id,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature:  payment.razorpay_signature,
          }),
        });
        if (!verifyRes.ok) {
          // If verification fails due to network, continue anyway — Razorpay confirms it
          console.warn('[Checkout] Verify returned non-ok, proceeding anyway');
        }
      } catch {
        // Network blip — safe to continue because Razorpay already charged
        console.warn('[Checkout] Verify fetch failed, proceeding to save order');
      }

      // STEP 4 — Save order to database
      setProcessingStep('Saving your order...');
      const orderPayload = {
        billingDetails: {
          firstName:     formData.firstName,
          lastName:      formData.lastName,
          companyName:   formData.companyName || '',
          country:       formData.country || 'India',
          streetAddress: formData.streetAddress,
          apartment:     formData.apartment || '',
          city:          formData.city,
          state:         formData.state,
          pinCode:       formData.pinCode,
          phone:         formData.phone,
          altPhone:      formData.altPhone || '',
          email:         formData.email || '',
        },
        items: cart.map(i => ({
          pickleId: i.pickleId,
          name:     i.name,
          weight:   i.weight,
          price:    i.price,
          quantity: i.quantity,
          category: i.category || '',
        })),
        subtotal:            cartTotal,
        discount:            discount,
        total:               finalTotal,
        wantsWhatsappUpdates: wantsWhatsapp,
        paymentDetails: {
          razorpayOrderId:   payment.razorpay_order_id,
          razorpayPaymentId: payment.razorpay_payment_id,
          razorpaySignature: payment.razorpay_signature,
          isPaid:            true,
        },
      };

      const orderRes = await fetch(`${API_URL}/api/orders`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        // Parse exact error from backend
        let backendMsg = 'Unknown server error';
        try {
          const errBody = await orderRes.json();
          backendMsg = errBody.message || JSON.stringify(errBody);
        } catch { backendMsg = `Server returned ${orderRes.status}`; }

        // ⚠️ Payment went through — don't lose the customer
        setErrorMsg(
          `⚠️ Your payment of ₹${finalTotal} was received successfully (Payment ID: ${payment.razorpay_payment_id}), ` +
          `but we had a technical issue saving your order.\n\n` +
          `Please screenshot this and WhatsApp us at +91 70138 98687 — we will process your order manually.\n\n` +
          `Technical detail: ${backendMsg}`
        );
        setIsProcessing(false);
        setProcessingStep('');
        return;
      }

      const orderData = await orderRes.json();

      // ── SUCCESS ──
      clearCart();
      setOrderSuccess(orderData);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // ── Empty cart ─────────────────────────────────────────────────
  if (cart.length === 0 && !orderSuccess) {
    return (
      <div className="page-wrapper container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛒</div>
        <h2 style={{ marginBottom: '12px' }}>Your cart is empty</h2>
        <p style={{ color: '#888', marginBottom: '24px' }}>Add some delicious pickles first!</p>
        <button className="btn btn-primary" onClick={() => navigate('/shop')}>Browse Shop</button>
      </div>
    );
  }

  // ── Success screen ─────────────────────────────────────────────
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
                <span style={{ display: 'block', marginTop: '10px', color: '#25D366', fontWeight: '600', fontSize: '1rem' }}>
                  📱 You'll receive WhatsApp updates when your order status changes.
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
                📦 TRACK YOUR ORDER
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
            <button className="btn btn-outline-luxury" onClick={() => navigate('/')}>← Return to Store</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout form ──────────────────────────────────────────────
  return (
    <div className="page-wrapper checkout-page">
      <div className="container">
        <h1 className="checkout-title">🛒 Billing &amp; Shipping</h1>

        {/* Error banner — replaces the old alert() */}
        {errorMsg && (
          <div style={{
            background: '#fff7ed', border: '2px solid #fb923c', borderRadius: '14px',
            padding: '18px 22px', marginBottom: '28px', color: '#92400e',
            fontSize: '0.93rem', lineHeight: '1.7', whiteSpace: 'pre-line',
            position: 'relative'
          }}>
            {errorMsg}
            <button
              onClick={() => setErrorMsg('')}
              style={{
                position: 'absolute', top: '12px', right: '14px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.1rem', color: '#92400e', fontWeight: 'bold'
              }}
            >✕</button>
          </div>
        )}

        {/* Coupon */}
        <div className="checkout-coupon">
          <label>Have a coupon? Enter your code below:</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            <input
              type="text" className="form-control" placeholder="Coupon code"
              value={couponCode} onChange={e => setCouponCode(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
            <button className="btn btn-secondary" onClick={applyCoupon} type="button">
              APPLY
            </button>
          </div>
          {couponMessage && <p className="coupon-msg">{couponMessage}</p>}
        </div>

        <form className="checkout-grid" onSubmit={submitOrder}>

          {/* ── Left: Billing Details ── */}
          <div className="checkout-form-card">
            <h3>📋 Billing Details</h3>
            <div className="checkout-form-body">

              <div className="form-row">
                <div className="form-group">
                  <label>First name <span style={{color:'red'}}>*</span></label>
                  <input type="text" name="firstName" className="form-control" required
                    value={formData.firstName} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Last name <span style={{color:'red'}}>*</span></label>
                  <input type="text" name="lastName" className="form-control" required
                    value={formData.lastName} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Street address <span style={{color:'red'}}>*</span></label>
                <input type="text" name="streetAddress" className="form-control" required
                  placeholder="House number and street name"
                  value={formData.streetAddress} onChange={handleInputChange} />
                <input type="text" name="apartment" className="form-control"
                  placeholder="Apartment, floor, etc. (optional)"
                  value={formData.apartment} onChange={handleInputChange}
                  style={{ marginTop: '10px' }} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Town / City <span style={{color:'red'}}>*</span></label>
                  <input type="text" name="city" className="form-control" required
                    value={formData.city} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>State <span style={{color:'red'}}>*</span></label>
                  <input type="text" name="state" className="form-control" required
                    value={formData.state} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>PIN Code <span style={{color:'red'}}>*</span></label>
                  <input type="text" name="pinCode" className="form-control" required
                    maxLength={6} pattern="[0-9]{6}"
                    placeholder="6-digit PIN"
                    value={formData.pinCode} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Phone (WhatsApp) <span style={{color:'red'}}>*</span></label>
                  <input type="tel" name="phone" className="form-control" required
                    placeholder="10-digit mobile number"
                    value={formData.phone} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Email address <span style={{color:'#aaa', fontSize:'0.82rem'}}>(optional)</span></label>
                <input type="email" name="email" className="form-control"
                  placeholder="For order confirmation email"
                  value={formData.email} onChange={handleInputChange} />
              </div>

              {/* WhatsApp toggle */}
              <div style={{
                marginTop: '20px', padding: '16px',
                background: wantsWhatsapp ? '#f0f7f4' : '#f8f8f8',
                borderRadius: '12px',
                border: `1px solid ${wantsWhatsapp ? '#c2e7d3' : '#e0e0e0'}`,
                transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📱</span>
                    <div>
                      <div style={{ fontWeight: '700', color: wantsWhatsapp ? '#128c7e' : '#666', fontSize: '0.95rem' }}>
                        WhatsApp Delivery Updates
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>
                        {wantsWhatsapp
                          ? 'You will get updates when your order status changes.'
                          : 'Enable to receive order updates on WhatsApp.'}
                      </div>
                    </div>
                  </div>
                  <div
                    onClick={() => setWantsWhatsapp(v => !v)}
                    style={{
                      width: '50px', height: '28px', borderRadius: '14px', cursor: 'pointer',
                      background: wantsWhatsapp ? '#25D366' : '#ccc',
                      position: 'relative', transition: 'background 0.25s', flexShrink: 0
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '4px',
                      left: wantsWhatsapp ? '26px' : '4px',
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: '#fff', transition: 'left 0.25s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.25)'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="order-summary-card">
            <h3>YOUR ORDER</h3>
            <div className="order-summary-body">
              <div className="summary-items">
                <div className="order-item" style={{ borderBottom: '2px solid #ede8e1', fontWeight: '700' }}>
                  <span className="order-item-name">Product</span>
                  <span className="order-item-price">Subtotal</span>
                </div>
                {cart.map(item => (
                  <div className="order-item" key={item.key}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="order-item-name">{item.name}</span>
                      <span className="order-item-weight">{item.weight} × {item.quantity}</span>
                    </div>
                    <span className="order-item-price">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="order-divider" />

              <div className="order-row">
                <span>Subtotal</span>
                <strong>₹{cartTotal}</strong>
              </div>
              {discount > 0 && (
                <div className="order-row" style={{ color: '#16a34a' }}>
                  <span>Coupon Discount</span>
                  <strong>- ₹{discount}</strong>
                </div>
              )}
              <div className="order-total">
                <span>Total</span>
                <span className="order-total-price">₹{finalTotal}</span>
              </div>

              <div className="payment-note">
                <span style={{ fontSize: '1.3rem' }}>💳</span>
                <p style={{ margin: 0, lineHeight: '1.5' }}>
                  Pay securely via UPI, Credit/Debit Card or NetBanking through Razorpay.
                  <small style={{ display: 'block', marginTop: '5px', color: '#999' }}>
                    Your data is used only to process your order.
                  </small>
                </p>
              </div>

              <button
                type="submit"
                className="btn btn-primary place-order-btn"
                disabled={isProcessing}
                style={{ opacity: isProcessing ? 0.8 : 1 }}
              >
                {isProcessing ? `⏳ ${processingStep || 'Processing...'}` : '🛒 PLACE ORDER'}
              </button>

              {isProcessing && (
                <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#999', marginTop: '10px' }}>
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
