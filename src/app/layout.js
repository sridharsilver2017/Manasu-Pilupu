import "./globals.css";
import Link from "next/link";
import { Ramabhadra, Mandali } from "next/font/google";
import { Home, Phone, Heart } from "lucide-react";

import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import PwaRegistry from "@/components/PwaRegistry";
import PushNotificationManager from "@/components/PushNotificationManager";

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
    <html lang="te" className={`${ramabhadra.variable} ${mandali.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <PwaRegistry />
          <PushNotificationManager />
          <div className="container">
            <header className="site-header">
              <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="logo-text">మనసు పిలుపు</span>
              </Link>
              <nav className="site-nav hide-on-mobile">
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
              <p className="footer-credits" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Designed by <a href="https://advaitadesigns.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Advaita Designs</a>
              </p>
            </footer>

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-bottom-nav hide-on-desktop">
              <Link href="/" className="mobile-nav-item">
                <Home />
                <span>హోమ్</span>
              </Link>
              <Link href="/contact" className="mobile-nav-item">
                <Phone />
                <span>సంప్రదించండి</span>
              </Link>
              <Link href="/support" className="mobile-nav-item">
                <Heart />
                <span>సపోర్ట్</span>
              </Link>
              <div className="mobile-nav-item">
                <ThemeToggle />
                <span>థీమ్</span>
              </div>
            </nav>

          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

