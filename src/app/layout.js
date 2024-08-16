// src/app/layout.js
import { Inter } from 'next/font/google';
import { GeistSans } from "geist/font/sans";
import './reset.css';
import ReduxProvider from '../store/Provider';
import { AuthProvider } from '../context/AuthContext'

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FlashWorld AI - Flashcards for everyone',
  description: 'Flashcards for everyone, but as if your best friend passed you their notes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <ReduxProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
