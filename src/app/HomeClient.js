"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getPaginatedPostsClient, getCachedPaginatedPosts } from '@/lib/api-client';
import AppDownloadButton from '@/components/AppDownloadButton';
import PostCard from '@/components/PostCard';

export default function HomeClient({ initialPosts = [] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'free', 'premium'
  const [isAllFreeActive, setIsAllFreeActive] = useState(false);

  useEffect(() => {
    fetch('https://dev-sridhar-silver.pantheonsite.io/wp-json/mp/v1/is-all-free')
      .then(res => { if (res.ok) return res.json(); })
      .then(data => { if (data === true) setIsAllFreeActive(true); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function loadPosts() {
      // 1. Try to load from cache immediately
      const cached = getCachedPaginatedPosts(1, 12);
      if (cached && cached.posts) {
        setPosts(cached.posts);
        setLoading(false);
      }

      // 2. Fetch fresh data in the background
      try {
        const { posts: fetchedPosts } = await getPaginatedPostsClient(1, 12);
        setPosts(fetchedPosts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  return (
    <div className="home-wrapper">
      <section className="hero-section animate-fade-in-up">
        <h1 className="hero-title text-gradient">మనసు పిలుపు</h1>
        <p className="hero-subtitle">
          మనసులోంచి వచ్చిన మాటలు
        </p>
        <div className="hero-intro">
          <p>
            సాహిత్యంపై ఉన్న మక్కువతో, నా మనసులోని భావాలకు అక్షర రూపం ఇచ్చే చిన్న ప్రయత్నమే ఈ వేదిక. ఇక్కడ మీరు చదివే ప్రతి కథ, కవిత, వ్యాసం నా అంతరంగంలోంచి పుట్టినవే. ఆధునిక ప్రపంచపు హడావిడికి దూరంగా, కాసేపు ప్రశాంతంగా కూర్చుని చదువుకోవడానికి ఈ వెబ్‌సైట్‌ను సృష్టించాను. మీ పఠనానుభూతి ప్రశాంతంగా, ఆనందంగా సాగాలని మనస్ఫూర్తిగా ఆశిస్తున్నాను.
          </p>
          <AppDownloadButton style={{ marginTop: '20px' }} />
        </div>
      </section>

      <section className="articles-section animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="section-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <h2>తాజా వ్యాసాలు</h2>
          
          {!isAllFreeActive && (
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
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading posts...</div>
        ) : (
          <div className="posts-grid">
            {posts
              .filter(post => {
                if (activeTab === 'free') return post.is_premium_type === false;
                if (activeTab === 'premium') return post.is_premium_type === true;
                return true; // 'all'
              })
              .map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/blog" className="btn-primary" style={{ padding: '10px 24px', borderRadius: '30px', display: 'inline-block', textDecoration: 'none', fontWeight: 'bold' }}>
            అన్ని వ్యాసాలు చదవండి &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
