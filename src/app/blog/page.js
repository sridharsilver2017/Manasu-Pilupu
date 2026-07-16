import Link from 'next/link';
import { getPaginatedPosts } from '@/lib/api';
import Pagination from '@/components/Pagination';

import PostCard from '@/components/PostCard';

export const metadata = {
  title: 'బ్లాగ్ (Blog) | మనసు పిలుపు',
  description: 'అన్ని వ్యాసాలు చదవండి',
};

export default async function BlogPage() {
  const currentPage = 1;
  const { posts, totalPages } = await getPaginatedPosts(currentPage, 9);

  return (
    <div className="home-wrapper" style={{ paddingTop: '40px' }}>
      <section className="animate-fade-in-up">
        <div className="section-header">
          <h1>అన్ని వ్యాసాలు</h1>
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
            ఇక్కడ నా రచనలన్నీ చదవవచ్చు.
          </p>
        </div>

        <div className="posts-grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        
        <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/blog" />
      </section>
    </div>
  );
}
