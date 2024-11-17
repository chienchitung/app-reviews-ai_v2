'use client';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function LearnCenter() {
  const [expandedSections, setExpandedSections] = useState({
    analysis1: false,
    analysis2: false,
    scraper1: false,
    scraper2: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-center sm:text-left">學習中心</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center sm:text-left">評論分析使用指南</h2>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <button 
              onClick={() => toggleSection('analysis1')}
              className="w-full p-4 sm:p-6 flex justify-between items-center hover:bg-gray-50"
            >
              <h3 className="text-lg sm:text-xl font-medium">1. 開始使用評論分析</h3>
              {expandedSections.analysis1 ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections.analysis1 && (
              <div className="p-4 sm:p-6 pt-0 border-t">
                <div className="mb-6 bg-gray-50 p-2 rounded-lg">
                  <Image
                    src="/images/tutorial/analysis-dashboard.png"
                    alt="評論分析儀表板"
                    width={1200}
                    height={800}
                    className="rounded-lg w-full h-auto hover:scale-105 transition-transform duration-300 cursor-pointer"
                    priority
                  />
                </div>
                <ul className="list-disc list-outside ml-5 space-y-3 text-gray-600 text-sm sm:text-base">
                  <li className="leading-relaxed">進入評論分析頁面</li>
                  <li className="leading-relaxed">上傳評論的原始資料</li>
                  <li className="leading-relaxed">點擊「開始分析」</li>
                </ul>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <button 
              onClick={() => toggleSection('analysis2')}
              className="w-full p-4 sm:p-6 flex justify-between items-center hover:bg-gray-50"
            >
              <h3 className="text-lg sm:text-xl font-medium">2. 解讀分析結果</h3>
              {expandedSections.analysis2 ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections.analysis2 && (
              <div className="p-4 sm:p-6 pt-0 border-t">
                <div className="mb-6 bg-gray-50 p-2 rounded-lg">
                  <Image
                    src="/images/tutorial/analysis-results.png"
                    alt="分析結果展示"
                    width={1200}
                    height={800}
                    className="rounded-lg w-full h-auto hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />
                </div>
                <ul className="list-disc list-outside ml-5 space-y-3 text-gray-600 text-sm sm:text-base">
                  <li className="leading-relaxed">查看情感分析圖表，了解用戶評價趨勢</li>
                  <li className="leading-relaxed">透過關鍵字雲了解用戶評論的主題</li>
                  <li className="leading-relaxed">分析評分分布，掌握用戶滿意度</li>
                  <li className="leading-relaxed">查看詳細的評論內容分類</li>
                  <li className="leading-relaxed">查看生成洞察分析報告</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6 text-center sm:text-left">資料爬取教學</h2>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <button 
              onClick={() => toggleSection('scraper1')}
              className="w-full p-4 sm:p-6 flex justify-between items-center hover:bg-gray-50"
            >
              <h3 className="text-lg sm:text-xl font-medium">1. 設定爬取任務</h3>
              {expandedSections.scraper1 ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections.scraper1 && (
              <div className="p-4 sm:p-6 pt-0 border-t">
                <div className="mb-6 bg-gray-50 p-2 rounded-lg">
                  <Image
                    src="/images/tutorial/scraper-setup.png"
                    alt="爬取任務設定"
                    width={1200}
                    height={800}
                    className="rounded-lg w-full h-auto hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />
                </div>
                <ul className="list-disc list-outside ml-5 space-y-3 text-gray-600 text-sm sm:text-base">
                  <li className="leading-relaxed">輸入目標應用程式的名稱</li>
                  <li className="leading-relaxed">確認應用程式的名稱是否正確</li>
                  <li className="leading-relaxed">點擊「開始爬取」，等待爬取完成</li>
                </ul>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <button 
              onClick={() => toggleSection('scraper2')}
              className="w-full p-4 sm:p-6 flex justify-between items-center hover:bg-gray-50"
            >
              <h3 className="text-lg sm:text-xl font-medium">2. 查看爬取結果</h3>
              {expandedSections.scraper2 ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections.scraper2 && (
              <div className="p-4 sm:p-6 pt-0 border-t">
                <div className="mb-6 bg-gray-50 p-2 rounded-lg">
                  <Image
                    src="/images/tutorial/scraper-results.png"
                    alt="爬取結果管理"
                    width={1200}
                    height={800}
                    className="rounded-lg w-full h-auto hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />
                </div>
                <ul className="list-disc list-outside ml-5 space-y-3 text-gray-600 text-sm sm:text-base">
                  <li className="leading-relaxed">在儀表板查看爬取進度</li>
                  <li className="leading-relaxed">下載評論數據（CSV格式）</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
} 