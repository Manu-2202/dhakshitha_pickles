import React from 'react';
import AdminLayout from '../components/AdminLayout';

export default function WhatsAppConnect() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '16px', maxWidth: '600px', margin: '40px auto', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📱</div>
        <h2 style={{ color: '#128c7e', marginBottom: '16px' }}>WhatsApp Linking Moved</h2>
        <p style={{ color: '#555', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '20px' }}>
          We have upgraded the WhatsApp bot connection method to use <strong>8-Digit Pairing Codes</strong> instead of QR Codes to make it faster and prevent timeouts!
        </p>
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', textAlign: 'left', display: 'inline-block' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>To link your bot now:</h4>
          <ol style={{ margin: 0, paddingLeft: '20px', color: '#444', lineHeight: '1.6' }}>
            <li>Log out of this Admin Dashboard.</li>
            <li>On the Admin Login page, click the <strong>WhatsApp Link</strong> tab.</li>
            <li>Enter your phone number and hit Send.</li>
            <li>Use the 8-digit code to link your phone!</li>
          </ol>
        </div>
      </div>
  );
}
