const API_URL = 'https://live-sridhar-silver.pantheonsite.io/wp-json/wp/v2';

export async function getAllPosts() {
  const res = await fetch(`${API_URL}/posts?per_page=100&_embed`, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  return res.json();
}

export async function getPaginatedPosts(page = 1, perPage = 9) {
  const res = await fetch(`${API_URL}/posts?per_page=${perPage}&page=${page}&_embed`, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  
  const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
  const posts = await res.json();
  
  return { posts, totalPages };
}

export async function getPostBySlug(slug) {
  const res = await fetch(`${API_URL}/posts?slug=${slug}&_embed`, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error('Failed to fetch post');
  }
  const posts = await res.json();
  return posts.length > 0 ? posts[0] : null;
}

export async function getCommentsByPostId(postId) {
  const res = await fetch(`${API_URL}/comments?post=${postId}&order=asc`, { next: { revalidate: 60 } });
  if (!res.ok) {
    return [];
  }
  return res.json();
}
