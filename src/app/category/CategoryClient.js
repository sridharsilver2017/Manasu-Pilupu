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

  return (
    <div className="home-wrapper" style={{ paddingTop: '40px' }}>
      <section className="animate-fade-in-up">
        <div className="section-header">
          <h1>{category.name} <span style={{ fontSize: '0.6em', opacity: 0.7, fontWeight: 'normal' }}>({category.count})</span></h1>
          {category.description && <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>{category.description}</p>}
        </div>

        {posts.length === 0 ? (
          <p style={{ textAlign: 'center', margin: '40px 0' }}>ఈ విభాగంలో వ్యాసాలు లేవు.</p>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
