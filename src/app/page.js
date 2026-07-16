import Link from 'next/link';
import { getPaginatedPosts } from '@/lib/api';
import AppDownloadButton from '@/components/AppDownloadButton';
import Pagination from '@/components/Pagination';
import PostCard from '@/components/PostCard';

export default async function Home() {
  const currentPage = 1;
  const { posts } = await getPaginatedPosts(currentPage, 6);

  return (
    <div className="home-wrapper">
      <section className="hero-section animate-fade-in-up">
        <h1 className="hero-title text-gradient">మనసు పిలుపు</h1>
        <p className="hero-subtitle">
          మనసులోంచి వచ్చిన మాటలు
        </p>
        <div className="hero-intro">
          <p>
            సాహిత్యంపై ఉన్న మక్కువతో, నా మనసులోని భావాలకు అక్షర రూపం ఇచ్చే చిన్న ప్రయత్నమే ఈ వేదిక. ఇక్కడ మీరు చదివే ప్రతి కథ, కవిత, వ్యాసం నా అంతరంగంలోంచి పుట్టినవే. ఆధునిక ప్రపంచపు హడావిడికి దూరంగా, కాసేపు ప్రశాంతంగా కూర్చుని చదువుకోవడానికి ఈ వెబ్‌సైట్‌ను సృష్టించాను. మీ పఠనానుభూతి ప్రశాంతంగా, ఆనందంగా సాగాలని మనస్ఫూర్తిగా ఆశిస్తున్నాను.
          </p>
          <AppDownloadButton style={{ marginTop: '20px' }} />
        </div>
      </section>

      <section className="articles-section animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <h2>తాజా వ్యాసాలు</h2>
        </div>

        <div className="posts-grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/blog" className="btn-primary" style={{ padding: '10px 24px', borderRadius: '30px', display: 'inline-block', textDecoration: 'none', fontWeight: 'bold' }}>
            అన్ని వ్యాసాలు చదవండి &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
