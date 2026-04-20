import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount } = useCart();

  if (cart.length === 0) {
    return (
      <main className="page-wrapper cart-page">
        <div className="container">
          <h1 className="cart-title">🛒 Your Cart</h1>
          <div className="empty-state cart-empty">
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Browse our delicious pickles and add them to your cart!</p>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: '20px' }}>🫙 Shop Pickles</Link>
          </div>
        </div>
      </main>
    );
  }

  const waMessage = cart.map(i => `• ${i.name} (${i.weight}) x${i.quantity} = ₹${i.price * i.quantity}`).join('\n');
  const wa = `https://wa.me/917731824686?text=Hi! I'd like to order from Dhakshitha Pickles:%0A%0A${encodeURIComponent(waMessage)}%0A%0ATotal: ₹${cartTotal}`;

  return (
    <main className="page-wrapper cart-page">
      <div className="container">
        <div className="cart-header-row">
          <h1 className="cart-title">🛒 Your Cart <span className="cart-count-badge">{cartCount} items</span></h1>
          <button className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items-card">
            <div className="cart-card-header">
              <h3>Selected Pickles</h3>
            </div>
            {cart.map(item => (
              <div key={item.key} className="cart-item">
                <div className="cart-item-img">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <span>🫙</span>}
                </div>
                
                <div className="cart-item-info">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <div className="cart-item-meta">
                    <span className={`badge ${item.category === 'veg' ? 'badge-veg' : 'badge-nonveg'}`}>
                      {item.category === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                    </span>
                    <span className="cart-item-weight">⚖️ {item.weight}</span>
                  </div>
                  <div className="cart-item-price-each">₹{item.price} each</div>
                </div>

                <div className="cart-item-controls">
                  <div className="qty-row">
                    <button className="qty-btn" onClick={() => updateQuantity(item.key, item.quantity - 1)}>−</button>
                    <span className="qty-num">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.key, item.quantity + 1)}>+</button>
                  </div>
                  <div className="cart-item-price">₹{item.price * item.quantity}</div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.key)} title="Remove Product">✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary-card">
            <h3>Order Summary</h3>
            <div className="summary-lines">
              {cart.map(item => (
                <div key={item.key} className="summary-row">
                  <span className="summary-item-name">{item.name} ({item.weight}) ×{item.quantity}</span>
                  <span className="summary-item-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="summary-total">
              <span>Grand Total</span>
              <span className="summary-total-price">₹{cartTotal}</span>
            </div>
            
            <p className="summary-note">* Delivery charges may apply based on location</p>

            <div className="cart-summary-actions">
              <Link to="/checkout" className="btn btn-primary checkout-btn">
                Proceed to Checkout 💳
              </Link>
              <a href={wa} target="_blank" rel="noreferrer" className="btn btn-whatsapp wa-checkout-btn">
                📱 Order via WhatsApp
              </a>
              <Link to="/shop" className="btn btn-outline continue-btn">← Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
