"use client";

import { useState, useEffect, useRef } from 'react';
import { getPaginatedPostsClient, getCachedPaginatedPosts, getAllCategoriesClient, getPostsByCategoryClient } from '@/lib/api-client';
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

  const isInitialMount = useRef(true);

  useEffect(() => {
    async function fetchCategoryPosts() {
      if (isInitialMount.current && (!selectedCategory || selectedCategory === 'all')) {
        isInitialMount.current = false;
        // Skip fetching on first mount if we just want 'all', because we already fetch it below
        return;
      }
      
      setLoading(true);
      try {
        let data;
        if (selectedCategory && selectedCategory !== 'all') {
          data = await getPostsByCategoryClient(selectedCategory, 1, 9);
        } else {
          data = await getPaginatedPostsClient(1, 9);
        }
        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setCurrentPage(1);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCategoryPosts();
  }, [selectedCategory]);

  useEffect(() => {
    async function loadInitialPosts() {
      if (selectedCategory && selectedCategory !== 'all') return;
      
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
      let data;
      if (selectedCategory && selectedCategory !== 'all') {
        data = await getPostsByCategoryClient(selectedCategory, nextPage, 9);
      } else {
        data = await getPaginatedPostsClient(nextPage, 9);
      }
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

        <div className="content-tabs" style={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: '10px', 
          background: 'var(--bg-secondary)', 
          padding: '6px', 
          borderRadius: '30px',
          marginBottom: '30px', 
          flexWrap: 'wrap',
          maxWidth: 'fit-content',
          margin: '0 auto 30px auto'
        }}>
          <button 
            onClick={() => setActiveTab('all')}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: 'none',
              background: activeTab === 'all' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'all' ? '#fff' : 'var(--text-color)',
              fontWeight: activeTab === 'all' ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            అన్ని (All)
          </button>
          <button 
            onClick={() => setActiveTab('free')}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: 'none',
              background: activeTab === 'free' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'free' ? '#fff' : 'var(--text-color)',
              fontWeight: activeTab === 'free' ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            ఉచితం (Free)
          </button>
          <button 
            onClick={() => setActiveTab('premium')}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: 'none',
              background: activeTab === 'premium' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'premium' ? '#fff' : 'var(--text-color)',
              fontWeight: activeTab === 'premium' ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
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
                {cat.name.replace(/&amp;/g, '&').replace(/&#038;/g, '&').replace(/&#8211;/g, '-')}
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
