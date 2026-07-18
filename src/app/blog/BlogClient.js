"use client";

import { useState, useEffect } from 'react';
import { getPaginatedPostsClient, getCachedPaginatedPosts } from '@/lib/api-client';
import PostCard from '@/components/PostCard';

export default function BlogClient({ initialPosts = [], initialTotalPages = 1 }) {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    async function loadInitialPosts() {
      const cached = getCachedPaginatedPosts(1, 9);
      if (cached && cached.posts) {
        setPosts(cached.posts);
        setTotalPages(cached.totalPages);
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        const data = await getPaginatedPostsClient(1, 9);
        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setCurrentPage(1);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadInitialPosts();
  }, []);

  const loadMore = async () => {
    if (currentPage >= totalPages || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const data = await getPaginatedPostsClient(nextPage, 9);
      setPosts([...posts, ...data.posts]);
      setCurrentPage(nextPage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="home-wrapper" style={{ paddingTop: '40px' }}>
      <section className="animate-fade-in-up">
        <div className="section-header">
          <h1>అన్ని వ్యాసాలు</h1>
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
            ఇక్కడ నా రచనలన్నీ చదవవచ్చు.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading posts...</div>
        ) : (
          <>
            <div className="posts-grid">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            
            {currentPage < totalPages && (
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button 
                  onClick={loadMore} 
                  disabled={loadingMore}
                  className="btn-primary" 
                  style={{ padding: '10px 24px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {loadingMore ? 'Loading...' : 'మరిన్ని వ్యాసాలు (Load More)'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
