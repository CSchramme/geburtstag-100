import { Cinzel, Cinzel_Decorative, EB_Garamond, Playfair_Display, Inter } from 'next/font/google';
import { get } from '@/lib/store';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap'
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-cinzel-decorative',
  display: 'swap'
});

const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-garamond',
  display: 'swap'
});

// "Modern / Neutral" theme's font pairing (see lib/theme.js's
// buildFontVars) - loaded alongside the medieval fonts so switching themes
// is an instant CSS variable swap, no page reload needed.
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-modern-display',
  display: 'swap'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-modern-body',
  display: 'swap'
});

export async function generateMetadata() {
  const { party } = get();
  const title = party?.eventTitle || party?.coupleNames || '100 Jahre';
  return {
    title,
    description: party?.introText || 'Eine private Feier.'
  };
}

export const viewport = {
  themeColor: '#120b07',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="de"
      className={`${cinzel.variable} ${cinzelDecorative.variable} ${garamond.variable} ${playfair.variable} ${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
