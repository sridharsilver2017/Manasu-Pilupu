'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { usePathname } from 'next/navigation';

// Replace this with your actual WordPress site URL after uploading the plugin
const WP_API_BASE_URL = 'https://dev-sridhar-silver.pantheonsite.io/wp-json/mp-maintenance/v1';

export default function MaintenanceChecker({ children }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function checkMaintenanceStatus() {
      // Don't block the admin page
      if (pathname === '/admin') {
        return;
      }
      
      try {
        const res = await fetch(`${WP_API_BASE_URL}/status?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          // Ensure it handles string 'true' or boolean true
          setIsMaintenance(data.isMaintenance === true || String(data.isMaintenance).toLowerCase() === 'true');
        }
      } catch (err) {
        console.error("Failed to fetch maintenance status", err);
      }
    }

    if (WP_API_BASE_URL && WP_API_BASE_URL.includes('http')) {
      checkMaintenanceStatus();
    }
  }, [pathname]);

  // Removed the loading spinner to prevent blocking the initial render.
  // The check will happen silently in the background.
  // If maintenance is true, show maintenance screen (unless on admin page)
  if (isMaintenance && pathname !== '/admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '20px', backgroundColor: '#0f172a' }}>
        <div style={{ maxWidth: '600px', background: 'rgba(30, 41, 59, 0.5)', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#818cf8' }}>మనసు పిలుపు</h1>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#f8fafc' }}>వెబ్‌సైట్ నిర్వహణలో ఉంది <br/>(Under Maintenance)</h2>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: '1.6' }}>
            మేము వెబ్‌సైట్‌ను మరింత మెరుగుపరుస్తున్నాము. మరింత మంచి అనుభవాన్ని అందించడానికి మా బృందం పనిచేస్తోంది. దయచేసి కొద్దిసేపటి తర్వాత మళ్ళీ ప్రయత్నించండి.
          </p>
        </div>
      </div>
    );
  }

  // Otherwise, render normal content
  return children;
}
