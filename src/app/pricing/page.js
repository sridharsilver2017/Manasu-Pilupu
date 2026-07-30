'use client';

import { useState } from 'react';
import RazorpayCheckout from '@/components/RazorpayCheckout';
import { useAuth } from '@/context/AuthContext';
import { Check, Star, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const { user, login, register, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // login or register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await login(username, password);
      } else {
        await register(username, email, password);
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div style={{ padding: '60px 20px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-color)' }}>
          Unlock Premium Access
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Support our independent writing and get unlimited access to all exclusive articles, stories, and deep dives.
        </p>
      </div>

      {!loading && !user && (
        <div style={{ 
          background: 'var(--card-bg)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-color)', 
          borderRadius: '24px', 
          padding: '40px',
          width: '100%',
          maxWidth: '450px',
          boxShadow: 'var(--shadow-glass)',
          marginBottom: '60px'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', textAlign: 'center' }}>
            {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          
          {authError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', fontSize: '1rem' }}
            />
            {authMode === 'register' && (
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', fontSize: '1rem' }}
              />
            )}
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', fontSize: '1rem' }}
            />
            
            <button 
              type="submit" 
              disabled={authLoading}
              style={{ 
                padding: '14px', 
                borderRadius: '12px', 
                background: 'var(--primary-color)', 
                color: '#fff', 
                border: 'none', 
                fontSize: '1.05rem',
                fontWeight: 'bold',
                cursor: authLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px'
              }}
            >
              {authMode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
              {authLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <span 
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {authMode === 'login' ? 'Register here' : 'Login here'}
            </span>
          </p>
        </div>
      )}

      {user && user.is_premium && (
        <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '24px', maxWidth: '600px' }}>
          <Star size={48} color="#22c55e" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '2rem', color: '#22c55e', marginBottom: '12px' }}>You are a Premium Member!</h2>
          <p style={{ color: 'var(--text-color)', fontSize: '1.1rem' }}>Thank you for your support. You have unlimited access to all content.</p>
          <Link href="/blog" style={{ display: 'inline-block', marginTop: '24px', padding: '12px 24px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '100px', fontWeight: 'bold' }}>
            Read Articles
          </Link>
        </div>
      )}

      {user && !user.is_premium && (
        <div style={{
          background: 'linear-gradient(to bottom, var(--card-bg), rgba(255,255,255,0.02))',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--primary-color)',
          borderRadius: '32px',
          padding: '48px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 20px 40px rgba(79, 70, 229, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ribbon */}
          <div style={{ position: 'absolute', top: '24px', right: '-32px', background: 'var(--primary-color)', color: '#fff', padding: '8px 40px', transform: 'rotate(45deg)', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>
            BEST VALUE
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>Monthly Plan</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: '500', color: 'var(--text-muted)' }}>₹</span>
              <span style={{ fontSize: '3.5rem', fontWeight: '800', letterSpacing: '-2px' }}>99</span>
              <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>/month</span>
            </div>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['Unlimited access to all premium articles', 'Ad-free reading experience', 'Early access to new content', 'Support independent Telugu writing'].map((feature, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.05rem', color: 'var(--text-color)' }}>
                <div style={{ background: 'rgba(79, 70, 229, 0.1)', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={16} color="var(--primary-color)" />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <RazorpayCheckout buttonText="Subscribe for ₹99/month" />
          </div>
        </div>
      )}

    </div>
  );
}
