const API_URL = 'https://dev-sridhar-silver.pantheonsite.io/wp-json/wp/v2';
const BUILD_TIMESTAMP = Date.now();
const cacheStrategy = process.env.NODE_ENV === 'development' ? 'no-store' : 'force-cache';

function rewriteImageUrls(post) {
  if (!post) return post;
  
  const getLocalUrl = (wpUrl) => {
    if (!wpUrl) return wpUrl;
    const match = wpUrl.match(/wp-content\/uploads\/(.*)$/);
    if (match) {
      return `/wp-images/${match[1].replace(/\//g, '-')}`;
    }
    return wpUrl;
  };

  // Clone post to avoid mutating cache directly if it matters
  const p = { ...post, _embedded: { ...post._embedded }, content: { ...post.content } };

  // Rewrite featured image
  if (p._embedded && p._embedded['wp:featuredmedia'] && p._embedded['wp:featuredmedia'].length > 0) {
    // Deep clone to safely mutate
    p._embedded['wp:featuredmedia'] = [ { ...p._embedded['wp:featuredmedia'][0] } ];
    const originalUrl = p._embedded['wp:featuredmedia'][0].source_url;
    p._embedded['wp:featuredmedia'][0].source_url = getLocalUrl(originalUrl);
  }

  // Rewrite content images and strip srcset
  if (p.content && p.content.rendered) {
    let newContent = p.content.rendered.replace(
      /(<img[^>]+src=")([^">]+)(")/g,
      (match, p1, url, p3) => `${p1}${getLocalUrl(url)}${p3}`
    );
    newContent = newContent.replace(/srcset="[^"]+"/g, '');
    p.content.rendered = newContent;
  }

  return p;
}

export async function getAllPosts() {
  const res = await fetch(`${API_URL}/posts?per_page=100&_embed=1&_t=${BUILD_TIMESTAMP}`, { cache: cacheStrategy });
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  const posts = await res.json();
  return posts.map(rewriteImageUrls);
}

export async function getPaginatedPosts(page = 1, perPage = 9) {
  const res = await fetch(`${API_URL}/posts?per_page=${perPage}&page=${page}&_embed=1&_t=${BUILD_TIMESTAMP}`, { cache: cacheStrategy });
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  
  const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
  const posts = await res.json();
  
  return { posts: posts.map(rewriteImageUrls), totalPages };
}

export async function getPostBySlug(slug) {
  const res = await fetch(`${API_URL}/posts?slug=${slug}&_embed=1&_t=${BUILD_TIMESTAMP}`, { cache: cacheStrategy });
  if (!res.ok) {
    throw new Error('Failed to fetch post');
  }
  const posts = await res.json();
  return posts.length > 0 ? rewriteImageUrls(posts[0]) : null;
}

export async function getCommentsByPostId(postId) {
  const res = await fetch(`${API_URL}/comments?post=${postId}&order=asc&_t=${BUILD_TIMESTAMP}`, { cache: cacheStrategy });
  if (!res.ok) {
    return [];
  }
  return res.json();
}
