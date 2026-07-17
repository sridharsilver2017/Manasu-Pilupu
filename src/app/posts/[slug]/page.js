import { getAllPosts, getPostBySlug } from '@/lib/api';
import PostClient from '@/app/post/PostClient';

export async function generateStaticParams() {
  try {
    const posts = await getAllPosts();
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

function decodeHtmlEntities(text) {
  if (!text) return '';
  return text
    .replace(/&#8230;/g, '…')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#038;/g, '&')
    .replace(/&#39;/g, "'");
}

export async function generateMetadata({ params }) {
  try {
    const post = await getPostBySlug(params.slug);
    if (!post) {
      return {
        title: 'Post Not Found | మనసు పిలుపు',
      };
    }

    const title = decodeHtmlEntities(post.title.rendered);
    const description = decodeHtmlEntities(post.excerpt?.rendered?.replace(/(<([^>]+)>)/gi, "") || 'మనసులోంచి వచ్చిన మాటలు');
    const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

    return {
      title: `${title} | మనసు పిలుపు`,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://manasupilupu.pages.dev/posts/${params.slug}`,
        images: imageUrl ? [imageUrl] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'మనసు పిలుపు',
    };
  }
}

import { Suspense } from 'react';

export default function StaticPostPage({ params }) {
  // We render the exact same UI as the mobile app, but pass the slug directly
  // so it doesn't have to rely purely on query parameters.
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading post...</div>}>
      <PostClient initialSlug={params.slug} />
    </Suspense>
  );
}
