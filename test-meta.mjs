import { getAllPosts, getPostBySlug } from './src/lib/api.js';

function decodeHtmlEntities(text) {
  if (!text) return '';
  return text
    .replace(/&#8230;/g, '…')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—');
}

async function test() {
  const posts = await getAllPosts();
  if (posts && posts.length > 0) {
    const slug = posts[0].slug;
    const post = await getPostBySlug(slug);
    
    let imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    if (imageUrl && imageUrl.startsWith('/')) {
      imageUrl = `https://manasupilupu.pages.dev${imageUrl}`;
    }
    const finalImage = imageUrl || 'https://manasupilupu.pages.dev/default-share.jpg';

    console.log("Final Image URL:", finalImage);
  }
}
test();
