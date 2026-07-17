import { Suspense } from 'react';
import CategoryClient from './CategoryClient';

export const metadata = {
  title: 'విభాగం (Category) | మనసు పిలుపు',
  description: 'ఈ విభాగంలోని వ్యాసాలు',
};

export default function CategoryPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading category...</div>}>
      <CategoryClient />
    </Suspense>
  );
}
