import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PicklesAPI } from '../api';
import PickleCard from '../components/PickleCard';
import logoUrl from '../assets/logo.png';
import screenshotImg from '../assets/hero.png';
import './Home.css';

const WHY_US = [
  { icon: '🏡', title: 'Homemade & Fresh', desc: 'Crafted in small batches using time-honoured family recipes with the finest seasonal ingredients.' },
  { icon: '✅', title: 'Authentic Andhra Taste', desc: 'True traditional Telugu flavours — bold, tangy, spicy, and absolutely irresistible.' },
  { icon: '🚚', title: 'Pan India Delivery', desc: 'Delivered safely to your doorstep anywhere in India, packed fresh to preserve flavour.' },
  { icon: '🌿', title: 'Zero Preservatives', desc: '100% natural — no artificial preservatives, colours, or flavour enhancers. Ever.' },
  { icon: '💎', title: 'Premium Ingredients', desc: 'Only the finest cold-pressed oils, hand-picked spices, and seasonal fresh produce.' },
  { icon: '🌶️', title: 'Spice For Everyone', desc: 'From mild to extra-hot — we have the perfect spice level for every palate.' },
];

const PROCESS = [
  { icon: '🌾', title: 'Source Fresh', desc: 'Handpick the freshest seasonal produce from trusted local farmers.' },
  { icon: '🧂', title: 'Blend Spices', desc: 'Ancient spice blends ground fresh the traditional Andhra way.' },
  { icon: '🫙', title: 'Pickle with Love', desc: 'Each jar is crafted by hand, slow-marinated for maximum flavour.' },
  { icon: '🚚', title: 'Deliver Fresh', desc: 'Packed securely and shipped straight to your door.' },
];

const REVIEWS = [
  { text: 'The Mango Avakaya is absolutely divine! Takes me back to my grandmother\'s kitchen. Authentic Andhra flavours, every single time.', name: 'Priya Reddy', loc: 'Hyderabad', rating: 5 },
  { text: 'Ordered the prawn pickle — absolutely phenomenal! The spice is perfect and quality is unmatched. My whole family loved it!', name: 'Kiran Naidu', loc: 'Vijayawada', rating: 5 },
  { text: 'Best homemade pickles I\'ve ever had. The garlic pickle is my all-time favourite. Fast shipping and beautifully packed!', name: 'Sunitha Rao', loc: 'Bangalore', rating: 5 },
];

export default function Home() {
  const [bestsellers, setBestsellers] = useState([]);
  const [vegPickles, setVegPickles] = useState([]);
  const [nonVegPickles, setNonVegPickles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      PicklesAPI.getAll({ bestseller: 'true' }),
      PicklesAPI.getAll({ category: 'veg' }),
      PicklesAPI.getAll({ category: 'non-veg' }),
    ]).then(([bs, veg, nonVeg]) => {
      setBestsellers(bs.slice(0, 4));
      setVegPickles(veg.slice(0, 4));
      setNonVegPickles(nonVeg.slice(0, 4));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <main className="home-page page-wrapper">

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-bg-elements">
          <span className="hero-leaf leaf-1">🌿</span>
          <span className="hero-leaf leaf-2">🌶️</span>
          <span className="hero-leaf leaf-3">🧄</span>
          <span className="hero-leaf leaf-4">🍋</span>
          <span className="hero-leaf leaf-5">🌿</span>
        </div>
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-badge">🏆 Andhra's Favourite Homemade Pickles</span>
            <h1 className="hero-title">
              Dhakshitha
              <span className="brand-highlight">Pickles</span>
            </h1>
            <p className="hero-tagline">❤️ Homemade with Love, Packed with Taste!</p>
            <p className="hero-desc">
              Authentic Andhra style pickles — Veg &amp; Non-Veg — crafted from traditional recipes
              with premium ingredients. No preservatives. Pure flavour. Delivered to your door!
            </p>
            <div className="hero-ctas">
              <Link to="/shop" className="btn btn-red">🛒 Shop All Pickles</Link>
              <a href="https://wa.me/917731824686?text=Hi! I'd like to order pickles." target="_blank" rel="noreferrer" className="btn btn-wa">
                📱 Order on WhatsApp
              </a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><strong>500+</strong><span>Happy Customers</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>15+</strong><span>Varieties</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>100%</strong><span>Natural</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>0</strong><span>Preservatives</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-jar-container">
              <div className="hero-circle-bg" />
              <img src={logoUrl} alt="Dhakshitha Pickles" style={{ width:'100%', height:'100%', objectFit:'contain', position:'relative', zIndex:2 }} />
              <span className="floating-item fi-1">🌶️</span>
              <span className="floating-item fi-2">🧄</span>
              <span className="floating-item fi-3">🍋</span>
              <span className="floating-item fi-4">🌿</span>
            </div>
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 64" xmlns="http://www.w3.org/2000/svg">
            <path fill="#ffffff" d="M0,32 C480,64 960,0 1440,32 L1440,64 L0,64 Z" />
          </svg>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="trust-strip">
        <div className="container">
          <div className="trust-grid">
            {[
              { icon: '🏡', t: 'Homemade & Fresh',    s: 'Small batch, made with love' },
              { icon: '✅', t: 'Authentic Taste',      s: 'Traditional Andhra recipes' },
              { icon: '🚚', t: 'Pan India Delivery',   s: 'Fast & safely packed' },
              { icon: '🌿', t: 'Zero Preservatives',   s: '100% natural ingredients' },
            ].map((f, i) => (
              <div key={i} className="trust-item">
                <span className="trust-icon">{f.icon}</span>
                <div className="trust-text">
                  <strong>{f.t}</strong>
                  <span>{f.s}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BESTSELLERS ── */}
      <section className="bestsellers-section">
        <div className="container">
          <div className="sec-hd center">
            <span className="eyebrow eyebrow-gold">⭐ Customer Favourites</span>
            <h2 className="section-title section-title-underline">Our Best Sellers</h2>
            <p className="section-sub">Most loved pickles by our customers</p>
          </div>
          {loading ? <div className="spinner" /> : (
            <>
              <div className="products-grid">
                {bestsellers.map(p => <PickleCard key={p._id} pickle={p} />)}
              </div>
              <div className="view-all-wrap">
                <Link to="/shop?bestseller=true" className="btn btn-outline">View All Bestsellers →</Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── SCREENSHOT / STORE PREVIEW BANNER ── */}
      <section className="screenshot-banner">
        <div className="container">
          <div className="screenshot-inner">
            <div className="screenshot-text">
              <span className="eyebrow">🛒 Full Online Store</span>
              <h2>Browse Our <span>Complete</span> Collection</h2>
              <p>Explore all our veg &amp; non-veg pickles, filter by category, check spice levels, and order directly — all from one beautiful store.</p>
              <div className="screenshot-btns">
                <Link to="/shop" className="btn btn-red">🛒 Visit Store</Link>
                <a href="https://wa.me/917731824686?text=Hi! I'd like to order pickles." target="_blank" rel="noreferrer" className="btn btn-outline-white">📱 WhatsApp Order</a>
              </div>
            </div>
            <div className="screenshot-img-col">
              <div className="screenshot-img-frame">
                <img src={screenshotImg} alt="Dhakshitha Pickles Store" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NON-VEG ── */}
      <section className="nonveg-section">
        <span className="section-deco deco-tr">🍗</span>
        <div className="container">
          <div className="section-row-header">
            <div className="sec-hd">
              <span className="eyebrow">🔴 Non-Vegetarian</span>
              <h2 className="section-title section-title-underline">Non-Veg Pickles</h2>
              <p className="section-sub">Bold, fiery &amp; deeply flavourful — premium non-veg picks</p>
            </div>
            <Link to="/shop?category=non-veg" className="view-all-link">View All →</Link>
          </div>
          {loading ? <div className="spinner" /> : (
            <div className="products-grid">
              {nonVegPickles.map(p => <PickleCard key={p._id} pickle={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── VEG ── */}
      <section className="veg-section">
        <span className="section-deco deco-bl">🥦</span>
        <div className="container">
          <div className="section-row-header">
            <div className="sec-hd">
              <span className="eyebrow eyebrow-green">🟢 Pure Vegetarian</span>
              <h2 className="section-title section-title-underline" style={{color:'var(--green)'}}>Veg Pickle Collection</h2>
              <p className="section-sub">Rich, tangy &amp; spicy — handcrafted veg pickles</p>
            </div>
            <Link to="/shop?category=veg" className="view-all-link view-all-link-green">View All →</Link>
          </div>
          {loading ? <div className="spinner" /> : (
            <div className="products-grid">
              {vegPickles.map(p => <PickleCard key={p._id} pickle={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="why-section">
        <div className="container">
          <div className="sec-hd center">
            <span className="eyebrow">💡 Why Dhakshitha</span>
            <h2 className="section-title section-title-underline">Why Choose Our Pickles?</h2>
            <p className="section-sub">We believe great pickles come from great ingredients and even greater love</p>
          </div>
          <div className="why-grid">
            {WHY_US.map((w, i) => (
              <div key={i} className="why-card">
                <span className="why-icon">{w.icon}</span>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="process-section">
        <div className="container">
          <div className="sec-hd center">
            <span className="eyebrow eyebrow-green">🔄 Our Process</span>
            <h2 className="section-title section-title-underline">From Farm to Your Table</h2>
            <p className="section-sub">Every jar carries the love of a meticulous 4-step process</p>
          </div>
          <div className="process-steps">
            <div className="process-connector" />
            {PROCESS.map((s, i) => (
              <div key={i} className="process-step">
                <div className="step-num">{i + 1}</div>
                <div className="step-icon">{s.icon}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="reviews-section">
        <div className="container">
          <div className="sec-hd center">
            <span className="eyebrow">💬 Customer Reviews</span>
            <h2 className="section-title section-title-underline">What Our Customers Say</h2>
            <p className="section-sub">Real reviews from happy pickle lovers across India</p>
          </div>
          <div className="reviews-grid">
            {REVIEWS.map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-stars">{'⭐'.repeat(r.rating)}</div>
                <p className="review-text">"{r.text}"</p>
                <div className="review-author">
                  <div className="review-avatar">{r.name[0]}</div>
                  <div>
                    <div className="review-name">{r.name}</div>
                    <div className="review-loc">📍 {r.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Taste Authentic Andhra Pickles?</h2>
          <p>Order online or reach us directly on WhatsApp. Fast delivery across India!</p>
          <div className="cta-btns">
            <Link to="/shop" className="btn btn-red">🛒 Shop All Pickles</Link>
            <a href="https://wa.me/917731824686?text=Hi! I'd like to order pickles." target="_blank" rel="noreferrer" className="btn btn-wa">
              📱 Order on WhatsApp
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
