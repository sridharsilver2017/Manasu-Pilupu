'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { load } from '@cashfreepayments/cashfree-js';

export default function CashfreeCheckout({ buttonText, onSuccess, amount = 99, planId = 'premium_monthly_99' }) {
  const { user, verifyToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const displayCashfree = async () => {
    if (!user) {
      if (!showGuestForm) {
        setShowGuestForm(true);
        return;
      }
      if (!guestName || !guestEmail) {
        alert("Please enter your name and email to proceed.");
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Call our WordPress API route to generate a Cashfree session ID
      const subscriptionRes = await fetch('https://dev-sridhar-silver.pantheonsite.io/wp-json/mp-subs/v1/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: user ? user.username : guestName,
          email: user ? (user.email || `${user.username}@example.com`) : guestEmail,
          id: user ? user.id : 'GUEST',
          amount: amount,
          plan_id: planId
        })
      });
      const subscriptionData = await subscriptionRes.json();

      if (!subscriptionRes.ok || !subscriptionData.subscription_session_id) {
        const backendError = subscriptionData.message || subscriptionData.error || 'Failed to create subscription session with Cashfree.';
        alert(`Backend Error: ${backendError}`);
        setLoading(false);
        return;
      }

      // 2. Load the Cashfree SDK
      const cashfree = await load({
        mode: "sandbox",
      });

      // 3. Configure Checkout Options
      const checkoutOptions = {
        subscriptionSessionId: subscriptionData.subscription_session_id,
        redirectTarget: "_modal", // Open in a modal
      };

      // 4. Trigger the Checkout
      cashfree.checkout(checkoutOptions).then(async (result) => {
        if (result.error) {
          console.error("Payment failed or modal closed:", result.error);
          alert(result.error.message || "Payment cancelled or failed.");
        }
        
        if (result.paymentDetails) {
          console.log("Payment completed:", result.paymentDetails.paymentMessage);
          alert(`Payment successful! Welcome to Premium. Check your email for login details.`);
          if (user) {
            await verifyToken(user.token); // Refresh user status
          }
          if (onSuccess) onSuccess();
        }
      });

    } catch (err) {
      console.error(err);
      let errMsg = err.message || err.toString();
      let errStack = err.stack ? `\nStack: ${err.stack}` : '';
      let jsonErr = '';
      try { jsonErr = `\nJSON: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`; } catch(e) {}
      
      alert(`Error starting checkout: ${errMsg}${errStack}${jsonErr}`);
    } finally {
      setLoading(false);
    }
  };

  if (showGuestForm && !user) {
    return (
      <div style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        padding: '24px',
        borderRadius: '16px',
        textAlign: 'left',
        marginTop: '20px'
      }}>
        <h4 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Enter details to subscribe</h4>
        <input 
          type="text" 
          placeholder="Full Name" 
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
        />
        <input 
          type="email" 
          placeholder="Email Address" 
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowGuestForm(false)}
            style={{ padding: '12px 20px', background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-color)', borderRadius: '8px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            onClick={displayCashfree}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, var(--primary-color), #c084fc)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              flex: 1
            }}
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={displayCashfree}
      disabled={loading}
      style={{
        padding: '16px 32px',
        background: 'linear-gradient(135deg, var(--primary-color), #c084fc)',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)',
        transition: 'transform 0.2s',
        opacity: loading ? 0.7 : 1
      }}
      onMouseEnter={(e) => {
        if (!loading) e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        if (!loading) e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {loading ? 'Processing...' : (buttonText || 'Subscribe Now')}
    </button>
  );
}
