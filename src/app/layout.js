import "./globals.css";
import Link from "next/link";
import { Ramabhadra, Mandali } from "next/font/google";
import GoogleTranslate from '@/components/GoogleTranslate';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';

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
          <div className="container">
            <header className="site-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="/" className="logo">
                మనసు పిలుపు
              </Link>
              <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <ThemeToggle />
                <Link href="/support" className="support-nav-btn">
                  నన్ను సపోర్ట్ చేయండి
                </Link>
              </nav>
            </header>
            <main className="animate-fade-in">{children}</main>
            <footer className="site-footer">
              <p>&copy; {new Date().getFullYear()} మనసు పిలుపు. All rights reserved.</p>
              <p className="footer-tagline">మనసులోంచి వచ్చిన మాటలు</p>
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                <GoogleTranslate />
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

