'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { usePathname } from 'next/navigation';

// Replace this with your actual WordPress site URL after uploading the plugin
const WP_API_BASE_URL = 'https://dev-sridhar-silver.pantheonsite.io/wp-json/mp-maintenance/v1';

export default function MaintenanceChecker({ children }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function checkMaintenanceStatus() {
      // Don't block the admin page
      if (pathname === '/admin') {
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`${WP_API_BASE_URL}/status`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          // Ensure it handles string 'true' or boolean true
          setIsMaintenance(data.isMaintenance === true || String(data.isMaintenance).toLowerCase() === 'true');
        }
      } catch (err) {
        console.error("Failed to fetch maintenance status", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (WP_API_BASE_URL && WP_API_BASE_URL.includes('http')) {
      checkMaintenanceStatus();
    } else {
      setIsLoading(false);
    }
  }, [pathname]);

  // If we're still checking, you can either show a loader or render children directly
  // Rendering nothing or a spinner prevents "flash of content" before maintenance screen appears.
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-color, #000)' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #333', borderTop: '4px solid #0070f3', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // If maintenance is true, show maintenance screen (unless on admin page)
  if (isMaintenance && pathname !== '/admin') {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '20px', backgroundColor: 'var(--bg-color)' }}>
          <div style={{ maxWidth: '600px', background: 'var(--card-bg)', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--primary-color)' }}>మనసు పిలుపు</h1>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>వెబ్‌సైట్ నిర్వహణలో ఉంది <br/>(Under Maintenance)</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              మేము వెబ్‌సైట్‌ను మరింత మెరుగుపరుస్తున్నాము. మరింత మంచి అనుభవాన్ని అందించడానికి మా బృందం పనిచేస్తోంది. దయచేసి కొద్దిసేపటి తర్వాత మళ్ళీ ప్రయత్నించండి.
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Otherwise, render normal content
  return children;
}
