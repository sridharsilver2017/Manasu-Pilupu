'use client';

import { useState } from 'react';
import Link from 'next/link';
import CashfreeCheckout from '@/components/CashfreeCheckout';
import { useAuth } from '@/context/AuthContext';

export default function PremiumPage() {
  const [isYearly, setIsYearly] = useState(false);
  const { user, loading } = useAuth();

  const monthlyPrice = 99;
  const yearlyPrice = 950; // roughly 20% off 99 * 12

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

  return (
    <div className="premium-page animate-fade-in" style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '16px', 
          fontWeight: '800',
          background: 'linear-gradient(135deg, var(--text-color), var(--primary-color))', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent'
        }}>
          Unlock Premium
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Get unlimited access to all articles, support our work, and read without interruptions.
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '12px',
        marginBottom: '40px' 
      }}>
        <span style={{ fontWeight: !isYearly ? 'bold' : 'normal', color: !isYearly ? 'var(--text-color)' : 'var(--text-muted)' }}>Monthly</span>
        
        <button 
          onClick={() => setIsYearly(!isYearly)}
          style={{
            width: '60px',
            height: '32px',
            borderRadius: '16px',
            background: isYearly ? 'var(--primary-color)' : 'var(--border-color)',
            border: 'none',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.3s'
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: '4px',
            left: isYearly ? '32px' : '4px',
            transition: 'left 0.3s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }} />
        </button>
        
        <span style={{ fontWeight: isYearly ? 'bold' : 'normal', color: isYearly ? 'var(--text-color)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Yearly 
          <span style={{ 
            background: 'linear-gradient(135deg, #10b981, #34d399)', 
            color: '#fff', 
            fontSize: '0.75rem', 
            padding: '2px 8px', 
            borderRadius: '10px',
            fontWeight: 'bold'
          }}>Save 20%</span>
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '2px solid var(--primary-color)',
          borderRadius: '24px',
          padding: '40px',
          width: '100%',
          maxWidth: '450px',
          boxShadow: '0 20px 40px rgba(79, 70, 229, 0.15), 0 0 0 1px inset rgba(255,255,255,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Top highlight bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, var(--primary-color), #c084fc)' }} />

          <h2 style={{ fontSize: '1.8rem', marginBottom: '10px', textAlign: 'center' }}>Premium Membership</h2>
          
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', marginBottom: '30px' }}>
            <span style={{ fontSize: '3rem', fontWeight: 'bold' }}>₹{isYearly ? yearlyPrice : monthlyPrice}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>/{isYearly ? 'year' : 'month'}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
            {[
              'Unlimited access to all articles',
              'Ad-free reading experience',
              'Support independent writing',
              'Early access to new content'
            ].map((benefit, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span style={{ fontSize: '1.05rem', color: 'var(--text-color)' }}>{benefit}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            {user?.is_premium ? (
              <div style={{
                padding: '16px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                borderRadius: '12px',
                fontWeight: 'bold'
              }}>
                You are already a Premium Member!
              </div>
            ) : user ? (
              <CashfreeCheckout 
                buttonText={`Subscribe for ₹${isYearly ? yearlyPrice : monthlyPrice}`} 
                amount={isYearly ? yearlyPrice : monthlyPrice} 
              />
            ) : (
              <Link href="/login?redirect=/premium" style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
                color: '#fff',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textDecoration: 'none',
                boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)'
              }}>
                Login to Subscribe
              </Link>
            )}
          </div>

        </div>
      </div>
      
    </div>
  );
}
