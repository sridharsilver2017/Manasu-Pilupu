'use client';

import { useState, useEffect } from 'react';

export default function LikeButton({ postId, initialLikes = 0, style }) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    // Check local storage to see if user already liked this post
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    if (likedPosts[postId]) {
      setHasLiked(true);
    }
    
    // Fetch the latest like count from our custom API
    // (In case someone else liked it since the page was built)
    if (postId) {
      fetch(`https://dev-sridhar-silver.pantheonsite.io/wp-json/custom/v1/like?post_id=${postId}`)
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.likes === 'number') {
            setLikes(data.likes);
          }
        })
        .catch(err => {
            // Ignore error gracefully (e.g. if endpoint isn't set up yet)
        });
    }
  }, [postId]);

  const handleLike = async (e) => {
    e.preventDefault(); // Prevent navigating if inside a link
    if (hasLiked || isLiking) return; // Prevent multiple clicks

    setIsLiking(true);
    // Optimistic UI update
    setLikes(prev => prev + 1);
    setHasLiked(true);
    
    // Save to local storage
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    likedPosts[postId] = true;
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));

    // Send request to WordPress backend
    try {
      const response = await fetch(`https://dev-sridhar-silver.pantheonsite.io/wp-json/custom/v1/like?post_id=${postId}`, {
        method: 'POST',
      });
      if (response.ok) {
          const data = await response.json();
          if (data && typeof data.likes === 'number') {
            setLikes(data.likes); // Sync exact count from server
          }
      } else {
         // Endpoint might not be active yet, keep optimistic UI
      }
    } catch (error) {
      console.error('Error liking post:', error);
      // We keep the optimistic update so the UI still feels good even if the user hasn't added the WP code yet
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <button 
      onClick={handleLike} 
      disabled={hasLiked}
      className={`like-button ${hasLiked ? 'liked' : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        backgroundColor: hasLiked ? 'rgba(239, 68, 68, 0.1)' : 'var(--card-bg)',
        color: hasLiked ? '#ef4444' : 'var(--text-secondary)',
        cursor: hasLiked ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        ...style
      }}
      title={hasLiked ? "You liked this" : "Like this post"}
    >
      <svg 
        viewBox="0 0 24 24" 
        width="18" 
        height="18" 
        fill={hasLiked ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{
          transform: hasLiked ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <span style={{ fontWeight: 500, fontSize: '14px', minWidth: '12px', textAlign: 'center' }}>
        {likes > 0 ? likes : ''}
      </span>
    </button>
  );
}
