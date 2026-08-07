"use client";

import { useState, useEffect } from 'react';
import { getPaginatedPostsClient, getCachedPaginatedPosts, getAllCategoriesClient } from '@/lib/api-client';
import PostCard from '@/components/PostCard';

export default function BlogClient({ initialPosts = [], initialTotalPages = 1 }) {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');

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
    
    async function loadCategories() {
      try {
        const cats = await getAllCategoriesClient();
        setCategories(cats || []);
      } catch (e) {
        console.error(e);
      }
    }
    
    loadInitialPosts();
    loadCategories();
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

  const filteredPosts = posts.filter(post => {
    // Premium tab filter
    if (activeTab === 'free' && post.is_premium_type === true) return false;
    if (activeTab === 'premium' && post.is_premium_type === false) return false;
    
    // Category dropdown filter
    if (selectedCategory && selectedCategory !== 'all') {
      if (!post.categories || !post.categories.includes(parseInt(selectedCategory))) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="home-wrapper" style={{ paddingTop: '40px' }}>
      <section className="animate-fade-in-up">
        <div className="section-header">
          <h1>అన్ని వ్యాసాలు</h1>
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
            ఇక్కడ నా రచనలన్నీ చదవవచ్చు.
          </p>
        </div>

        <div className="content-tabs" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            అన్ని (All)
          </button>
          <button 
            className={`tab-btn ${activeTab === 'free' ? 'active' : ''}`}
            onClick={() => setActiveTab('free')}
          >
            ఉచితం (Free)
          </button>
          <button 
            className={`tab-btn ${activeTab === 'premium' ? 'active' : ''}`}
            onClick={() => setActiveTab('premium')}
          >
            ప్రీమియం (Premium)
          </button>
          
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">అన్ని వర్గాలు (All Categories)</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading posts...</div>
        ) : (
          <>
            <div className="posts-grid">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                  <p>ఈ విభాగంలో వ్యాసాలు లేవు.</p>
                </div>
              )}
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
