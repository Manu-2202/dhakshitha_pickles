import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { PicklesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './PickleForm.css';

const SPICE_LEVELS = ['mild', 'medium', 'hot', 'extra-hot'];
const SPICE_ICONS = { mild: '🟡', medium: '🟠', hot: '🔴', 'extra-hot': '🌶️' };

const defaultForm = {
  name: '', description: '', category: 'veg',
  price250g: '', price500g: '', price1kg: '',
  stockInKg: 10,
  spiceLevel: 'medium', inStock: true, isBestseller: false,
  ingredients: '', imageUrl: '',
};

export default function PickleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEdit) {
      PicklesAPI.getById(id)
        .then(r => {
          setForm({ ...r.data, stockInKg: r.data.stockInKg ?? 10, price250g: r.data.price250g, price500g: r.data.price500g, price1kg: r.data.price1kg });
          setPreview(r.data.imageUrl);
        })
        .catch(() => navigate('/admin'))
        .finally(() => setFetchLoading(false));
    }
  }, [id, isAdmin]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setForm(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price250g || !form.price500g || !form.price1kg) {
      setError('Please fill all required fields.'); return;
    }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      if (isEdit) {
        await PicklesAPI.update(id, fd);
        setSuccess('✅ Pickle updated successfully!');
      } else {
        await PicklesAPI.create(fd);
        setSuccess('✅ Pickle added successfully!');
        setForm(defaultForm); setPreview(''); setImageFile(null);
      }
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving pickle. Please try again.');
    } finally { setLoading(false); }
  };

  if (fetchLoading) return <div className="spinner" />;

  return (
    <div className="pf-wrapper">
      {/* Back Link */}
      <Link to="/admin" className="pf-back-link">← Back to Dashboard</Link>

      <div className="pf-grid">
        {/* LEFT: Form */}
        <form onSubmit={handleSubmit} className="pf-form-col">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Basic Info */}
          <div className="pf-card">
            <div className="pf-card-header">
              <span className="pf-card-icon">📝</span>
              <h2>Basic Information</h2>
            </div>
            <div className="pf-card-body">
              <div className="form-group">
                <label>Pickle Name <span className="req">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} className="form-control" placeholder="e.g. Mango Avakaya Pickle" required />
              </div>
              <div className="form-group">
                <label>Description <span className="req">*</span></label>
                <textarea name="description" value={form.description} onChange={handleChange} className="form-control" rows={4} placeholder="Describe the taste, recipe, key highlights..." required />
              </div>
              <div className="form-group">
                <label>Ingredients</label>
                <input name="ingredients" value={form.ingredients} onChange={handleChange} className="form-control" placeholder="e.g. Mango, Mustard Seeds, Red Chillies, Sesame Oil, Salt" />
              </div>
            </div>
          </div>

          {/* Category & Spice */}
          <div className="pf-card">
            <div className="pf-card-header">
              <span className="pf-card-icon">🏷️</span>
              <h2>Category & Type</h2>
            </div>
            <div className="pf-card-body">
              <div className="pf-two-col">
                <div className="form-group">
                  <label>Category <span className="req">*</span></label>
                  <select name="category" value={form.category} onChange={handleChange} className="form-control">
                    <option value="veg">🟢 Veg Pickle</option>
                    <option value="non-veg">🔴 Non-Veg Pickle</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Spice Level <span className="req">*</span></label>
                  <select name="spiceLevel" value={form.spiceLevel} onChange={handleChange} className="form-control">
                    {SPICE_LEVELS.map(s => (
                      <option key={s} value={s}>{SPICE_ICONS[s]} {s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pf-toggles">
                <label className="toggle-label">
                  <input type="checkbox" name="inStock" checked={form.inStock} onChange={handleChange} className="toggle-input" />
                  <span className="toggle-ui" />
                  <span>In Stock</span>
                </label>
                <label className="toggle-label">
                  <input type="checkbox" name="isBestseller" checked={form.isBestseller} onChange={handleChange} className="toggle-input" />
                  <span className="toggle-ui" />
                  <span>⭐ Mark as Bestseller</span>
                </label>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="pf-card">
            <div className="pf-card-header">
              <span className="pf-card-icon">💰</span>
              <h2>Pricing (in ₹)</h2>
            </div>
            <div className="pf-card-body">
              <div className="pf-three-col">
                <div className="form-group">
                  <label>250g Price <span className="req">*</span></label>
                  <div className="price-input-wrap">
                    <span className="price-prefix">₹</span>
                    <input type="number" name="price250g" value={form.price250g} onChange={handleChange} className="form-control price-input" placeholder="220" min="0" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>500g Price <span className="req">*</span></label>
                  <div className="price-input-wrap">
                    <span className="price-prefix">₹</span>
                    <input type="number" name="price500g" value={form.price500g} onChange={handleChange} className="form-control price-input" placeholder="420" min="0" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>1kg Price <span className="req">*</span></label>
                  <div className="price-input-wrap">
                    <span className="price-prefix">₹</span>
                    <input type="number" name="price1kg" value={form.price1kg} onChange={handleChange} className="form-control price-input" placeholder="799" min="0" required />
                  </div>
                </div>
              </div>
              
              <div className="form-group" style={{marginTop: '15px'}}>
                 <label>Total Stock Added (in kg) <span className="req">*</span></label>
                 <input type="number" name="stockInKg" value={form.stockInKg} onChange={handleChange} className="form-control" placeholder="10" min="0" step="0.1" required />
              </div>

            </div>
          </div>

          {/* Submit */}
          <div className="pf-submit-row">
            <button type="submit" className="btn btn-primary pf-submit-btn" disabled={loading}>
              {loading ? '⏳ Saving...' : isEdit ? '💾 Update Pickle' : '➕ Add Pickle'}
            </button>
            <Link to="/admin" className="btn btn-outline">Cancel</Link>
          </div>
        </form>

        {/* RIGHT: Image Upload */}
        <div className="pf-image-col">
          <div className="pf-card">
            <div className="pf-card-header">
              <span className="pf-card-icon">📷</span>
              <h2>Product Image</h2>
            </div>
            <div className="pf-card-body">
              {/* Preview */}
              {preview ? (
                <div className="pf-preview-large">
                  <img src={preview} alt="Preview" />
                  <button
                    type="button"
                    className="pf-remove-img"
                    onClick={() => { setPreview(''); setImageFile(null); setForm(p => ({ ...p, imageUrl: '' })); }}
                  >
                    ✕ Remove Image
                  </button>
                </div>
              ) : (
                <div className="pf-placeholder-img">
                  <span>🫙</span>
                  <p>No image selected</p>
                </div>
              )}

              {/* Upload */}
              <div className="form-group">
                <input type="file" accept="image/*" onChange={handleImageChange} className="pf-file-input" id="imageUpload" />
                <label htmlFor="imageUpload" className="pf-file-label">
                  <span>📎 Upload Image File</span>
                  <small>JPG, PNG, WebP — max 5MB</small>
                </label>
              </div>

              <div className="pf-or-divider"><span>or</span></div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={e => { handleChange(e); setPreview(e.target.value); setImageFile(null); }}
                  className="form-control"
                  placeholder="https://example.com/pickle.jpg"
                />
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="pf-tips-card">
            <h4>💡 Tips</h4>
            <ul>
              <li>Use square images (1:1) for best results</li>
              <li>Recommended: 600×600px or larger</li>
              <li>Clear product photo with good lighting</li>
              <li>White or light background preferred</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
