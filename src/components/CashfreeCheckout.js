'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { load } from '@cashfreepayments/cashfree-js';

export default function CashfreeCheckout({ buttonText, onSuccess, amount = 99 }) {
  const { user, verifyToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const displayCashfree = async () => {
    if (!user) {
      alert("Please login first to subscribe.");
      return;
    }

    setLoading(true);

    try {
      // 1. Call our local Next.js API route to generate a Cashfree session ID
      const subscriptionRes = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: user.username,
          email: user.email || `${user.username}@example.com`,
          id: user.id,
          amount: amount
        })
      });
      const subscriptionData = await subscriptionRes.json();

      if (!subscriptionRes.ok || !subscriptionData.payment_session_id) {
        alert(subscriptionData.message || 'Failed to create subscription session with Cashfree.');
        setLoading(false);
        return;
      }

      // 2. Load the Cashfree SDK
      const cashfree = await load({
        mode: "sandbox",
      });

      // 3. Configure Checkout Options
      const checkoutOptions = {
        paymentSessionId: subscriptionData.payment_session_id,
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
          alert(`Payment successful! Welcome to Premium.`);
          await verifyToken(user.token); // Refresh user status
          if (onSuccess) onSuccess();
        }
      });

    } catch (err) {
      console.error(err);
      alert('Network error while starting checkout.');
    } finally {
      setLoading(false);
    }
  };

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
