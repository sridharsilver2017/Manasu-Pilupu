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
    const resolvedParams = await params;
    const post = await getPostBySlug(resolvedParams.slug);
    if (!post) {
      return {
        title: 'Post Not Found | మనసు పిలుపు',
      };
    }

    const title = decodeHtmlEntities(post.title.rendered);
    const description = decodeHtmlEntities(post.excerpt?.rendered?.replace(/(<([^>]+)>)/gi, "") || 'మనసులోంచి వచ్చిన మాటలు');
    let imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    
    // Ensure the image URL is absolute for social sharing
    if (imageUrl && imageUrl.startsWith('/')) {
      imageUrl = `https://manasupilupu.pages.dev${imageUrl}`;
    }

    return {
      title: `${title} | మనసు పిలుపు`,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://manasupilupu.pages.dev/posts/${resolvedParams.slug}`,
        images: imageUrl ? [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          }
        ] : [],
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

export default async function StaticPostPage({ params }) {
  // We render the exact same UI as the mobile app, but pass the slug directly
  // so it doesn't have to rely purely on query parameters.
  const resolvedParams = await params;
  let initialPost = null;
  let initialAllPosts = [];
  try {
    initialPost = await getPostBySlug(resolvedParams.slug);
    initialAllPosts = await getAllPosts();
  } catch (e) {
    console.error('Failed to fetch initial post data:', e);
  }

  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading post...</div>}>
      <PostClient initialSlug={resolvedParams.slug} initialPost={initialPost} initialAllPosts={initialAllPosts} />
    </Suspense>
  );
}
