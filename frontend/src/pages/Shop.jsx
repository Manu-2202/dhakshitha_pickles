import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PicklesAPI } from '../api';
import PickleCard from '../components/PickleCard';
import './Shop.css';

export default function Shop() {
  const [pickles, setPickles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || 'all';
  const bestseller = searchParams.get('bestseller') === 'true';

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== 'all') params.category = category;
    if (bestseller) params.bestseller = true;

    PicklesAPI.getAll(params)
      .then(data => setPickles(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, bestseller]);

  const filtered = pickles.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const setFilter = (cat) => {
    if (cat === 'bestseller') setSearchParams({ bestseller: 'true' });
    else if (cat === 'all') setSearchParams({});
    else setSearchParams({ category: cat });
  };

  const activeTab = bestseller ? 'bestseller' : category;

  return (
    <main className="page-wrapper shop-page">
      <div className="shop-header">
        <div className="container">
          <h1 className="shop-title">🫙 Our Pickles</h1>
          <p className="shop-subtitle">Handcrafted Andhra style pickles — fresh, authentic, and full of flavor</p>
          <div className="breadcrumb"><a href="/">Home</a> › Shop All Pickles</div>
        </div>
      </div>

      <div className="container shop-body">
        <div className="shop-search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search pickles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="shop-search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <div className="filter-tabs">
          {[
            { key: 'all', label: '🛒 All Pickles' },
            { key: 'veg', label: '🟢 Veg Pickles' },
            { key: 'non-veg', label: '🔴 Non-Veg Pickles' },
            { key: 'bestseller', label: '⭐ Best Sellers' },
          ].map(f => (
            <button
              key={f.key}
              className={`filter-tab ${activeTab === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="shop-count">
          {!loading && <span>Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? 'pickle' : 'pickles'}</span>}
        </div>

        {loading ? (
          <div className="spinner" />
        ) : filtered.length > 0 ? (
          <div className="products-grid">
            {filtered.map(p => <PickleCard key={p._id} pickle={p} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🫙</div>
            <h3>No pickles found</h3>
            <p>Try a different search or category</p>
          </div>
        )}
      </div>

      <div className="shop-wa-banner">
        <div className="container">
          <span>📱 Can't find what you're looking for? Order directly via WhatsApp!</span>
          <a href="https://wa.me/917731824686?text=Hi! I'd like to order pickles." target="_blank" rel="noreferrer" className="btn btn-whatsapp">
            Order on WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
