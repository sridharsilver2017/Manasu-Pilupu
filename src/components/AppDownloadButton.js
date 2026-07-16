'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

export default function AppDownloadButton({ style = {} }) {
  const [isNative, setIsNative] = useState(true); // Default to true to prevent flash on native

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  if (isNative) {
    return null;
  }

  return (
    <div style={{ marginTop: '20px', textAlign: 'center', marginBottom: '10px', ...style }}>
      <a href="/manasupilupu.apk" download className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.95rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        ఆండ్రాయిడ్ యాప్ డౌన్‌లోడ్ చేయండి
      </a>
    </div>
  );
}
