"use client";

import { useState, useEffect } from 'react';
import { getCommentsByPostIdClient } from '@/lib/api-client';
import CommentForm from './CommentForm';

export default function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComments() {
      try {
        const fetchedComments = await getCommentsByPostIdClient(postId);
        setComments(fetchedComments || []);
      } catch (e) {
        console.error('Failed to load comments', e);
      } finally {
        setLoading(false);
      }
    }
    if (postId) {
      loadComments();
    }
  }, [postId]);

  const hasComments = comments && comments.length > 0;

  return (
    <div className="comments-section" style={{ marginTop: '56px', paddingTop: '40px', borderTop: '1px solid var(--border-color)' }}>
      <h3 className="comments-title" style={{ fontSize: '1.8rem', marginBottom: '24px', fontWeight: '400' }}>
        అభిప్రాయాలు {hasComments ? `(${comments.length} Comments)` : ''}
      </h3>
      
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading comments...</p>
      ) : hasComments ? (
        <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {comments.map((comment) => (
            <div key={comment.id} className="comment" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div className="comment-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                {comment.author_avatar_urls && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={comment.author_avatar_urls['48']} 
                      alt={comment.author_name} 
                      className="comment-avatar" 
                      style={{ borderRadius: '50%', width: '40px', height: '40px' }}
                    />
                  </>
                )}
                <div className="comment-meta" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="comment-author-name" style={{ fontWeight: '500' }}>{comment.author_name}</span>
                  <span className="comment-date" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(comment.date).toLocaleDateString()}</span>
                </div>
              </div>
              <div 
                className="comment-content" 
                dangerouslySetInnerHTML={{ __html: comment.content.rendered }} 
                style={{ fontSize: '1rem', lineHeight: '1.6' }}
              />
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No comments yet. Be the first to share your thoughts!</p>
      )}

      <CommentForm postId={postId} />
    </div>
  );
}
