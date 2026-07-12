'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Check auth on load by trying to fetch contacts
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const res = await fetch('/api/admin/contacts');
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch contacts');
      }
      
      setContacts(data.contacts || []);
      setIsAuthenticated(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setIsAuthenticated(true);
      fetchContacts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setContacts([]);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (loadingContacts && !isAuthenticated) {
    return (
      <div className="single-post">
        <div className="post-container" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="single-post animate-fade-in">
        <div className="post-container" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <Link href="/" className="back-link">
            &larr; Back to home
          </Link>
          <header className="post-header" style={{ marginBottom: '24px' }}>
            <h1 className="post-title">Admin Login</h1>
          </header>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '8px', color: '#dc2626' }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="password" style={{ fontWeight: '500' }}>Password</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password..." 
                required
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--card-bg)', 
                  color: 'var(--text-color)',
                  fontFamily: 'inherit',
                  outline: 'none'
                }} 
              />
            </div>
            
            <button 
              type="submit" 
              className="support-btn" 
              disabled={loading}
              style={{ border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="single-post animate-fade-in">
      <div className="post-container" style={{ maxWidth: '900px' }}>
        <Link href="/" className="back-link">
          &larr; Back to home
        </Link>
        
        <header className="post-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="post-title">Contact Submissions</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={fetchContacts}
              className="support-btn"
              style={{ padding: '8px 16px', fontSize: '14px', border: 'none', cursor: 'pointer' }}
            >
              Refresh
            </button>
            <button 
              onClick={handleLogout}
              className="support-btn"
              style={{ padding: '8px 16px', fontSize: '14px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}
            >
              Logout
            </button>
          </div>
        </header>

        <div className="post-content" style={{ marginTop: '24px' }}>
          {loadingContacts ? (
            <p>Loading data...</p>
          ) : contacts.length === 0 ? (
            <p>No contact submissions found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '12px 8px', fontWeight: 'bold' }}>Name</th>
                    <th style={{ padding: '12px 8px', fontWeight: 'bold' }}>Email</th>
                    <th style={{ padding: '12px 8px', fontWeight: 'bold' }}>Message</th>
                    <th style={{ padding: '12px 8px', fontWeight: 'bold' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact, index) => (
                    <tr key={contact.id || index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 8px', verticalAlign: 'top' }}>{contact.name}</td>
                      <td style={{ padding: '12px 8px', verticalAlign: 'top' }}>
                        <a href={`mailto:${contact.email}`} style={{ color: 'var(--link-color)', textDecoration: 'none' }}>
                          {contact.email}
                        </a>
                      </td>
                      <td style={{ padding: '12px 8px', whiteSpace: 'pre-wrap', verticalAlign: 'top' }}>{contact.message}</td>
                      <td style={{ padding: '12px 8px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        {new Date(contact.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
