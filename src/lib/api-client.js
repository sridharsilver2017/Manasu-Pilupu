const API_URL = 'https://dev-sridhar-silver.pantheonsite.io/wp-json/wp/v2';

function rewriteImageUrls(post) {
  if (!post) return post;
  
  // On the client side (in the app), we can't reliably load images from the local fs
  // if they were added after the build. We'll try to load the remote URL directly.
  // We'll leave the image rewriting logic simpler here to just return the original remote URL
  // which is fine since the app requires an internet connection to fetch the live posts anyway.
  
  const p = { ...post, _embedded: { ...post._embedded }, content: { ...post.content } };

  // Rewrite content images and strip srcset
  if (p.content && p.content.rendered) {
    let newContent = p.content.rendered.replace(/srcset="[^"]+"/g, '');
    p.content.rendered = newContent;
  }

  return p;
}

export async function getPaginatedPostsClient(page = 1, perPage = 9) {
  // Use cache: 'no-store' to ensure we always get live data
  const res = await fetch(`${API_URL}/posts?per_page=${perPage}&page=${page}&_embed=1`, { 
    cache: 'no-store' 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  
  const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
  const posts = await res.json();
  
  return { posts: posts.map(rewriteImageUrls), totalPages };
}

export async function getAllPostsClient() {
  const res = await fetch(`${API_URL}/posts?per_page=100&_embed=1`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  const posts = await res.json();
  return posts.map(rewriteImageUrls);
}

export async function getPostBySlugClient(slug) {
  const res = await fetch(`${API_URL}/posts?slug=${slug}&_embed=1`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch post');
  }
  const posts = await res.json();
  return posts.length > 0 ? rewriteImageUrls(posts[0]) : null;
}

export async function getCommentsByPostIdClient(postId) {
  const res = await fetch(`${API_URL}/comments?post=${postId}&order=asc`, { cache: 'no-store' });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function getAllCategoriesClient() {
  const res = await fetch(`${API_URL}/categories?per_page=100`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }
  return res.json();
}

export async function getCategoryBySlugClient(slug) {
  const res = await fetch(`${API_URL}/categories?slug=${slug}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch category');
  }
  const categories = await res.json();
  return categories.length > 0 ? categories[0] : null;
}

export async function getPostsByCategoryClient(categoryId, page = 1, perPage = 9) {
  const res = await fetch(`${API_URL}/posts?categories=${categoryId}&per_page=${perPage}&page=${page}&_embed=1`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch posts for category');
  }
  
  const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
  const posts = await res.json();
  
  return { posts: posts.map(rewriteImageUrls), totalPages };
}
