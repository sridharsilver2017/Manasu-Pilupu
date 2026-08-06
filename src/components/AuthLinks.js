'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

import { useRouter } from 'next/navigation';

export function DesktopAuthLink() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return <span className="nav-link">Loading...</span>;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (user) {
    return (
      <>
        <Link href="/profile" className="nav-link">
          Profile
        </Link>
        <button onClick={handleLogout} className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: '0', color: 'inherit' }}>
          Logout
        </button>
      </>
    );
  }

  return (
    <Link href="/login" className="nav-link">
      Login
    </Link>
  );
}

export function MobileAuthLink() {
  const { user, loading } = useAuth();

  const icon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );

  if (loading) {
    return (
      <div className="mobile-nav-item">
        {icon}
        <span>...</span>
      </div>
    );
  }

  if (user) {
    return (
      <Link href="/profile" className="mobile-nav-item">
        {icon}
        <span>Profile</span>
      </Link>
    );
  }

  return (
    <Link href="/login" className="mobile-nav-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
        <polyline points="10 17 15 12 10 7"></polyline>
        <line x1="15" y1="12" x2="3" y2="12"></line>
      </svg>
      <span>Login</span>
    </Link>
  );
}
