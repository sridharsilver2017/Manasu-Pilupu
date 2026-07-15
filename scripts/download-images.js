const fs = require('fs');
const path = require('path');
const https = require('https');

const API_URL = 'https://dev-sridhar-silver.pantheonsite.io/wp-json/wp/v2';
const WP_UPLOADS_URL = 'https://dev-sridhar-silver.pantheonsite.io/wp-content/uploads/';
const IMAGES_DIR = path.join(process.cwd(), 'public', 'wp-images');

// Ensure directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Convert WP URL to local filename
function getLocalFilename(wpUrl) {
  const match = wpUrl.match(/wp-content\/uploads\/(.*)$/);
  if (match) {
    return match[1].replace(/\//g, '-');
  }
  return null;
}

// Download a single file
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      // console.log(`Skipping existing: ${filepath}`);
      return resolve();
    }
    
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode} for ${url}`));
      }
    }).on('error', reject);
  });
}

async function fetchAllPosts() {
  let allPosts = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await fetch(`${API_URL}/posts?per_page=100&page=${page}&_embed=1`);
    if (!res.ok) break;
    
    if (page === 1) {
      totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
    }
    
    const posts = await res.json();
    allPosts = allPosts.concat(posts);
    page++;
  }
  return allPosts;
}

async function run() {
  console.log('Downloading WordPress images...');
  
  try {
    const posts = await fetchAllPosts();
    const imageUrls = new Set();
    
    // Extract images
    posts.forEach(post => {
      // 1. Featured image
      if (post._embedded && post._embedded['wp:featuredmedia']) {
        const url = post._embedded['wp:featuredmedia'][0].source_url;
        if (url && url.includes('wp-content/uploads/')) {
          imageUrls.add(url);
        }
      }
      
      // 2. Content images
      const content = post.content.rendered;
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      let match;
      while ((match = imgRegex.exec(content)) !== null) {
        const url = match[1];
        if (url.includes('wp-content/uploads/')) {
          imageUrls.add(url);
        }
      }
    });

    console.log(`Found ${imageUrls.size} unique images to download.`);
    
    let downloadedCount = 0;
    const downloadPromises = Array.from(imageUrls).map(async (url) => {
      const filename = getLocalFilename(url);
      if (filename) {
        const filepath = path.join(IMAGES_DIR, filename);
        try {
          await downloadImage(url, filepath);
          downloadedCount++;
        } catch (err) {
          console.error(`Failed to download ${url}: ${err.message}`);
        }
      }
    });

    await Promise.all(downloadPromises);
    console.log(`Finished processing images. New downloads/verified: ${downloadedCount}`);
  } catch (err) {
    console.error('Error during image download:', err);
    process.exit(1);
  }
}

run();
