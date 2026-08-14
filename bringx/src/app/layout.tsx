import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'BRINGX | AI Student Performance Predictor',
  description: 'Predict performance across 5 subjects using Linear & Logistic Regression ML models',
  keywords: 'student performance prediction, AI, machine learning, multi-subject, data science',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased text-white" style={{ background: '#000' }}>
        {/* Subtle ambient white glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.04]"
               style={{
                 background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)',
                 animation: 'float 12s ease-in-out infinite alternate',
               }} />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-[0.03]"
               style={{
                 background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)',
                 animation: 'float 15s ease-in-out infinite alternate-reverse',
               }} />
        </div>
        {children}
      </body>
    </html>
  );
}
