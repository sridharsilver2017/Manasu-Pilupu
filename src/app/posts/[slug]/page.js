import { getAllPosts, getPostBySlug } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ShareButtons from './ShareButtons';
import Comments from './Comments';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  // Clean HTML from excerpt and title
  const cleanDescription = post.excerpt.rendered.replace(/<[^>]+>/g, '').trim() || 'మనసులోంచి వచ్చిన మాటలు';
  const cleanTitle = post.title.rendered.replace(/<[^>]+>/g, '').trim();
  
  // Use featured image or a fallback for social cards
  const imageUrl = post._embedded && post._embedded['wp:featuredmedia'] 
    ? post._embedded['wp:featuredmedia'][0].source_url 
    : 'https://live-sridhar-silver.pantheonsite.io/wp-content/uploads/2026/07/suryudu-chustunnadu.png';

  return {
    title: cleanTitle,
    description: cleanDescription,
    openGraph: {
      title: cleanTitle,
      description: cleanDescription,
      type: 'article',
      publishedTime: post.date,
      images: [
        {
          url: imageUrl,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: cleanTitle,
      description: cleanDescription,
      images: [imageUrl],
    },
  };
}

export default async function Post({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="single-post animate-fade-in">
      <div className="post-container">
        <Link href="/" className="back-link">
          &larr; Back to all posts
        </Link>
        
        <header className="post-header">
          <h1 
            className="post-title"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <div className="post-meta">
            <span>Published on {new Date(post.date).toLocaleDateString()}</span>
          </div>
        </header>
      </div>

      {post._embedded && post._embedded['wp:featuredmedia'] && (
        <img
          src={post._embedded['wp:featuredmedia'][0].source_url}
          alt={post.title.rendered}
          className="post-featured-image"
        />
      )}

      <div className="post-container">
        <div 
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
        
        <div className="support-message">
          <p>
            ఈ బ్లాగ్‌లోని రచనలు మీకు నచ్చినట్లయితే, ఈ స్వచ్ఛమైన ప్రయాణం ఇలాగే ముందుకు సాగడానికి మీ వంతు మద్దతు అందించండి.
          </p>
          <div style={{ marginTop: '20px' }}>
            <Link href="/support" className="support-btn">
              నన్ను సపోర్ట్ చేయండి
            </Link>
          </div>
        </div>

        <Comments postId={post.id} />

        <ShareButtons title={post.title.rendered} />
      </div>
    </article>
  );
}
