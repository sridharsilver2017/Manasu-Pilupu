import "./globals.css";
import Link from "next/link";
import Script from "next/script";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Ramabhadra, Mandali } from "next/font/google";
import { Home, Phone, Heart } from "lucide-react";

import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import PwaRegistry from "@/components/PwaRegistry";
import PushNotificationManager from "@/components/PushNotificationManager";
import TrialPopup from "@/components/TrialPopup";
import MaintenanceChecker from "@/components/MaintenanceChecker";
import { AuthProvider } from "@/context/AuthContext";
import { DesktopAuthLink, MobileAuthLink } from "@/components/AuthLinks";
import DisableCopy from "@/components/DisableCopy";

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
  metadataBase: new URL('https://manasupilupu.pages.dev'),
  title: {
    default: "మనసు పిలుపు | మనసులోంచి వచ్చిన మాటలు",
    template: "%s | మనసు పిలుపు"
  },
  description: "మనసులోంచి వచ్చిన మాటలు",
  openGraph: {
    title: "మనసు పిలుపు | మనసులోంచి వచ్చిన మాటలు",
    description: "మనసులోంచి వచ్చిన మాటలు",
    url: 'https://manasupilupu.pages.dev',
    type: "website",
    locale: "te_IN",
    images: [
      {
        url: 'https://manasupilupu.pages.dev/default-share.jpg',
        width: 1200,
        height: 630,
        alt: 'మనసు పిలుపు',
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "మనసు పిలుపు | మనసులోంచి వచ్చిన మాటలు",
    description: "మనసులోంచి వచ్చిన మాటలు",
    images: ['https://manasupilupu.pages.dev/default-share.jpg'],
  },
  other: {
    'google-adsense-account': process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-3718093381606519'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="te" className={`${ramabhadra.variable} ${mandali.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <MaintenanceChecker>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <PwaRegistry />
            <PushNotificationManager />
            <DisableCopy />
            <TrialPopup />
            <div className="container">
            <header className="site-header">
              <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="logo-text">మనసు పిలుపు</span>
              </Link>
              <nav className="site-nav hide-on-mobile">
                <ThemeToggle />
                <Link href="/" className="nav-link">
                  Home
                </Link>
                <Link href="/blog" className="nav-link">
                  Blog
                </Link>
                <Link href="/categories" className="nav-link">
                  Categories
                </Link>
                <Link href="/contact" className="nav-link">
                  Contact
                </Link>
                <DesktopAuthLink />
                {/* <Link href="/support" className="support-nav-btn">
                  నన్ను సపోర్ట్ చేయండి
                </Link> */}
              </nav>
            </header>
            
            <main className="animate-fade-in">{children}</main>
            
            <footer className="site-footer">
              <p>&copy; {new Date().getFullYear()} మనసు పిలుపు. All rights reserved.</p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '10px', marginBottom: '10px' }}>
                <Link href="/privacy-policy" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>ప్రైవసీ పాలసీ</Link>
              </div>
              <p className="footer-credits" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Designed by <a href="https://advaitadesigns.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Advaita Designs</a>
              </p>
            </footer>

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-bottom-nav hide-on-desktop">
              <Link href="/" className="mobile-nav-item">
                <Home />
                <span>Home</span>
              </Link>
              <Link href="/blog" className="mobile-nav-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                <span>Blog</span>
              </Link>
              <Link href="/categories" className="mobile-nav-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span>Categories</span>
              </Link>
              <Link href="/contact" className="mobile-nav-item">
                <Phone />
                <span>Contact</span>
              </Link>
              <MobileAuthLink />
              {/* <Link href="/support" className="mobile-nav-item">
                <Heart />
                <span>సపోర్ట్</span>
              </Link> */}
              <div className="mobile-nav-item">
                <ThemeToggle />
                <span>Theme</span>
              </div>
            </nav>

          </div>
          </ThemeProvider>
          </MaintenanceChecker>
        </AuthProvider>
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
