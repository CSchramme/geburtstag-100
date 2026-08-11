import { Cinzel, Cinzel_Decorative, EB_Garamond } from 'next/font/google';
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

export const metadata = {
  title: 'Tamara & Ralph – 100 Jahre',
  description: 'Ein mittelalterliches Hoffest zu Ehren zweier Kronen, die gemeinsam 100 Jahre vollenden.'
};

export const viewport = {
  themeColor: '#120b07',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={`${cinzel.variable} ${cinzelDecorative.variable} ${garamond.variable}`}>
      <body>{children}</body>
    </html>
  );
}
