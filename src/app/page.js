import HomeClient from './HomeClient';
import { getPaginatedPosts } from '@/lib/api';

export const metadata = {
  title: 'మనసు పిలుపు | మనసులోంచి వచ్చిన మాటలు',
  description: 'మనసులోంచి వచ్చిన మాటలు',
};

export default async function Home() {
  let initialPosts = [];
  try {
    const data = await getPaginatedPosts(1, 6);
    initialPosts = data.posts || [];
  } catch (e) {
    console.error('Failed to fetch initial posts for home page:', e);
  }

  return <HomeClient initialPosts={initialPosts} />;
}
