import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './AdminLayout.css';

export default function AdminLayout({ children, title }) {
  const { adminLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊', exact: true },
    { path: '/admin/add', label: 'Add Pickle', icon: '➕' },
    { path: '/admin?tab=orders', label: 'Orders', icon: '📦', queryTab: 'orders' },
    { path: '/admin?tab=coupons', label: 'Coupons', icon: '🎟️', queryTab: 'coupons' },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path && !location.search;
    if (item.queryTab) return location.search.includes(`tab=${item.queryTab}`);
    return location.pathname === item.path;
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/');
  };

  return (
    <div className="admin-shell">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar-new ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo / Brand */}
        <div className="asn-brand">
          <div className="asn-logo-wrap">
            <img src={logo} alt="Dhakshitha Pickles" className="asn-logo" />
          </div>
          <div className="asn-brand-text">
            <span className="asn-brand-name">Admin Panel</span>
            <span className="asn-brand-sub">Dhakshitha Pickles</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="asn-nav">
          <div className="asn-nav-label">Management</div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`asn-nav-item ${isActive(item) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="asn-item-icon">{item.icon}</span>
              <span className="asn-item-label">{item.label}</span>
              {isActive(item) && <span className="asn-active-dot" />}
            </Link>
          ))}

          {/* Divider */}
          <div className="asn-nav-divider" />
          <div className="asn-nav-label">Quick Actions</div>

          {/* Visit Site */}
          <Link
            to="/"
            className="asn-nav-item asn-visit-btn"
            target="_blank"
            rel="noreferrer"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="asn-item-icon">🌐</span>
            <span className="asn-item-label">Visit Site</span>
            <span className="asn-ext-icon">↗</span>
          </Link>

          {/* Logout */}
          <button
            className="asn-nav-item asn-logout-nav-btn"
            onClick={() => { setSidebarOpen(false); handleLogout(); }}
          >
            <span className="asn-item-icon">🚪</span>
            <span className="asn-item-label">Logout</span>
          </button>
        </nav>

        {/* Bottom admin info */}
        <div className="asn-bottom-info">
          <div className="asn-admin-badge">
            <span className="asn-admin-dot" />
            <span>Admin — Online</span>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="admin-content-wrap">
        {/* Top Bar */}
        <header className="admin-topbar">
          <button className="topbar-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span /><span /><span />
          </button>

          <div className="topbar-title">
            <h1>{title || 'Admin Dashboard'}</h1>
            <div className="topbar-breadcrumb">
              <Link to="/admin">Admin</Link>
              {title && title !== 'Dashboard' && <> › <span>{title}</span></>}
            </div>
          </div>

          <div className="topbar-right">
            <Link to="/" target="_blank" rel="noreferrer" className="topbar-visit-btn">
              🌐 Visit Site
            </Link>
            <Link to="/admin/add" className="topbar-add-btn">
              ➕ Add Pickle
            </Link>
            <button className="topbar-add-admin-btn" onClick={() => navigate('/admin?tab=admins')}>
              👤 Add Admin
            </button>
            <button className="topbar-logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
            <div className="topbar-avatar">A</div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-page-content">
          {children}
        </main>
      </div>
    </div>
  );
}