"use client";

import { useState } from 'react';

export default function CommentForm({ postId }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('https://dev-sridhar-silver.pantheonsite.io/wp-json/wp/v2/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post: postId,
          author_name: name,
          author_email: email,
          content: content,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit comment');
      }

      setStatus('success');
      setName('');
      setEmail('');
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  if (status === 'success') {
    return (
      <div className="comment-form-success" style={{ padding: '20px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid #10b981', color: '#10b981', marginTop: '20px', textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Thank you for your comment!</h4>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>Your comment has been submitted and is awaiting moderation.</p>
        <button onClick={() => setStatus('idle')} style={{ marginTop: '15px', background: 'transparent', border: '1px solid #10b981', color: '#10b981', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }}>Leave another comment</button>
      </div>
    );
  }

  return (
    <div className="comment-form-container" style={{ marginTop: '40px', padding: '24px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', fontWeight: '500' }}>Leave a Comment</h3>
      
      {status === 'error' && (
        <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid #ef4444', color: '#ef4444', marginBottom: '20px', fontSize: '0.9rem' }}>
          <strong>Error:</strong> {errorMessage}
          <div style={{ marginTop: '8px', fontSize: '0.8rem', opacity: 0.8 }}>
            (Note: If it says login required, anonymous comments must be enabled in WordPress Settings &gt; Discussion).
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="name" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Name *</label>
            <input 
              id="name"
              type="text" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', outline: 'none' }}
              placeholder="Your name"
            />
          </div>
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="email" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email *</label>
            <input 
              id="email"
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', outline: 'none' }}
              placeholder="Your email"
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="content" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Comment *</label>
          <textarea 
            id="content"
            required 
            rows="4" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', outline: 'none', resize: 'vertical' }}
            placeholder="What are your thoughts?"
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={status === 'submitting'}
          style={{ 
            marginTop: '8px',
            padding: '12px 24px', 
            backgroundColor: 'var(--primary-color)', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: '500',
            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
            opacity: status === 'submitting' ? 0.7 : 1,
            alignSelf: 'flex-start',
            transition: 'background-color 0.2s'
          }}
        >
          {status === 'submitting' ? 'Submitting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
}
