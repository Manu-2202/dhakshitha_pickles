import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './About.css';

const VALUES = [
  { icon: '🌿', title: 'No Preservatives', desc: 'We never add artificial preservatives, colours, or chemicals — just pure natural ingredients.' },
  { icon: '🏡', title: 'Homemade Craft', desc: 'Every jar is handcrafted in small batches, ensuring freshness and personal attention to quality.' },
  { icon: '🌶️', title: 'Authentic Recipes', desc: 'Our recipes have been perfected over generations — rooted deeply in Andhra culinary tradition.' },
  { icon: '💎', title: 'Premium Ingredients', desc: 'We source the finest seasonal produce, cold-pressed oils, and hand-ground spices for every batch.' },
  { icon: '🚚', title: 'Reliable Delivery', desc: 'We deliver across India with secure, tamper-proof packaging to ensure your jar arrives perfect.' },
  { icon: '❤️', title: 'Made with Love', desc: 'Every jar carries the warmth and care of a mother\'s kitchen — you can taste it in every bite.' },
];

export default function About() {
  return (
    <main className="page-wrapper">
      {/* Hero */}
      <div className="about-hero">
        <div className="container">
          <h1>Our Story</h1>
          <p>From a family kitchen in Andhra Pradesh to doorsteps across India — the story of Dhakshitha Pickles</p>
        </div>
      </div>

      {/* Story */}
      <section className="about-story section">
        <div className="container">
          <div className="about-story-grid">
            <div className="story-img-wrap">
              <img src={logo} alt="Dhakshitha Pickles" style={{ width: '80%', objectFit: 'contain' }} />
            </div>
            <div className="story-content">
              <h2>A Tradition of Taste</h2>
              <p>
                Dhakshitha Pickles was born from a simple but powerful idea — that the best flavours are always homemade.
                What started as a family tradition of making pickles for our own household soon grew into something much bigger
                when friends, neighbours, and relatives began requesting jars for themselves.
              </p>
              <p>
                Our recipes are rooted in authentic Andhra culinary heritage, passed down through generations. We use only
                the finest seasonal produce — raw mangoes, garlic, gongura, prawns — combined with freshly ground spices
                and cold-pressed sesame oil.
              </p>
              <p>
                Every jar we produce is made in small batches, slow-marinated the traditional way, and packed with care.
                No shortcuts. No preservatives. Just bold, real, honest flavour.
              </p>
              <Link to="/shop" className="btn btn-primary" style={{ marginTop: '8px' }}>🫙 Explore Our Pickles</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">💡 Our Values</span>
            <h2 className="section-title">What We Stand For</h2>
            <p className="section-subtitle">Six principles that guide every jar we make</p>
          </div>
          <div className="values-grid">
            {VALUES.map((v, i) => (
              <div key={i} className="value-card">
                <div className="value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1e0c04, #3a1a0c)', padding: '70px 20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'white', marginBottom: '12px' }}>
          Taste Andhra's Finest Pickles
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '28px', fontSize: '0.95rem' }}>
          Order fresh from our kitchen, delivered to your doorstep.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/shop" className="btn btn-primary">🛒 Shop All Pickles</Link>
          <a href="https://wa.me/917731824686" target="_blank" rel="noreferrer" className="btn btn-whatsapp">📱 WhatsApp Order</a>
        </div>
      </section>
    </main>
  );
}
