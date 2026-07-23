import Link from 'next/link';
import LikeButton from './LikeButton';

export default function PostCard({ post }) {
  // Extract categories from _embedded
  const categories = post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0]
    ? post._embedded['wp:term'][0].filter(term => term.taxonomy === 'category')
    : [];

  let imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  if (imageUrl) {
    const match = imageUrl.match(/wp-content\/uploads\/(.*)$/);
    if (match) {
      const localFilename = match[1].replace(/\//g, '-');
      imageUrl = `/wp-images/${localFilename}?t=${new Date(post.modified || post.date).getTime()}`;
    } else {
      imageUrl = `${imageUrl}?t=${new Date(post.modified || post.date).getTime()}`;
    }
  }

  return (
    <div className="post-card" style={{ position: 'relative' }}>
      {imageUrl && (
        <div className="post-card-image-wrapper" style={{ position: 'relative' }}>
          <Link href={`/posts/${post.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={post.title.rendered}
              className="post-card-image"
            />
          </Link>
        </div>
      )}
      <div className="post-card-content">
        <Link href={`/posts/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2
            className="post-card-title"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
        </Link>
        <div
          className="post-card-excerpt"
          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
        />
        <div className="post-card-meta">
          <div className="post-card-categories" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <Link href={`/category/${cat.slug}`} key={cat.id} style={{ fontSize: '0.7rem', backgroundColor: 'rgba(0, 20, 80, 0.85)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', textDecoration: 'none' }}>
                {cat.name}
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LikeButton postId={post.id} style={{ padding: '4px 8px', fontSize: '12px', height: '28px' }} />
            <Link href={`/posts/${post.slug}`} className="read-more-link" style={{ textDecoration: 'none' }}>
              మరింత చదవండి <span className="arrow">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
