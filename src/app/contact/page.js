import Link from 'next/link';

export const metadata = {
  title: 'సంప్రదించండి | Sridhar Blog',
  description: 'Contact Sridhar.',
};

export default function ContactPage() {
  return (
    <div className="single-post animate-fade-in">
      <div className="post-container">
        <Link href="/" className="back-link">
          &larr; Back to home
        </Link>
        
        <header className="post-header">
          <h1 className="post-title">నన్ను సంప్రదించండి</h1>
        </header>

        <div className="post-content support-content">
          <p>నమస్కారం!</p>
          
          <p>నా బ్లాగ్ చదువుతున్నందుకు ధన్యవాదాలు. మీకు ఏవైనా సందేహాలు ఉన్నా, నా రచనల గురించి మీ అభిప్రాయాలు పంచుకోవాలనుకున్నా, లేదా నాతో మాట్లాడాలనుకున్నా, కింద ఉన్న వివరాల ద్వారా నన్ను సంప్రదించవచ్చు.</p>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="name" style={{ fontWeight: '500' }}>పేరు (Name)</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="మీ పేరు..." 
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--card-bg)', 
                  color: 'var(--text-color)',
                  fontFamily: 'inherit',
                  outline: 'none'
                }} 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="email" style={{ fontWeight: '500' }}>ఈమెయిల్ (Email)</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="మీ ఈమెయిల్..." 
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--card-bg)', 
                  color: 'var(--text-color)',
                  fontFamily: 'inherit',
                  outline: 'none'
                }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="message" style={{ fontWeight: '500' }}>సందేశం (Message)</label>
              <textarea 
                id="message" 
                name="message" 
                rows="5" 
                placeholder="మీ సందేశం ఇక్కడ రాయండి..." 
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--card-bg)', 
                  color: 'var(--text-color)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical'
                }} 
              />
            </div>

            <button 
              type="submit" 
              className="support-btn" 
              style={{ border: 'none', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '8px' }}
            >
              పంపండి (Submit)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
