'use client';
import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function CopyUpi({ upiId }) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef();

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'upi-qr-code.png';
      link.href = url;
      link.click();
    }
  };

  const upiUrl = `upi://pay?pa=${upiId}&pn=Sridhar`;

  return (
    <div style={{ padding: '32px', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', margin: '32px 0', textAlign: 'center' }}>
      
      {/* QR Code Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
        <div ref={qrRef} style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', display: 'inline-block', boxShadow: 'var(--shadow-md)' }}>
          <QRCodeCanvas value={upiUrl} size={180} level={"H"} />
        </div>
        <button 
          onClick={handleDownloadQr}
          style={{
            marginTop: '20px',
            padding: '10px 24px',
            backgroundColor: 'var(--primary-color)',
            color: 'var(--bg-color)',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'var(--transition)'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
          onMouseOut={(e) => e.currentTarget.style.opacity = 1}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download QR
        </button>
      </div>

      <div style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span>నా UPI ID: {upiId} (GPay / PhonePe / Paytm)</span>
        <button 
          onClick={handleCopy}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: copied ? '#e6f4ea' : 'var(--border-color)',
            color: copied ? '#137333' : 'var(--text-color)',
            transition: 'all 0.2s ease'
          }}
          title="Copy UPI ID"
        >
          {copied ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
      </div>
      {copied && <span style={{ fontSize: '0.9rem', color: '#137333', marginTop: '12px', display: 'block', fontWeight: 500 }}>Copied to clipboard!</span>}
    </div>
  );
}
