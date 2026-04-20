import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './PickleCard.css';

const SPICE_LABELS = { mild: '🟡 Mild', medium: '🟠 Medium', hot: '🔴 Hot', 'extra-hot': '🌶️ Extra Hot' };
const SPICE_COLORS = { mild: '#f39c12', medium: '#e67e22', hot: '#c0392b', 'extra-hot': '#8B0000' };

export default function PickleCard({ pickle }) {
  const { addToCart } = useCart();
  const [selectedWeight, setSelectedWeight] = useState('500g');
  const [added, setAdded] = useState(false);

  const weights = [
    { label: '250g', price: pickle.price250g },
    { label: '500g', price: pickle.price500g },
    { label: '1kg', price: pickle.price1kg },
  ];
  const currentPrice = weights.find(w => w.label === selectedWeight)?.price || pickle.price500g;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(pickle, selectedWeight);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="pickle-card">
      {/* Badges */}
      <div className="card-badges-top">
        {pickle.isBestseller && <span className="badge badge-bestseller">⭐ Bestseller</span>}
        <span className={`badge ${pickle.category === 'veg' ? 'badge-veg' : 'badge-nonveg'}`}>
          {pickle.category === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
        </span>
      </div>

      {/* Image */}
      <Link to={`/product/${pickle._id}`} className="card-img-link">
        <div className="card-img-wrap">
          {pickle.imageUrl ? (
            <img src={pickle.imageUrl} alt={pickle.name} className="card-img" loading="lazy" />
          ) : (
            <div className="card-img-placeholder">🫙</div>
          )}
          <div className="card-overlay">
            <span>View Details →</span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="card-body">
        <Link to={`/product/${pickle._id}`}>
          <h3 className="card-name">{pickle.name}</h3>
        </Link>
        <p className="card-desc">{pickle.description.slice(0, 72)}...</p>

        {/* Spice level */}
        <div className="card-spice" style={{ color: SPICE_COLORS[pickle.spiceLevel] }}>
          {SPICE_LABELS[pickle.spiceLevel]}
        </div>

        {/* Weight Selector */}
        <div className="weight-selector">
          {weights.map(w => (
            <button
              key={w.label}
              className={`weight-btn ${selectedWeight === w.label ? 'active' : ''}`}
              onClick={() => setSelectedWeight(w.label)}
            >
              {w.label}
            </button>
          ))}
        </div>

        {/* Price + Add to Cart */}
        <div className="card-footer">
          <div className="card-price">
            <span className="price-symbol">₹</span>
            <span className="price-amount">{currentPrice}</span>
            <span className="price-per">/{selectedWeight}</span>
          </div>
          <button
            className={`add-cart-btn ${added ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={!pickle.inStock}
          >
            {!pickle.inStock ? '⚠️ Out of Stock' : added ? '✓ Added!' : '+ Add to Cart'}
          </button>
        </div>

        {/* WhatsApp Quick Order */}
        <a
          href={`https://wa.me/917731824686?text=Hi! I'd like to order *${pickle.name}* (${selectedWeight}) - ₹${currentPrice}`}
          target="_blank"
          rel="noreferrer"
          className="card-wa-btn"
        >
          📱 Order on WhatsApp
        </a>
      </div>
    </div>
  );
}
