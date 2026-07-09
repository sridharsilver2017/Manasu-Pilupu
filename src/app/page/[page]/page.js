import Image from "next/image";
import Link from 'next/link';
import { getPaginatedPosts } from '@/lib/api';
import Pagination from '@/components/Pagination';

export async function generateStaticParams() {
  const { totalPages } = await getPaginatedPosts(1, 9);
  
  const paths = [];
  // We start from page 2, because page 1 is the main homepage (/)
  for (let i = 2; i <= totalPages; i++) {
    paths.push({
      page: i.toString(),
    });
  }
  
  return paths;
}

export default async function PaginatedHome({ params }) {
  const resolvedParams = await params;
  const currentPage = parseInt(resolvedParams.page, 10);
  const { posts, totalPages } = await getPaginatedPosts(currentPage, 9);

  return (
    <div className="home-wrapper">
      <section className="hero-section animate-fade-in-up">
        <h1 className="hero-title">మనసు పిలుపు</h1>
        <p className="hero-subtitle">
          మనసులోంచి వచ్చిన మాటలు
        </p>
        <div className="hero-intro">
          <p>
            సాహిత్యంపై ఉన్న మక్కువతో, నా మనసులోని భావాలకు అక్షర రూపం ఇచ్చే చిన్న ప్రయత్నమే ఈ వేదిక. ఇక్కడ మీరు చదివే ప్రతి కథ, కవిత, వ్యాసం నా అంతరంగంలోంచి పుట్టినవే. ఆధునిక ప్రపంచపు హడావిడికి దూరంగా, కాసేపు ప్రశాంతంగా కూర్చుని చదువుకోవడానికి ఈ వెబ్‌సైట్‌ను సృష్టించాను. మీ పఠనానుభూతి ప్రశాంతంగా, ఆనందంగా సాగాలని మనస్ఫూర్తిగా ఆశిస్తున్నాను.
          </p>
        </div>
      </section>

      <section className="articles-section animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <h2>తాజా వ్యాసాలు (Latest Articles)</h2>
        </div>

        <div className="posts-grid">
          {posts.map((post) => (
            <Link href={`/posts/${post.slug}`} key={post.id} className="post-card">
              {post._embedded && post._embedded['wp:featuredmedia'] ? (
                <div className="post-card-image-wrapper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post._embedded['wp:featuredmedia'][0].source_url}
                    alt={post.title.rendered}
                    className="post-card-image"
                  />
                </div>
              ) : (
                <div className="post-card-image-wrapper fallback-image-wrapper">
                  <div className="fallback-gradient">
                    <span>మనసు పిలుపు</span>
                  </div>
                </div>
              )}
              <div className="post-card-content">
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
                  <span className="read-more-btn">Read more &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </section>
    </div>
  );
}
