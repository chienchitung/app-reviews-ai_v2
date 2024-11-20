'use client';

import { useState } from 'react';
import DataTable from './DataTable';
import type { Review } from '@/types/feedback';

interface StoreUrls {
  appleStore: string;
  googlePlay: string;
}

export default function DataScraper() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [storeUrls, setStoreUrls] = useState<StoreUrls>({
    appleStore: '',
    googlePlay: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    appleApp: string | null;
    googleApp: string | null;
  } | null>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStoreUrls(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScrape = async () => {
    try {
      if (!storeUrls.appleStore && !storeUrls.googlePlay) {
        setError('請至少輸入一個商店的 URL');
        return;
      }

      setIsLoading(true);
      setMessage('正在爬取資料...');
      setError(null);
      setShowTable(false);

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeUrls),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || '爬蟲請求失敗');
      }

      setReviews(result.data);
      setMessage('爬取完成!');
      
    } catch (error) {
      console.error('爬蟲錯誤:', error);
      setError(error instanceof Error ? error.message : '爬蟲執行失敗，請稍後再試');
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "日期,使用者,評論,評分,平台,開發者回覆,語言\n"
      + reviews.map(row => 
          [
            row.date,
            row.username,
            `"${row.review.replace(/"/g, '""')}"`,
            row.rating.toString(),
            row.platform,
            `"${(row.developerResponse || '').replace(/"/g, '""')}"`,
            row.language
          ].join(",")
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "app_reviews.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      setError(null);
      setSearchResults(null);

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '搜尋失敗');
      }

      const appStoreApp = result.data.find((app: any) => app.platform === 'Apple App Store');
      const playStoreApp = result.data.find((app: any) => app.platform === 'Google Play Store');

      setStoreUrls({
        appleStore: appStoreApp?.link || '',
        googlePlay: playStoreApp?.link || ''
      });

      setSearchResults({
        appleApp: appStoreApp?.name || null,
        googleApp: playStoreApp?.name || null
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : '搜尋失敗，請稍後再試');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    // 清除搜尋相關狀態
    setSearchTerm('');
    setStoreUrls({
      appleStore: '',
      googlePlay: ''
    });
    setSearchResults(null);
    setError(null);
    
    // 清除爬取相關狀態
    setReviews([]);
    setMessage('');
    setShowTable(false);
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 搜尋區塊 */}
      <div className="px-4 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="搜尋應用程式"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2.5 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              disabled={isSearching}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            className="px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            title="清除搜尋"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* 搜尋結果顯示 */}
        {searchResults && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 font-medium">
                  應用程式名稱：{searchResults.appleApp || '未找到相關應用程式'}
                </span>
              </div>
              {searchResults.appleApp && (
                <div className="text-sm text-gray-500 bg-white p-3 rounded-lg border border-gray-100">
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    請確認這是您要爬取評論的應用程式
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 應用程式評論爬取區塊 */}
      <div className="px-4">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Apple Store URL
              </label>
              <input
                type="text"
                name="appleStore"
                value={storeUrls.appleStore}
                onChange={handleUrlChange}
                placeholder="輸入 Apple Store 應用程式網址"
                className="w-full px-4 py-2.5 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Google Play Store URL
              </label>
              <input
                type="text"
                name="googlePlay"
                value={storeUrls.googlePlay}
                onChange={handleUrlChange}
                placeholder="輸入 Google Play Store 應用程式網址"
                className="w-full px-4 py-2.5 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleScrape}
              disabled={isLoading}
              className="px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isLoading ? '爬取中...' : '開始爬取'}
            </button>
          </div>
          
          {message && (
            <p className="text-center text-green-600">
              {message}
            </p>
          )}

          {error && (
            <p className="text-center text-red-600">
              錯誤：{error}
            </p>
          )}
        </div>

        {/* 評論資料表部分 */}
        {reviews.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">評論資料</h2>
              <button
                onClick={() => setShowTable(!showTable)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                {showTable ? '隱藏資料表' : '查看資料表'}
              </button>
            </div>

            {showTable && (
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <DataTable data={reviews} />
              </div>
            )}

            <div className="flex justify-center pt-4">
              <button
                onClick={handleDownloadCSV}
                className="px-6 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                下載 CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 