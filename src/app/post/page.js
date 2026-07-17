import { Suspense } from 'react';
import PostClient from './PostClient';

export const metadata = {
  title: 'వ్యాసం | మనసు పిలుపు',
  description: 'మనసులోంచి వచ్చిన మాటలు',
};

export default function PostPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading post...</div>}>
      <PostClient />
    </Suspense>
  );
}
