"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCategoryBySlugClient, getPostsByCategoryClient } from '@/lib/api-client';
import PostCard from '@/components/PostCard';

export default function CategoryClient() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');

  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'free', 'premium'

  useEffect(() => {
    async function loadCategoryAndPosts() {
      if (!slug) {
        setLoading(false);
        return;
      }
      try {
        const fetchedCategory = await getCategoryBySlugClient(slug);
        setCategory(fetchedCategory);

        if (fetchedCategory) {
          // Fetch up to 100 posts for the category
          const data = await getPostsByCategoryClient(fetchedCategory.id, 1, 100);
          setPosts(data.posts);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryAndPosts();
  }, [slug]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading category...</div>;
  }

  if (!category) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Category Not Found</div>;
  }

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'free' && post.is_premium_type === true) return false;
    if (activeTab === 'premium' && post.is_premium_type === false) return false;
    return true;
  });

  return (
    <div className="home-wrapper" style={{ paddingTop: '40px' }}>
      <section className="animate-fade-in-up">
        <div className="section-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <h1>{category.name} <span style={{ fontSize: '0.6em', opacity: 0.7, fontWeight: 'normal' }}>({category.count})</span></h1>
          {category.description && <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>{category.description}</p>}

          <div className="content-tabs" style={{ 
            display: 'flex', 
            gap: '10px', 
            background: 'var(--bg-secondary)', 
            padding: '6px', 
            borderRadius: '30px',
            marginBottom: '20px'
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
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <p style={{ textAlign: 'center', margin: '40px 0' }}>ఈ విభాగంలో వ్యాసాలు లేవు.</p>
        ) : (
          <div className="posts-grid">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
