import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PicklesAPI } from '../api';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const SPICE_MAP = { mild: '🟡 Mild', medium: '🟠 Medium', hot: '🔴 Hot', 'extra-hot': '🌶️ Extra Hot' };

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [pickle, setPickle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState('500g');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    PicklesAPI.getById(id)
      .then(data => setPickle(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-wrapper"><div className="spinner" /></div>;
  if (!pickle) return (
    <div className="page-wrapper not-found">
      <h2>Pickle not found</h2>
      <Link to="/shop" className="btn btn-primary">← Back to Shop</Link>
    </div>
  );

  const weights = [
    { label: '250g', price: pickle.price250g },
    { label: '500g', price: pickle.price500g },
    { label: '1kg', price: pickle.price1kg },
  ];
  const currentPrice = weights.find(w => w.label === selectedWeight)?.price || pickle.price500g;

  const handleAddToCart = () => {
    addToCart(pickle, selectedWeight, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="page-wrapper product-detail-page">
      <div className="container">
        <div className="breadcrumb pd-breadcrumb">
          <Link to="/">Home</Link> › <Link to="/shop">Shop</Link> › {pickle.name}
        </div>

        <div className="pd-grid">
          <div className="pd-image-col">
            <div className="pd-img-wrap">
              {pickle.imageUrl ? (
                <img src={pickle.imageUrl} alt={pickle.name} className="pd-img" />
              ) : (
                <div className="pd-img-placeholder">🫙</div>
              )}
              {pickle.isBestseller && <div className="pd-bestseller-badge">⭐ Bestseller</div>}
            </div>
          </div>

          <div className="pd-info-col">
            <div className="pd-badges">
              <span className={`badge ${pickle.category === 'veg' ? 'badge-veg' : 'badge-nonveg'}`}>
                {pickle.category === 'veg' ? '🟢 Pure Veg' : '🔴 Non-Veg'}
              </span>
              <span className="pd-spice">{SPICE_MAP[pickle.spiceLevel]}</span>
            </div>

            <h1 className="pd-name">{pickle.name}</h1>
            <p className="pd-desc">{pickle.description}</p>

            {pickle.ingredients && (
              <div className="pd-ingredients">
                <strong>Ingredients:</strong> {pickle.ingredients}
              </div>
            )}

            <div className="pd-weight-section">
              <p className="pd-label">Select Weight:</p>
              <div className="pd-weight-grid">
                {weights.map(w => (
                  <button
                    key={w.label}
                    className={`pd-weight-btn ${selectedWeight === w.label ? 'active' : ''}`}
                    onClick={() => setSelectedWeight(w.label)}
                  >
                    <span className="w-label">{w.label}</span>
                    <span className="w-price">₹{w.price}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pd-price">
              <span className="pd-price-curr">₹{currentPrice}</span>
              <span className="pd-price-per">per {selectedWeight}</span>
            </div>

            <div className="pd-cart-row">
              <div className="pd-qty">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="qty-btn">−</button>
                <span className="qty-val">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="qty-btn">+</button>
              </div>
              <button
                className={`btn btn-primary pd-add-btn ${added ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={!pickle.inStock}
              >
                {!pickle.inStock ? '⚠️ Out of Stock' : added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
              </button>
            </div>

            <a
              href={`https://wa.me/917731824686?text=Hi! I'd like to order *${pickle.name}* (${selectedWeight} x${qty}) - ₹${currentPrice * qty}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-whatsapp pd-wa-btn"
            >
              📱 Order Directly on WhatsApp
            </a>

            <div className="pd-tags">
              <span>✅ No Preservatives</span>
              <span>🏡 Homemade</span>
              <span>📦 Safely Packed</span>
              <span>🚚 Pan India Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
