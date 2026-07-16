import Link from 'next/link';
import { getPaginatedPosts } from '@/lib/api';
import Pagination from '@/components/Pagination';

import PostCard from '@/components/PostCard';

export async function generateStaticParams() {
  const { totalPages } = await getPaginatedPosts(1, 9);
  
  const paths = [];
  // Start from page 2, because page 1 is /blog
  for (let i = 2; i <= totalPages; i++) {
    paths.push({
      page: i.toString(),
    });
  }
  
  return paths;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  return {
    title: `బ్లాగ్ (Blog) - Page ${resolvedParams.page} | మనసు పిలుపు`,
    description: 'అన్ని వ్యాసాలు చదవండి',
  };
}

export default async function PaginatedBlogPage({ params }) {
  const resolvedParams = await params;
  const currentPage = parseInt(resolvedParams.page, 10);
  const { posts, totalPages } = await getPaginatedPosts(currentPage, 9);

  return (
    <div className="home-wrapper" style={{ paddingTop: '40px' }}>
      <section className="animate-fade-in-up">
        <div className="section-header">
          <h1>అన్ని వ్యాసాలు</h1>
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
            ఇక్కడ నా రచనలన్నీ చదవవచ్చు. (పేజీ {currentPage})
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
