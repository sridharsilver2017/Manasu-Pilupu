'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block', 
          width: '40px', 
          height: '40px', 
          border: '3px solid var(--border-color)', 
          borderTopColor: 'var(--primary-color)', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="profile-container animate-fade-in" style={{
      maxWidth: '600px',
      margin: '80px auto',
      padding: '0 20px',
    }}>
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center'
      }}>
        
        <div style={{
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
          color: 'white',
          fontSize: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          fontWeight: 'bold',
          boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)'
        }}>
          {user.username.charAt(0).toUpperCase()}
        </div>

        <h1 style={{ 
          fontSize: '2rem', 
          marginBottom: '8px', 
          fontWeight: '700',
          background: 'linear-gradient(135deg, var(--text-color), var(--primary-color))', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent'
        }}>
          {user.username}
        </h1>
        
        <div style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 16px',
          borderRadius: '20px',
          background: user.is_premium ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: user.is_premium ? '#10b981' : '#ef4444',
          fontWeight: 'bold',
          marginBottom: '32px',
          border: `1px solid ${user.is_premium ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          {user.is_premium && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          )}
          {user.is_premium ? 'Premium Member' : 'Free Member'}
        </div>

        {!user.is_premium && (
          <div style={{ marginBottom: '32px', padding: '24px', background: 'var(--bg-color)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-color)' }}>Upgrade to Premium</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
              Unlock unlimited access to all articles and support our work!
            </p>
            <Link href="/pricing" style={{
              display: 'inline-block',
              padding: '12px 28px',
              background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
              color: '#fff',
              borderRadius: '10px',
              fontWeight: 'bold',
              textDecoration: 'none',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
              transition: 'all 0.3s ease'
            }}>
              View Pricing Plans
            </Link>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginTop: '16px' }}>
          <button 
            onClick={handleLogout}
            style={{
              padding: '12px 32px',
              background: 'transparent',
              border: '2px solid var(--text-muted)',
              color: 'var(--text-color)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              opacity: 0.8
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = 1;
              e.currentTarget.style.borderColor = 'var(--text-color)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = 0.8;
              e.currentTarget.style.borderColor = 'var(--text-muted)';
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
