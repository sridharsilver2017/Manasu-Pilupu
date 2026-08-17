"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPostBySlugClient, getAllPostsClient, getCachedPostBySlug } from '@/lib/api-client';
import Link from 'next/link';
import ShareButtons from './ShareButtons';
import Comments from './Comments';
import GoogleTranslate from '@/components/GoogleTranslate';
import AppDownloadButton from '@/components/AppDownloadButton';
import AdBanner from '@/components/AdBanner';
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

  const isLocked = post.is_locked;

  if (isLocked && postContent) {
    const paragraphs = postContent.split('</p>');
    // Show first 4 paragraphs before paywall
    if (paragraphs.length > 4) {
      postContent = paragraphs.slice(0, 4).join('</p>') + '</p>';
    }
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
                        {cat.name.replace(/&amp;/g, '&').replace(/&#038;/g, '&').replace(/&#8211;/g, '-')}
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
          
          {isLocked && (
            <div style={{
              position: 'relative',
              marginTop: '-200px',
              paddingTop: '200px',
              background: 'linear-gradient(to bottom, transparent 0%, var(--bg-color) 60%, var(--bg-color) 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: '60px',
              zIndex: 5
            }}>
              <div style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                padding: '40px 48px',
                borderRadius: '24px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-lg), 0 0 0 1px inset rgba(255,255,255,0.1)',
                zIndex: 10,
                maxWidth: '500px',
                width: '90%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)'
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h3 style={{ 
                  fontSize: '1.6rem', 
                  marginBottom: '12px', 
                  fontWeight: '700', 
                  background: 'linear-gradient(135deg, var(--text-color), var(--primary-color))', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent' 
                }}>
                  ఈ కంటెంట్ కేవలం ప్రీమియం సభ్యుల కోసం మాత్రమే
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1.05rem', lineHeight: '1.6' }}>
                  అన్ని ఆర్టికల్స్‌ను అపరిమితంగా చదవడానికి సబ్‌స్క్రైబ్ చేసుకోండి.
                </p>
                <Link href="/premium" style={{
                  padding: '16px 36px',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
                  color: '#fff',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  textDecoration: 'none',
                  boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'inline-block'
                }}>
                  Unlock Premium
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

        {post.hide_ai_note !== true && (
          <div className="ai-note" style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #666)', marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.03))', borderRadius: '8px', borderLeft: '4px solid var(--accent-color, #0070f3)' }}>
            <p style={{ margin: 0, lineHeight: '1.6' }}>
              <span style={{ fontWeight: 'bold' }}>గమనిక:</span> AI నా రచయిత కాదు… నా వేగాన్ని పెంచే సహాయకుడు మాత్రమే. ఆలోచన నాది. భావం నాది. చివరకు సరిదిద్దుకునేదీ (ఎడిట్ చేసేదీ) నేనే. ఈ మిషన్కి నేనే స్వయంగా శిక్షణ ఇచ్చాను… అందుకే ఇది నా శైలిలోనే మాట్లాడుతోంది. 😄
            </p>
          </div>
        )}

        <AdBanner dataAdSlot={process.env.NEXT_PUBLIC_ADSENSE_BOTTOM_SLOT_ID} />

        <AppDownloadButton style={{ marginTop: '30px', marginBottom: '20px' }} />
      </div>
    </article>
  );
}
