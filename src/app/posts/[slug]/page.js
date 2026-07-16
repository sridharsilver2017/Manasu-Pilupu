import { getAllPosts, getPostBySlug } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ShareButtons from './ShareButtons';
import Comments from './Comments';
import GoogleTranslate from '@/components/GoogleTranslate';
import AppDownloadButton from '@/components/AppDownloadButton';

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
  let cleanDescription = decodeHtmlEntities(post.excerpt.rendered.replace(/<[^>]+>/g, '').trim());
  
  // Truncate description for SEO (ideal length is around 150-160 characters)
  if (cleanDescription.length > 160) {
    cleanDescription = cleanDescription.substring(0, 157) + '...';
  }
  cleanDescription = cleanDescription || 'మనసులోంచి వచ్చిన మాటలు';

  const cleanTitle = decodeHtmlEntities(post.title.rendered.replace(/<[^>]+>/g, '').trim());
  
  const imageUrl = post._embedded && post._embedded['wp:featuredmedia'] 
    ? post._embedded['wp:featuredmedia'][0].source_url 
    : '/icon.png';

  const siteName = 'మనసు పిలుపు';

  return {
    title: cleanTitle,
    description: cleanDescription,
    openGraph: {
      title: cleanTitle,
      description: cleanDescription,
      siteName: siteName,
      type: 'article',
      url: `/posts/${slug}`,
      publishedTime: post.date,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: cleanTitle,
        },
      ],
    },
    alternates: {
      canonical: `/posts/${slug}`,
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

  const allPosts = await getAllPosts();
  const currentPostIndex = allPosts.findIndex((p) => p.slug === slug);
  
  const prevPost = currentPostIndex < allPosts.length - 1 ? allPosts[currentPostIndex + 1] : null;
  const nextPost = currentPostIndex > 0 ? allPosts[currentPostIndex - 1] : null;

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
          <div className="post-meta" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 999 }}>
            <span>{new Date(post.date).toLocaleDateString()}</span>
            <GoogleTranslate />
          </div>
        </header>
      </div>

      {post._embedded && post._embedded['wp:featuredmedia'] && (
        <img
          src={`${post._embedded['wp:featuredmedia'][0].source_url}?t=${new Date(post.modified || post.date).getTime()}`}
          alt={post.title.rendered}
          className="post-featured-image"
        />
      )}

      <div className="post-container">
        <div 
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
        
        <div className="ai-note" style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #666)', marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.03))', borderRadius: '8px', borderLeft: '4px solid var(--accent-color, #0070f3)' }}>
          <p style={{ margin: 0, lineHeight: '1.6' }}>
            <span style={{ fontWeight: 'bold' }}>గమనిక:</span> AI నా రచయిత కాదు… నా వేగాన్ని పెంచే సహాయకుడు మాత్రమే. ఆలోచన నాది. భావం నాది. చివరకు సరిదిద్దుకునేదీ (ఎడిట్ చేసేదీ) నేనే. ఈ మిషన్కి నేనే స్వయంగా శిక్షణ ఇచ్చాను… అందుకే ఇది నా శైలిలోనే మాట్లాడుతోంది. 😄
          </p>
        </div>

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

        <AppDownloadButton style={{ marginTop: '30px' }} />

        {(prevPost || nextPost) && (
          (() => {
            const truncate = (text, len = 25) => {
              const decoded = decodeHtmlEntities(text);
              return decoded.length > len ? decoded.substring(0, len) + '...' : decoded;
            };
            return (
              <div className="post-navigation">
                {prevPost ? (
                  <Link href={`/posts/${prevPost.slug}`} className="nav-prev">
                    &larr; Prev: {truncate(prevPost.title.rendered, 20)}
                  </Link>
                ) : <div className="nav-prev"></div>}
                {nextPost ? (
                  <Link href={`/posts/${nextPost.slug}`} className="nav-next">
                    Next: {truncate(nextPost.title.rendered, 20)} &rarr;
                  </Link>
                ) : <div className="nav-next"></div>}
              </div>
            );
          })()
        )}


        <Comments postId={post.id} />

        <ShareButtons title={decodeHtmlEntities(post.title.rendered)} />
      </div>
    </article>
  );
}
