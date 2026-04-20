import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './Navbar.css';

export default function Navbar() {
  const { cartCount } = useCart();
  const { isAdmin, adminLogout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    adminLogout();
    navigate('/');
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="announce-bar">
        <div className="marquee">
          <span>🌶️ Homemade with Love, Packed with Taste!</span>
          <span>🚚 Free Shipping on orders above ₹999 in AP & Telangana</span>
          <span>📞 Call / WhatsApp: 7731824686</span>
          <span>✅ No Preservatives | 100% Natural Ingredients</span>
          <span>🏆 Authentic Andhra Style Pickles Since 2020</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner container">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <img src={logo} alt="Dhakshitha Pickles Logo" className="logo-img" />
          </Link>

          {/* Desktop Nav Links */}
          <ul className="nav-links">
            <li><NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink></li>
            <li className="has-dropdown" onMouseEnter={() => setShopOpen(true)} onMouseLeave={() => setShopOpen(false)}>
              <span className="nav-link">Shop By Category ▾</span>
              {shopOpen && (
                <div className="dropdown-menu">
                  <Link to="/shop" className="dropdown-item" onClick={() => setShopOpen(false)}>
                    <span>🛒</span> All Pickles
                  </Link>
                  <Link to="/shop?category=veg" className="dropdown-item veg" onClick={() => setShopOpen(false)}>
                    <span className="veg-dot">🟢</span> Veg Pickles
                  </Link>
                  <Link to="/shop?category=non-veg" className="dropdown-item nonveg" onClick={() => setShopOpen(false)}>
                    <span>🔴</span> Non-Veg Pickles
                  </Link>
                  <Link to="/shop?bestseller=true" className="dropdown-item" onClick={() => setShopOpen(false)}>
                    <span>⭐</span> Best Sellers
                  </Link>
                </div>
              )}
            </li>
            <li><NavLink to="/shop" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Shop All</NavLink></li>
            <li><NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>About Us</NavLink></li>
            <li><NavLink to="/track" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Track Order</NavLink></li>
            <li><NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Contact</NavLink></li>
          </ul>

          {/* Actions */}
          <div className="nav-actions">
            <a href="https://wa.me/917731824686" target="_blank" rel="noreferrer" className="nav-wa-btn">
              <span className="wa-icon">📱</span> 
              <span className="wa-text">Order on WhatsApp</span>
            </a>

            <Link to="/cart" className="nav-cart">
              <span className="cart-icon">🛒</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mobile-menu">
            <Link to="/" className="mob-link" onClick={() => setMenuOpen(false)}>🏠 Home</Link>
            <Link to="/shop" className="mob-link" onClick={() => setMenuOpen(false)}>🛒 Shop All Pickles</Link>
            <Link to="/shop?category=veg" className="mob-link veg" onClick={() => setMenuOpen(false)}>🟢 Veg Pickles</Link>
            <Link to="/shop?category=non-veg" className="mob-link nonveg" onClick={() => setMenuOpen(false)}>🔴 Non-Veg Pickles</Link>
            <Link to="/about" className="mob-link" onClick={() => setMenuOpen(false)}>ℹ️ About Us</Link>
            <Link to="/track" className="mob-link" onClick={() => setMenuOpen(false)}>🚚 Track Order</Link>
            <Link to="/contact" className="mob-link" onClick={() => setMenuOpen(false)}>📞 Contact</Link>
            <Link to="/cart" className="mob-link" onClick={() => setMenuOpen(false)}>🛒 Cart ({cartCount})</Link>
            <a href="https://wa.me/917731824686" className="mob-link whatsapp" target="_blank" rel="noreferrer">📱 Order on WhatsApp</a>
            {isAdmin && (
              <>
                <Link to="/admin" className="mob-link admin" onClick={() => setMenuOpen(false)}>📊 Admin Dashboard</Link>
                <button className="mob-link logout-btn" onClick={() => { handleLogout(); setMenuOpen(false); }}>🚪 Logout</button>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
