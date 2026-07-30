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

import { useAuth } from '@/context/AuthContext';

export default function PostClient({ initialSlug, initialPost, initialAllPosts = [] }) {
  const searchParams = useSearchParams();
  const slug = initialSlug || searchParams.get('slug');
  const { user, loading: authLoading } = useAuth();
  
  const [post, setPost] = useState(initialPost || null);
  const [loading, setLoading] = useState(!initialPost);
  const [allPosts, setAllPosts] = useState(initialAllPosts);

  useEffect(() => {
    async function loadPost() {
      // Don't load until auth state is resolved to avoid fetching without token when user is actually logged in
      if (authLoading) return;

      if (!slug) {
        setLoading(false);
        return;
      }
      try {
        const cached = getCachedPostBySlug(slug);
        // Only use cache if it matches our current auth expectation (e.g. if we are premium, we want the full post)
        // For simplicity, we just fetch it again to be safe
        
        const token = user ? user.token : null;
        const fetchedPost = await getPostBySlugClient(slug, token);
        setPost(fetchedPost);
        setLoading(false);
        
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
  }, [slug, user, authLoading]);

  useEffect(() => {
    if (post && post.title && post.title.rendered) {
      document.title = `${decodeHtmlEntities(post.title.rendered)} | మనసు పిలుపు`;
    }
  }, [post]);

  if (loading || authLoading) {
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

  let featuredImageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  if (featuredImageUrl) {
    const match = featuredImageUrl.match(/wp-content\/uploads\/(.*)$/);
    if (match) {
      const localFilename = match[1].replace(/\//g, '-');
      featuredImageUrl = `/wp-images/${localFilename}`;
    }
  }

  let postContent = post.content?.rendered || '';
  if (postContent) {
    postContent = postContent.replace(/https?:\/\/[^\/]+\/wp-content\/uploads\/([^\"]+)/g, (match, p1) => {
      const localFilename = p1.replace(/\//g, '-');
      return `/wp-images/${localFilename}`;
    });
  }

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

      {featuredImageUrl && (
        <img
          src={featuredImageUrl}
          alt={post.title.rendered}
          className="post-featured-image"
        />
      )}

      <div className="post-container">
        <div 
          className="post-content"
          style={{ position: 'relative' }}
        >
          <div dangerouslySetInnerHTML={{ __html: postContent }} />
          
          {post.is_locked && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '300px',
              background: 'linear-gradient(to bottom, transparent, var(--bg-color) 80%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingBottom: '20px'
            }}>
              <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--primary-color)',
                padding: '24px 32px',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                zIndex: 10
              }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>This content is for Premium members only</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Subscribe to unlock unlimited access to all articles.</p>
                <Link href="/pricing" style={{
                  padding: '12px 24px',
                  background: 'var(--primary-color)',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  textDecoration: 'none'
                }}>
                  View Pricing Plans
                </Link>
              </div>
            </div>
          )}
        </div>
        

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


        {/* <Comments postId={post.id} /> */}

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
