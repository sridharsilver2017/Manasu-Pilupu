"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPostBySlugClient, getAllPostsClient, getCachedPostBySlug } from '@/lib/api-client';
import Link from 'next/link';
import ShareButtons from './ShareButtons';
import Comments from './Comments';
import GoogleTranslate from '@/components/GoogleTranslate';
import AppDownloadButton from '@/components/AppDownloadButton';
import LikeButton from '../../components/LikeButton';

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

export default function PostClient({ initialSlug, initialPost, initialAllPosts = [] }) {
  const searchParams = useSearchParams();
  const slug = initialSlug || searchParams.get('slug');
  
  const [post, setPost] = useState(initialPost || null);
  const [loading, setLoading] = useState(!initialPost);
  const [allPosts, setAllPosts] = useState(initialAllPosts);

  useEffect(() => {
    async function loadPost() {
      if (!slug) {
        setLoading(false);
        return;
      }
      try {
        const cached = getCachedPostBySlug(slug);
        if (cached && !initialPost) {
          setPost(cached);
          setLoading(false);
        }

        const fetchedPost = await getPostBySlugClient(slug);
        setPost(fetchedPost);
        setLoading(false); // Unblock UI as soon as we have the post!
        
        // Also fetch all posts for navigation (prev/next)
        if (initialAllPosts.length === 0) {
          const posts = await getAllPostsClient();
          setAllPosts(posts);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  useEffect(() => {
    if (post && post.title && post.title.rendered) {
      document.title = `${decodeHtmlEntities(post.title.rendered)} | మనసు పిలుపు`;
    }
  }, [post]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading post...</div>;
  }

  if (!post) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Post Not Found</h2>
        <Link href="/">Back to Home</Link>
      </div>
    );
  }

  const currentPostIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentPostIndex < allPosts.length - 1 ? allPosts[currentPostIndex + 1] : null;
  const nextPost = currentPostIndex > 0 ? allPosts[currentPostIndex - 1] : null;

  return (
    <article className="single-post animate-fade-in">
      <div className="post-container">
        <Link href="/blog" className="back-link">
          &larr; Back to Blog
        </Link>
        
        <header className="post-header">
          <h1 
            className="post-title"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <div className="post-meta-container">
            <div className="post-meta-left">
              {(() => {
                const categories = post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0]
                  ? post._embedded['wp:term'][0].filter(term => term.taxonomy === 'category')
                  : [];
                
                return categories.length > 0 ? (
                  <div className="post-categories" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                      <Link href={`/category?slug=${cat.slug}`} key={cat.id} style={{ 
                        fontSize: '0.8rem', 
                        backgroundColor: 'var(--primary-color)', 
                        color: '#fff', 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontWeight: '500', 
                        textDecoration: 'none',
                        transition: 'var(--transition)'
                      }}>
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                ) : null;
              })()}
              
              <div className="post-meta-separator" style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', opacity: 0.5 }}></div>

              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="post-meta-right">
              <LikeButton postId={post.id} />
              <GoogleTranslate />
            </div>
          </div>
        </header>
      </div>

      {post._embedded && post._embedded['wp:featuredmedia'] && (
        <img
          src={`${post._embedded['wp:featuredmedia'][0].source_url}`}
          alt={post.title.rendered}
          className="post-featured-image"
        />
      )}

      <div className="post-container">
        <div 
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
        

        {/* <div className="support-message">
          <p>
            ఈ బ్లాగ్‌లోని రచనలు మీకు నచ్చినట్లయితే, ఈ స్వచ్ఛమైన ప్రయాణం ఇలాగే ముందుకు సాగడానికి మీ వంతు మద్దతు అందించండి.
          </p>
          <div style={{ marginTop: '20px' }}>
            <Link href="/support" className="support-btn">
              నన్ను సపోర్ట్ చేయండి
            </Link>
          </div>
        </div> */}

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

        <div className="ai-note" style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #666)', marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.03))', borderRadius: '8px', borderLeft: '4px solid var(--accent-color, #0070f3)' }}>
          <p style={{ margin: 0, lineHeight: '1.6' }}>
            <span style={{ fontWeight: 'bold' }}>గమనిక:</span> AI నా రచయిత కాదు… నా వేగాన్ని పెంచే సహాయకుడు మాత్రమే. ఆలోచన నాది. భావం నాది. చివరకు సరిదిద్దుకునేదీ (ఎడిట్ చేసేదీ) నేనే. ఈ మిషన్కి నేనే స్వయంగా శిక్షణ ఇచ్చాను… అందుకే ఇది నా శైలిలోనే మాట్లాడుతోంది. 😄
          </p>
        </div>
      </div>
    </article>
  );
}
