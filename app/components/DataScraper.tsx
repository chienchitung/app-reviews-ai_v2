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
      setMessage('爬蟲完成!');
      
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 max-w-2xl mx-auto">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Apple Store URL
          </label>
          <input
            type="text"
            name="appleStore"
            value={storeUrls.appleStore}
            onChange={handleUrlChange}
            placeholder="輸入 Apple Store 應用程式網址"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Google Play Store URL
          </label>
          <input
            type="text"
            name="googlePlay"
            value={storeUrls.googlePlay}
            onChange={handleUrlChange}
            placeholder="輸入 Google Play Store 應用程式網址"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={handleScrape}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 transition-colors duration-200"
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

      {reviews.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">評論資料</h2>
            <button
              onClick={() => setShowTable(!showTable)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              {showTable ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  隱藏資料表
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  查看資料表
                </>
              )}
            </button>
          </div>

          {showTable && (
            <div className="overflow-x-auto border rounded-lg">
              <DataTable data={reviews} />
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleDownloadCSV}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              下載 CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 