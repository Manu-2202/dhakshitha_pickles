import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './AdminLogin.css';

export default function AdminLogin() {
  const [secretKey, setSecretKey] = useState('');
  const [show, setShow]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const { adminLogin } = useAuth();
  const navigate       = useNavigate();

  const handleKeySubmit = async (e) => {
    e.preventDefault();
    if (!secretKey.trim()) { setError('Please enter your authentication key.'); return; }
    setLoading(true); setError('');
    try {
      await adminLogin(secretKey);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid authentication key.');
    } finally { setLoading(false); }
  };

  return (
    <main className="admin-login-page page-wrapper">
      <div className="al-container">
        <div className="al-card">
          <div className="al-logo">
            <div className="al-logo-img-wrap">
              <img src={logo} alt="Dhakshitha Pickles" className="al-logo-img" />
            </div>
            <h1 className="al-logo-name">Dhakshitha Pickles</h1>
            <p className="al-logo-sub">Admin Portal</p>
          </div>
          <div className="al-divider" />
          <h2 className="al-title">🔐 Admin Login</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleKeySubmit}>
            <div className="form-group">
              <label htmlFor="secretKey">Authentication Key</label>
              <div className="al-input-wrap">
                <span className="al-input-icon">🔑</span>
                <input
                  id="secretKey"
                  type={show ? 'text' : 'password'}
                  value={secretKey}
                  onChange={e => setSecretKey(e.target.value)}
                  className="form-control al-input"
                  placeholder="Enter admin secret key..."
                  autoComplete="off"
                />
                <button type="button" className="al-show-btn" onClick={() => setShow(!show)}>
                  {show ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary al-submit" disabled={loading}>
              {loading ? '⏳ Verifying...' : '🔓 Login to Admin Panel'}
            </button>
          </form>

          <div className="al-back">
            <Link to="/">← Back to Store</Link>
          </div>
          <div className="al-security-note">
            🔒 This area is restricted to authorised administrators only.
          </div>
        </div>
      </div>
    </main>
  );
}
