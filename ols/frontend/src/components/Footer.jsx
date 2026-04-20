import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      {/* Trust Badges */}
      <div className="footer-badges">
        <div className="container">
          <div className="badges-row">
            <div className="footer-badge">
              <span className="badge-icon">🏡</span>
              <div>
                <strong>Homemade & Fresh</strong>
                <p>Made in small batches</p>
              </div>
            </div>
            <div className="footer-badge">
              <span className="badge-icon">✅</span>
              <div>
                <strong>Authentic Andhra Taste</strong>
                <p>Traditional recipes</p>
              </div>
            </div>
            <div className="footer-badge">
              <span className="badge-icon">🌿</span>
              <div>
                <strong>No Preservatives</strong>
                <p>100% natural ingredients</p>
              </div>
            </div>
            <div className="footer-badge">
              <span className="badge-icon">🚚</span>
              <div>
                <strong>Pan India Delivery</strong>
                <p>Fast & safe shipping</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <div className="footer-logo">
                <img src={logo} alt="Dhakshitha Pickles Logo" className="logo-img" style={{ height: '70px', filter: 'brightness(1.5)' }} />
              </div>
              <p className="footer-desc">
                Homemade Andhra style pickles crafted with love, tradition, and the finest ingredients.
                No preservatives. Pure taste. Rich flavor!
              </p>
              <div className="footer-contact-info">
                <a href="tel:7731824686" className="footer-phone">📞 7731824686</a>
                <a href="https://wa.me/917731824686" target="_blank" rel="noreferrer" className="footer-wa">
                  📱 WhatsApp Us
                </a>
              </div>
              <div className="footer-timing">
                <span>⏰ Orders: 9 AM – 8 PM | Mon – Sat</span>
              </div>
            </div>

            {/* Shop Links */}
            <div className="footer-col">
              <h4 className="footer-col-title">Quick Shop</h4>
              <ul className="footer-links">
                <li><Link to="/shop">All Pickles</Link></li>
                <li><Link to="/shop?category=veg">Veg Pickles</Link></li>
                <li><Link to="/shop?category=non-veg">Non-Veg Pickles</Link></li>
                <li><Link to="/shop?bestseller=true">Best Sellers</Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="footer-col">
              <h4 className="footer-col-title">Company</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/cart">My Cart</Link></li>
              </ul>
            </div>

            {/* Order via WhatsApp */}
            <div className="footer-col">
              <h4 className="footer-col-title">Order Now</h4>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', marginBottom: '16px' }}>
                Order fresh pickles directly via WhatsApp or call us. Orders & Delivery available Pan India!
              </p>
              <a href="https://wa.me/917731824686?text=Hi! I'd like to order pickles from Dhakshitha Pickles." target="_blank" rel="noreferrer" className="btn btn-whatsapp" style={{ width: '100%', justifyContent: 'center', borderRadius: '10px' }}>
                📱 Order on WhatsApp
              </a>
              <a href="tel:7731824686" className="footer-call-btn">
                📞 Call: 7731824686
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <p>© 2024 Dhakshitha Pickles. All rights reserved. | Made with ❤️ in Andhra Pradesh</p>
            <div className="footer-bottom-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Use</a>
              <a href="#shipping">Shipping Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
