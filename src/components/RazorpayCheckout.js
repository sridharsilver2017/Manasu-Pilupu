'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default function RazorpayCheckout({ buttonText, onSuccess }) {
  const { user, verifyToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const displayRazorpay = async () => {
    if (!user) {
      alert("Please login first to subscribe.");
      // Ideally redirect to a login modal or page here
      return;
    }

    setLoading(true);
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      // Create Subscription on WordPress backend
      const subscriptionRes = await fetch('https://dev-sridhar-silver.pantheonsite.io/wp-json/mp-subs/v1/create-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      const subscriptionData = await subscriptionRes.json();

      if (!subscriptionRes.ok) {
        alert(subscriptionData.message || 'Failed to create subscription');
        setLoading(false);
        return;
      }

      const options = {
        key: subscriptionData.key_id,
        subscription_id: subscriptionData.subscription_id,
        name: 'మనసు పిలుపు (Manasu Pilupu)',
        description: 'Premium Monthly Subscription',
        handler: async function (response) {
          // Razorpay returns razorpay_payment_id, razorpay_subscription_id, razorpay_signature
          // We don't strictly need to do anything here because our webhook handles the activation,
          // but we can poll for the updated status or just optimistically update.
          alert(`Payment successful! Welcome to Premium. Payment ID: ${response.razorpay_payment_id}`);
          await verifyToken(user.token); // Refresh user status
          if (onSuccess) onSuccess();
        },
        prefill: {
          name: user.username,
          email: `${user.username}@example.com`,
          contact: ''
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert('Network error while starting checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={displayRazorpay}
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
