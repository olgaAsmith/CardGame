import type { Metadata } from 'next';
import { Jura } from 'next/font/google';
import './globals.css';
import { OrientationWarning } from './components/OrientationWarning';

const jura = Jura({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jura',
});

export const metadata: Metadata = {
  title: 'Game',
  description: 'Playing Games',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${jura.variable} antialiased`}>
        <OrientationWarning />
        {children}
      </body>
    </html>
  );
}
