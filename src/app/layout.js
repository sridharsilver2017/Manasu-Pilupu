import "./globals.css";
import Link from "next/link";
import { Ramabhadra, Mandali } from "next/font/google";

import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import PwaRegistry from "@/components/PwaRegistry";

const ramabhadra = Ramabhadra({ 
  weight: "400", 
  subsets: ["telugu", "latin"], 
  variable: "--font-heading" 
});

const mandali = Mandali({ 
  weight: "400", 
  subsets: ["telugu", "latin"], 
  variable: "--font-body" 
});

export const metadata = {
  metadataBase: new URL('https://dev-sridhar-silver.pantheonsite.io'),
  title: {
    default: "మనసు పిలుపు | మనసులోంచి వచ్చిన మాటలు",
    template: "%s | మనసు పిలుపు"
  },
  description: "మనసులోంచి వచ్చిన మాటలు",
  openGraph: {
    title: "మనసు పిలుపు | మనసులోంచి వచ్చిన మాటలు",
    description: "మనసులోంచి వచ్చిన మాటలు",
    type: "website",
    locale: "te_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "మనసు పిలుపు | మనసులోంచి వచ్చిన మాటలు",
    description: "మనసులోంచి వచ్చిన మాటలు",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${ramabhadra.variable} ${mandali.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <PwaRegistry />
          <div className="container">
            <header className="site-header">
              <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/icon.png" alt="మనసు పిలుపు Logo" width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover' }} />
                <span className="logo-text">మనసు పిలుపు</span>
              </Link>
              <nav className="site-nav">
                <ThemeToggle />
                <Link href="/contact" className="nav-link">
                  సంప్రదించండి
                </Link>
                <Link href="/support" className="support-nav-btn">
                  నన్ను సపోర్ట్ చేయండి
                </Link>
              </nav>
            </header>
            <main className="animate-fade-in">{children}</main>
            <footer className="site-footer">
              <p>&copy; {new Date().getFullYear()} మనసు పిలుపు. All rights reserved.</p>
              <p className="footer-tagline">మనసులోంచి వచ్చిన మాటలు</p>
              <p className="footer-credits" style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Designed by <a href="https://advaitadesigns.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Advaita Designs</a>
              </p>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

