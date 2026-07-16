import Link from 'next/link';

export default function PostCard({ post }) {
  // Extract categories from _embedded
  const categories = post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0]
    ? post._embedded['wp:term'][0].filter(term => term.taxonomy === 'category')
    : [];

  return (
    <Link href={`/posts/${post.slug}`} className="post-card">
      {post._embedded && post._embedded['wp:featuredmedia'] && (
        <div className="post-card-image-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${post._embedded['wp:featuredmedia'][0].source_url}?t=${new Date(post.modified || post.date).getTime()}`}
            alt={post.title.rendered}
            className="post-card-image"
          />
        </div>
      )}
      <div className="post-card-content">
        {categories.length > 0 && (
          <div className="post-card-categories" style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <span key={cat.id} style={{ fontSize: '0.75rem', backgroundColor: 'var(--primary-color)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                {cat.name}
              </span>
            ))}
          </div>
        )}
        <h2
          className="post-card-title"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <div
          className="post-card-excerpt"
          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
        />
        <div className="post-card-meta">
          <span>{new Date(post.date).toLocaleDateString()}</span>
          <span className="read-more-link">
            మరింత చదవండి <span className="arrow">&rarr;</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
