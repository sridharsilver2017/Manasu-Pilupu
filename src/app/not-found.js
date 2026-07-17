"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Check if the current URL matches the old patterns
    const path = window.location.pathname;
    
    // For old /posts/[slug]
    if (path.startsWith('/posts/')) {
      const slug = path.replace('/posts/', '').replace(/\/$/, '');
      if (slug) {
        setRedirecting(true);
        router.replace(`/post?slug=${slug}`);
        return;
      }
    }
    
    // For old /category/[slug]
    if (path.startsWith('/category/') && !path.includes('?slug=')) {
      const slug = path.replace('/category/', '').replace(/\/$/, '');
      if (slug) {
        setRedirecting(true);
        router.replace(`/category?slug=${slug}`);
        return;
      }
    }
  }, [router]);

  if (redirecting) {
    return (
      <div className="home-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>పేజీని దారి మళ్లిస్తున్నాము...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Redirecting to the correct page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', maxWidth: '500px' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 16px 0', color: 'var(--primary-color)' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', margin: '0 0 16px 0' }}>పేజీ కనుగొనబడలేదు</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          మీరు వెతుకుతున్న పేజీ ఇక్కడ లేదు. బహుశా అది తీసివేయబడి ఉండవచ్చు లేదా లింక్ తప్పు కావచ్చు.
        </p>
        <Link href="/" className="btn-primary" style={{ padding: '12px 32px', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
          హోమ్ పేజీకి వెళ్ళండి
        </Link>
      </div>
    </div>
  );
}
