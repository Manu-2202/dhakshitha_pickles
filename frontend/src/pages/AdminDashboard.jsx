import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API, { PicklesAPI, OrdersAPI, CouponsAPI, API_URL } from '../api';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { isAdmin, adminLogout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = searchParams.get('tab') || 'products';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [pickles, setPickles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponAmount, setNewCouponAmount] = useState('');
  const [adminsList, setAdminsList] = useState([]);
  const [newAdminKey, setNewAdminKey] = useState('');

  // ── Wake up Render backend ──────────────────────────────────
  useEffect(() => {
    const wakeUp = async () => {
      try { await fetch(`${API_URL}/api/auth/debug`); } catch (_) {}
    };
    wakeUp();
  }, []);

  // ── Modal States ───────────────────────────────────────────
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passData, setPassData] = useState({ oldKey: '', newKey: '', confirmKey: '' });
  const [passLoading, setPassLoading] = useState(false);

  // ── Notification system ───────────────────────────────────────
  const [toasts, setToasts]                 = useState([]);
  const knownOrderIds = useRef(null); 

  const addToast = useCallback((msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 6000);
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newKey !== passData.confirmKey) return alert("New secret keys do not match!");
    setPassLoading(true);
    try {
      await API.post('/auth/change-key', { oldKey: passData.oldKey, newKey: passData.newKey });
      alert("Secret key updated successfully! Logging out...");
      adminLogout();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update secret key");
    } finally { setPassLoading(false); }
  };

  // Poll for data every 20s
  useEffect(() => {
    if (!isAdmin) return;
    const checkData = async () => {
      try {
        const ordersData = await OrdersAPI.getAll();
        const currentIds = new Set(ordersData.map(o => o._id));
        if (knownOrderIds.current !== null) {
          const newOrders = ordersData.filter(o => !knownOrderIds.current.has(o._id));
          if (newOrders.length > 0) {
            newOrders.forEach(o => {
              const name = `${o.billingDetails?.firstName || ''} ${o.billingDetails?.lastName || 'Customer'}`.trim();
              addToast(`📦 New Order from ${name} (₹${o.total})`);
            });
            setOrders(ordersData);
          }
        }
        knownOrderIds.current = currentIds;
      } catch (_) {}
    };
    checkData();
    const interval = setInterval(checkData, 20_000);
    return () => clearInterval(interval);
  }, [isAdmin, addToast]);

  useEffect(() => {
    const t = searchParams.get('tab') || 'products';
    setActiveTab(t);
  }, [searchParams]);

  useEffect(() => { fetchData(); }, [isAdmin, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') setPickles(await PicklesAPI.getAll());
      else if (activeTab === 'orders') setOrders(await OrdersAPI.getAll());
      else if (activeTab === 'admins') {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_URL}/api/auth/admins`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setAdminsList(await res.json());
      }
      else if (activeTab === 'coupons') setCoupons(await CouponsAPI.getAll());
    } catch (err) {
      if (err.response?.status === 401) navigate('/admin/login');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    setDeleting(id);
    try {
      await API.delete(`/pickles/${id}`);
      setPickles(prev => prev.filter(p => p._id !== id));
    } catch (err) { alert('Error deleting'); } finally { setDeleting(null); }
  };

  const filteredPickles = pickles.filter(p => {
    const matchCat = filter === 'all' || p.category === filter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = {
    total: pickles.length,
    veg: pickles.filter(p => p.category === 'veg').length,
    nonVeg: pickles.filter(p => p.category === 'non-veg').length,
    bestsellers: pickles.filter(p => p.isBestseller).length,
  };

  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      const res = await API.put(`/orders/${id}/status`, { status: newStatus });
      const data = res.data;
      fetchData();

      // Show WhatsApp notification result
      const wa = data?._whatsappResult;
      if (wa?.sent)    addToast(`✅ WhatsApp sent to customer for status: ${newStatus}`);
      else if (wa?.skipped) addToast(`ℹ️ WhatsApp skipped — customer opted out`);
      else if (wa?.failed)  addToast(`⚠️ WhatsApp FAILED: ${wa.error || 'Unknown error'}`);
    } catch (err) {
      addToast('❌ Failed to update order status');
      console.error('Status update error:', err);
    }
  };

  const createCoupon = async (e) => {
    e.preventDefault();
    try {
      await API.post('/coupons', { code: newCouponCode, discountAmount: newCouponAmount });
      setNewCouponCode(''); setNewCouponAmount('');
      fetchData();
    } catch (err) { alert('Coupon error: ' + (err.response?.data?.message || err.message)); }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete coupon?')) return;
    try { await API.delete(`/coupons/${id}`); fetchData(); } catch { alert('Failed'); }
  };
  
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminKey) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/auth/add-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newSecretKey: newAdminKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert('New admin added!');
      setNewAdminKey('');
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const STATUS_COLORS = { 'Ordered': '#3b82f6', 'Packed': '#f59e0b', 'Waiting for Transport': '#8b5cf6', 'Out for Delivery': '#f97316', 'Delivered': '#22c55e', 'Cancelled': '#ef4444' };

  return (
    <>
      <div className="dash-main-container fade-in">
        {showPasswordModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card fade-in">
              <h3>Update Secret Key</h3>
              <form onSubmit={handleChangePassword}>
                <div className="form-group"><label>Current Key</label><input type="password" required value={passData.oldKey} onChange={e => setPassData({...passData, oldKey: e.target.value})} /></div>
                <div className="form-group"><label>New Key</label><input type="password" required value={passData.newKey} onChange={e => setPassData({...passData, newKey: e.target.value})} /></div>
                <div className="form-group"><label>Confirm New Key</label><input type="password" required value={passData.confirmKey} onChange={e => setPassData({...passData, confirmKey: e.target.value})} /></div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={passLoading}>{passLoading ? 'Updating...' : 'Update'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <>
            <div className="stats-row">
              {[{ label: 'Total Products', value: stats.total, icon: '🫙', color: '#da1f26' }, { label: 'Veg', value: stats.veg, icon: '🥦', color: '#147238' }, { label: 'Non-Veg', value: stats.nonVeg, icon: '🍗', color: '#c0392b' }, { label: 'Bestsellers', value: stats.bestsellers, icon: '⭐', color: '#d97706' }].map((s, i) => (
                <div key={i} className="stat-card-new" style={{ '--scolor': s.color }}>
                  <div className="scn-icon">{s.icon}</div>
                  <div className="scn-val">{s.value}</div>
                  <div className="scn-label">{s.label}</div>
                  <div className="scn-bar" />
                </div>
              ))}
            </div>
            <div className="dash-controls-new">
              <div className="dcn-search"><span>🔍</span><input type="text" placeholder="Search pickles..." value={search} onChange={e => setSearch(e.target.value)} />{search && <button onClick={() => setSearch('')}>✕</button>}</div>
              <div className="dcn-filters">{['all', 'veg', 'non-veg'].map(f => (<button key={f} className={`dcn-filter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}</button>))}</div>
            </div>
            {loading ? <div className="spinner" /> : (
              <div className="table-card">
                <div className="table-card-header"><h3>All Products</h3><span className="table-count">{filteredPickles.length} items</span></div>
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead><tr><th>Product</th><th>Category</th><th>Prices</th><th>Stock (kg)</th><th>Spice</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>{filteredPickles.map(p => (
                      <tr key={p._id}>
                        <td><div className="prod-cell"><div className="table-img">{p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <span>🫙</span>}</div><div><div className="table-name">{p.name}</div>{p.isBestseller && <span className="badge badge-bestseller">⭐ Bestseller</span>}</div></div></td>
                        <td><span className={`badge ${p.category === 'veg' ? 'badge-veg' : 'badge-nonveg'}`}>{p.category === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}</span></td>
                        <td className="price-cell"><div>250g: <strong>₹{p.price250g}</strong></div><div>500g: <strong>₹{p.price500g}</strong></div><div>1kg: <strong>₹{p.price1kg}</strong></div></td>
                        <td><span className={`stock-weight-pill ${p.stockInKg < 1 ? 'critical' : p.stockInKg < 3 ? 'low' : 'ok'}`}>{p.stockInKg} kg</span></td>
                        <td><span className={`badge badge-spice-${p.spiceLevel}`}>{p.spiceLevel}</span></td>
                        <td><span className={`stock-pill ${p.inStock ? 'in' : 'out'}`}>{p.inStock ? '✓ In Stock' : '✗ Out of Stock'}</span></td>
                        <td><div className="table-actions"><button onClick={() => navigate(`/admin/edit/${p._id}`)} className="action-btn edit">✏️ Edit</button><button className="action-btn delete" onClick={() => handleDelete(p._id, p.name)} disabled={deleting === p._id}>{deleting === p._id ? '⏳' : '🗑️ Delete'}</button></div></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'orders' && (
          loading ? <div className="spinner" /> : (
            <div className="table-card">
              <div className="table-card-header"><h3>Customer Orders</h3><span className="table-count">{orders.length} orders</span></div>
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead><tr><th>Track ID</th><th>Customer</th><th>Delivery Address</th><th>Total</th><th>Payment</th><th>Status</th><th>WhatsApp</th></tr></thead>
                  <tbody>{orders.map(o => {
                    const waIcon = o.wantsWhatsappUpdates
                      ? (o.whatsappStatus === 'sent'    ? '✅ Sent'
                        : o.whatsappStatus === 'failed' ? '❌ Failed'
                        : o.whatsappStatus === 'skipped'? '⏭️ Skipped'
                        : '⏳ Pending')
                      : '🔕 Off';
                    const waColor = o.whatsappStatus === 'sent' ? '#16a34a'
                      : o.whatsappStatus === 'failed' ? '#dc2626' : '#888';
                    return (
                    <tr key={o._id}>
                      <td>
                        <div className="order-id" style={{color: 'var(--primary)', fontWeight: 'bold'}}>
                          {o.trackingId || `DP-${o._id.slice(-4).toUpperCase()}`}
                        </div>
                        <div className="order-date">{new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                      </td>
                      <td><div className="table-name">{o.billingDetails?.firstName} {o.billingDetails?.lastName}</div><div className="order-phone">📱 {o.billingDetails?.phone}</div></td>
                      <td><div className="order-addr">{o.billingDetails?.streetAddress}, {o.billingDetails?.city}, {o.billingDetails?.state}</div></td>
                      <td className="price-cell"><strong>₹{o.total}</strong></td>
                      <td><span className={`stock-pill ${o.paymentDetails?.isPaid ? 'in' : 'out'}`}>{o.paymentDetails?.isPaid ? '✓ Paid' : '⏳ Pending'}</span></td>
                      <td><select value={o.status} onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)} className="status-select" style={{ borderColor: STATUS_COLORS[o.status] || '#ccc' }}>{['Ordered','Packed','Waiting for Transport','Out for Delivery','Delivered','Cancelled'].map(s => (<option key={s} value={s}>{s}</option>))}</select></td>
                      <td><span style={{ fontSize: '0.82rem', color: waColor, fontWeight: '600' }}>{waIcon}</span></td>
                    </tr>
                  )})}</tbody>
                </table>
              </div>
            </div>
          )
        )}
        
        {activeTab === 'coupons' && (
            loading ? <div className="spinner" /> : (
                <div className="coupons-layout">
                <div className="table-card" style={{ flex: 1 }}>
                    <div className="table-card-header"><h3>Active Coupons</h3></div>
                    {coupons.length === 0 ? <div className="empty-state"><h3>No coupons yet</h3></div> : (
                    <div className="dash-table-wrap">
                        <table className="dash-table">
                        <thead><tr><th>Code</th><th>Discount</th><th>Active</th><th>Action</th></tr></thead>
                        <tbody>{coupons.map(c => (
                            <tr key={c._id}>
                            <td><span className="coupon-code">{c.code}</span></td>
                            <td><span className="coupon-amount">-₹{c.discountAmount}</span></td>
                            <td><span className={`stock-pill ${c.isActive ? 'in' : 'out'}`}>{c.isActive ? '✓ Active' : '✗ Inactive'}</span></td>
                            <td><button className="action-btn delete" onClick={() => deleteCoupon(c._id)}>🗑️ Delete</button></td>
                            </tr>
                        ))}</tbody>
                        </table>
                    </div>
                    )}
                </div>
                <div className="coupon-form-card">
                    <h3>🎟️ Create Coupon</h3>
                    <form onSubmit={createCoupon} className="cfcard-form">
                    <div className="form-group"><label>Coupon Code</label><input type="text" className="form-control" required value={newCouponCode} onChange={e => setNewCouponCode(e.target.value.toUpperCase())} placeholder="SUMMER50" /></div>
                    <div className="form-group"><label>Discount (₹)</label><input type="number" className="form-control" required value={newCouponAmount} onChange={e => setNewCouponAmount(e.target.value)} placeholder="50" min="1" /></div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>✅ Create</button>
                    </form>
                </div>
                </div>
            )
        )}

        {activeTab === 'admins' && (
            loading ? <div className="spinner" /> : (
                <div className="coupons-layout fade-in">
                <div className="table-card" style={{ flex: 1 }}>
                    <div className="table-card-header"><h3>Current Admin Sessions</h3></div>
                    <div className="dash-table-wrap">
                    <table className="dash-table">
                        <thead><tr><th>Authentication Key</th><th>Role</th><th>Status</th></tr></thead>
                        <tbody>{adminsList.map((adm, idx) => (
                        <tr key={idx}>
                            <td><code>{adm.secretKey}</code></td>
                            <td><span className="badge badge-veg">System Admin</span></td>
                            <td><span className="status-dot green" /> Active</td>
                        </tr>
                        ))}</tbody>
                    </table>
                    </div>
                </div>
                
                <div className="coupon-form-card">
                    <h3>👥 Add Another Admin</h3>
                    <form onSubmit={handleAddAdmin} className="cfcard-form">
                    <div className="form-group">
                        <label>New Secret Key</label>
                        <input type="password" className="form-control" required value={newAdminKey} onChange={e => setNewAdminKey(e.target.value)} placeholder="Enter key" />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>🚀 Add Admin</button>
                    </form>
                </div>
                </div>
            )
        )}
      </div>

      <div className="toast-stack">
          {toasts.map(t => (
            <div key={t.id} className="admin-toast">
              <span>{t.msg}</span>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>✕</button>
            </div>
          ))}
      </div>
    </>
  );
}
