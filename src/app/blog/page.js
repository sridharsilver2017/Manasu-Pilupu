import BlogClient from './BlogClient';
import { getPaginatedPosts } from '@/lib/api';

export const metadata = {
  title: 'బ్లాగ్ (Blog) | మనసు పిలుపు',
  description: 'అన్ని వ్యాసాలు చదవండి',
};

export default async function BlogPage() {
  let initialData = { posts: [], totalPages: 1 };
  try {
    initialData = await getPaginatedPosts(1, 9);
  } catch (e) {
    console.error('Failed to fetch initial posts for blog page:', e);
  }

  return <BlogClient initialPosts={initialData.posts} initialTotalPages={initialData.totalPages} />;
}
