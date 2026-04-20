import { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    const msg = `Hi! I'm ${form.name}%0APhone: ${form.phone}%0AEmail: ${form.email}%0AMessage: ${form.message}`;
    window.open(`https://wa.me/917731824686?text=${msg}`, '_blank');
    setSent(true);
  };

  const CONTACT_INFO = [
    { icon: '📞', label: 'Phone / WhatsApp', value: '7731824686', href: 'tel:7731824686' },
    { icon: '📱', label: 'WhatsApp Order', value: 'Tap to chat with us', href: 'https://wa.me/917731824686' },
    { icon: '📍', label: 'Location', value: 'Andhra Pradesh, India', href: null },
    { icon: '⏰', label: 'Order Hours', value: 'Mon – Sat, 9 AM – 8 PM', href: null },
  ];

  return (
    <main className="page-wrapper">
      <div className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Have a question or want to order? We'd love to hear from you!</p>
        </div>
      </div>

      <div className="contact-body">
        <div className="container">
          <div className="contact-grid">
            <div>
              <div className="contact-info-card">
                <h3>📬 Get in Touch</h3>
                {CONTACT_INFO.map((item, i) => (
                  <div key={i} className="contact-item">
                    <div className="contact-item-icon">{item.icon}</div>
                    <div className="contact-item-text">
                      <strong>{item.label}</strong>
                      {item.href
                        ? <span><a href={item.href} target="_blank" rel="noreferrer">{item.value}</a></span>
                        : <span>{item.value}</span>
                      }
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px' }}>
                <a
                  href="https://wa.me/917731824686?text=Hi! I'd like to order pickles."
                  target="_blank" rel="noreferrer"
                  className="btn btn-whatsapp"
                  style={{ width: '100%', justifyContent: 'center', borderRadius: '12px', padding: '16px' }}
                >
                  📱 Order Directly on WhatsApp
                </a>
              </div>
            </div>

            <div className="contact-form-card">
              <h3>💬 Send a Message</h3>
              {sent ? (
                <div className="alert alert-success">
                  ✅ Your message was sent via WhatsApp! We'll respond shortly.
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Your Name</label>
                    <input name="name" value={form.name} onChange={handleChange} className="form-control" placeholder="Your full name" required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input name="phone" value={form.phone} onChange={handleChange} className="form-control" placeholder="Your phone number" />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} className="form-control" placeholder="your@email.com" />
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea name="message" value={form.message} onChange={handleChange} className="form-control" rows={5} placeholder="Tell us what you need — order inquiry, bulk orders, custom request..." required />
                  </div>
                  <button type="submit" className="btn btn-primary contact-submit">
                    📱 Send via WhatsApp
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
