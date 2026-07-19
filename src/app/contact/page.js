'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
    };

    // Since this is a static app (Capacitor), we cannot use local Next.js API routes.
    // Instead, we use Web3Forms (a free service) to collect submissions and email them to you.
    // Get your free access key at https://web3forms.com/ and replace 'YOUR_ACCESS_KEY_HERE'
    data.access_key = '6207e080-d3d5-4b61-96ec-679c5ccafd1e';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Something went wrong');
      }

      setSuccess(true);
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="single-post animate-fade-in">
      <div className="post-container">
        <Link href="/" className="back-link">
          &larr; Back to home
        </Link>
        
        <header className="post-header">
          <h1 className="post-title">నన్ను సంప్రదించండి</h1>
        </header>

        <div className="post-content support-content">
          <p>నమస్కారం!</p>
          
          <p>నా బ్లాగ్ చదువుతున్నందుకు ధన్యవాదాలు. మీకు ఏవైనా సందేహాలు ఉన్నా, నా రచనల గురించి మీ అభిప్రాయాలు పంచుకోవాలనుకున్నా, లేదా నాతో మాట్లాడాలనుకున్నా, కింద ఉన్న వివరాల ద్వారా నన్ను సంప్రదించవచ్చు.</p>
          
          {success && (
            <div style={{ padding: '16px', backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', borderRadius: '8px', color: '#16a34a', marginTop: '16px' }}>
              సందేశం పంపబడింది. (Message sent successfully!)
            </div>
          )}

          {error && (
            <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '8px', color: '#dc2626', marginTop: '16px' }}>
              Error: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="name" style={{ fontWeight: '500' }}>పేరు (Name)</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="మీ పేరు..." 
                required
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--card-bg)', 
                  color: 'var(--text-color)',
                  fontFamily: 'inherit',
                  outline: 'none'
                }} 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="email" style={{ fontWeight: '500' }}>ఈమెయిల్ (Email)</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="మీ ఈమెయిల్..." 
                required
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--card-bg)', 
                  color: 'var(--text-color)',
                  fontFamily: 'inherit',
                  outline: 'none'
                }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="phone" style={{ fontWeight: '500' }}>ఫోన్ నంబర్ (Phone) - ఐచ్ఛికం (Optional)</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                placeholder="మీ ఫోన్ నంబర్..." 
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--card-bg)', 
                  color: 'var(--text-color)',
                  fontFamily: 'inherit',
                  outline: 'none'
                }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="message" style={{ fontWeight: '500' }}>సందేశం (Message)</label>
              <textarea 
                id="message" 
                name="message" 
                rows="5" 
                placeholder="మీ సందేశం ఇక్కడ రాయండి..." 
                required
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--card-bg)', 
                  color: 'var(--text-color)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical'
                }} 
              />
            </div>

            <button 
              type="submit" 
              className="support-btn" 
              disabled={loading}
              style={{ 
                border: 'none', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                alignSelf: 'flex-start', 
                marginTop: '8px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'పంపుతోంది...' : 'పంపండి (Submit)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
