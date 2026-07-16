import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllCategories, getCategoryBySlug, getPostsByCategory } from '@/lib/api';

import PostCard from '@/components/PostCard';

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({ params }) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return {};

  return {
    title: category.name,
    description: category.description || `Articles in ${category.name}`,
  };
}

export default async function CategoryPage({ params }) {
  const category = await getCategoryBySlug(params.slug);
  
  if (!category) {
    notFound();
  }

  // Fetch up to 100 posts for the category
  const { posts } = await getPostsByCategory(category.id, 1, 100);

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
