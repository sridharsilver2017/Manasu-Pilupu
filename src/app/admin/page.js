'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, CheckCircle, Shield } from 'lucide-react';

// Replace with actual WP API url
const WP_API_BASE_URL = 'https://dev-sridhar-silver.pantheonsite.io/wp-json/mp-maintenance/v1';

export default function AdminPage() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // Fetch current status on load
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch(`${WP_API_BASE_URL}/status?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setIsMaintenance(data.isMaintenance === true || String(data.isMaintenance).toLowerCase() === 'true');
        }
      } catch (err) {
        console.error("Failed to fetch maintenance status", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (WP_API_BASE_URL && WP_API_BASE_URL.includes('http')) {
      fetchStatus();
    } else {
      setIsLoading(false);
      setStatus({ type: 'warning', message: 'Please update WP_API_BASE_URL in src/app/admin/page.js' });
    }
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!password) {
      setStatus({ type: 'error', message: 'Please enter the admin password.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${WP_API_BASE_URL}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password,
          isMaintenance: isMaintenance
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({ type: 'success', message: 'Settings saved successfully!' });
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to save settings. Incorrect password?' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Please check your connection.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg-gradient)',
      fontFamily: 'var(--font-body), sans-serif'
    }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-glass), 0 20px 40px rgba(0,0,0,0.1)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovering ? 'translateY(-4px)' : 'translateY(0)'
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Header Area */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-color), #c084fc)',
          padding: '40px 30px',
          textAlign: 'center',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background elements */}
          <div style={{
            position: 'absolute', top: '-50%', left: '-20%', width: '150%', height: '150%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none'
          }} />
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            marginBottom: '16px',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }}>
            <Shield size={36} color="#fff" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '8px', letterSpacing: '-0.5px' }}>Admin Portal</h1>
          <p style={{ fontSize: '0.95rem', opacity: 0.9, fontWeight: '400' }}>Manage global website configuration</p>
        </div>

        {/* Content Area */}
        <div style={{ padding: '32px' }}>
          
          {status.message && (
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'fadeIn 0.3s ease',
              background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : status.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
              border: `1px solid ${status.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : status.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)'}`,
              color: status.type === 'error' ? '#ef4444' : status.type === 'success' ? '#22c55e' : '#eab308'
            }}>
              {status.type === 'error' ? <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} /> : <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />}
              <span style={{ fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.4' }}>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Custom Toggle Switch */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              transition: 'var(--transition)'
            }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-color)' }}>
                  Maintenance Mode
                </label>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Take the site offline for visitors</span>
              </div>
              
              <div 
                onClick={() => !isLoading && setIsMaintenance(!isMaintenance)}
                style={{
                  width: '56px',
                  height: '32px',
                  background: isMaintenance ? 'var(--primary-color)' : 'var(--border-color)',
                  borderRadius: '100px',
                  position: 'relative',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s ease',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  left: isMaintenance ? '28px' : '4px',
                  width: '24px',
                  height: '24px',
                  background: '#fff',
                  borderRadius: '50%',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-color)', marginLeft: '4px' }}>
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to authenticate"
                required
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-color)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)';
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
                color: '#fff',
                fontSize: '1.05rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 8px 16px rgba(79, 70, 229, 0.25)',
                marginTop: '8px'
              }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(0)')}
              onMouseDown={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(1px)')}
              onMouseUp={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            >
              {isLoading ? (
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  border: '3px solid rgba(255,255,255,0.3)', 
                  borderTop: '3px solid #fff', 
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <>
                  <Save size={20} />
                  Save Configuration
                </>
              )}
            </button>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          </form>
        </div>
      </div>
    </div>
  );
}
