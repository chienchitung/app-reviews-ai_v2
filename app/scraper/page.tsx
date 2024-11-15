'use client';

import DataScraper from '../components/DataScraper';

export default function ScraperPage() {
  return (
    <main className="min-h-screen bg-gray-100 pt-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            應用程式評論爬取
          </h1>
          <DataScraper />
        </div>
      </div>
    </main>
  );
} 