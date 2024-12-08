import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import Link from 'next/link';
import Chatbot from './components/Chatbot';

// 配置字體
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'APP評論分析平台',
  description: '整合 Apple Store 與 Google Play 的評論數據，提供深入的用戶反饋分析',
  keywords: 'APP評論, 數據分析, 用戶反饋, Apple Store, Google Play',
  authors: [{ name: 'APP評論分析平台團隊' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: 'https://app-reviews-ai-v2.vercel.app',
    title: 'APP評論分析平台',
    description: '整合 Apple Store 與 Google Play 的評論數據，提供深入的用戶反饋分析',
    siteName: 'APP評論分析平台'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" className={inter.className}>
      <head>
        <meta name="viewport" content={`${viewport.width}, ${viewport.initialScale}, ${viewport.maximumScale}`} />
      </head>
      <body className="h-full">
        <div className="min-h-full flex flex-col">
          <Navbar />
          <div className="flex-grow">
            {children}
          </div>
          {/* Footer */}
          <footer className="bg-gray-800">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 平台介紹 */}
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4">關於平台</h3>
                  <p className="text-gray-400 text-sm">
                    AppReviews AI提供完整的評論爬取和分析服務，
                    幫助開發者更好地理解用戶需求和反饋。
                  </p>
                </div>
                
                {/* 快速連結 */}
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4">快速連結</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/analysis" className="text-gray-400 hover:text-white text-sm">
                        評論分析
                      </Link>
                    </li>
                    <li>
                      <Link href="/scraper" className="text-gray-400 hover:text-white text-sm">
                        資料爬取
                      </Link>
                    </li>
                    <li>
                      <Link href="/learn" className="text-gray-400 hover:text-white text-sm">
                        學習中心
                      </Link>
                    </li>
                  </ul>
                </div>
                
                
                {/* 聯絡資訊 */}
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4">聯絡我們</h3>
                  <ul className="space-y-2">
                    <li className="text-gray-400 text-sm">
                      Email: support@appreviewsai.com
                    </li>
                    <li className="text-gray-400 text-sm">
                      電話: (02) 1234-5678
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* 版權資訊 */}
              <div className="mt-8 pt-8 border-t border-gray-700">
                <p className="text-center text-gray-400 text-sm">
                  © {new Date().getFullYear()} AppReviews AI. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
        <Chatbot />
      </body>
    </html>
  );
}
