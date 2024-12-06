'use client';

import { useState, useRef, useEffect } from 'react';
import type { AnalysisResult } from '@/types/feedback';
import Image from "next/image";
import { SentimentPieChart } from '../components/charts/SentimentPieChart';
import { KeywordsBarChart } from '../components/charts/KeywordsBarChart';
import { WordCloud } from '../components/charts/WordCloud';
import { MonthlyTrendChart, RatingDistributionChart } from '../components/charts/TrendChart';
import { CategoryBarChart } from '../components/charts/CategoryBarChart';

// 自定義 Logo SVG 組件 - AI 字樣
const LogoSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
    <g transform="scale(0.213333)">
      <rect width="150" height="150" fill="#F9F9F9"/>    
      {/* 中間大四角星 */}
      <path d="M96.1375 51.2609C101.308 50.3007 104.299 47.2723 105.149 42.1759C105.684 47.0877 109.432 50.633 114.086 51.2239C108.971 52.1657 105.961 55.1755 105.112 60.3273C104.853 57.9822 103.93 55.9141 102.268 54.2153C100.569 52.5165 98.5195 51.5563 96.1375 51.2609Z" fill="currentColor"/>
      {/* 左上小四角星 */}
      <path d="M37.3222 78.0925C59.6985 73.9369 72.6448 60.8307 76.3209 38.7741C78.6385 60.0316 94.8613 75.3753 115 77.9326C92.8634 82.0083 79.8372 95.0345 76.1611 117.331C75.0423 107.182 71.0465 98.2312 63.8541 90.8789C56.5019 83.5267 47.6313 79.3711 37.3222 78.0925Z" fill="currentColor"/>
      {/* 右上小四角星 */}
      <path d="M35 44.7824C41.8937 43.5022 45.8822 39.4644 47.0148 32.6692C47.7288 39.2182 52.7267 43.9453 58.931 44.7332C52.1112 45.9888 48.0981 50.002 46.9655 56.8711C46.6208 53.7443 45.3898 50.9868 43.174 48.7217C40.9089 46.4566 38.176 45.1764 35 44.7824Z" fill="currentColor"/>
    </g>
  </svg>
);

// 修改 filters 的型別定義
interface Filters {
  dateRange: {
    start: string;
    end: string;
  };
  devices: string[];
  ratings: number[];
  sentiments: string[];
  categories: string[];
}

// 新增點擊外部關閉的 hook
const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
};

export default function AnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 計算總頁數
  const totalPages = analysisResult ? Math.ceil(analysisResult.feedbacks.length / itemsPerPage) : 0;

  // 獲取當前頁的數據
  const getCurrentPageData = () => {
    if (!analysisResult) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return analysisResult.feedbacks.slice(startIndex, startIndex + itemsPerPage);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      // 檢查檔案類型
      if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
        alert('請上傳 .csv, .xlsx 或 .xls 格式的檔案');
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // 清除無效的選擇
        }
        return;
      }
      // 檢查檔案大小（例如限制在 10MB 以內）
      if (file.size > 10 * 1024 * 1024) {
        alert('檔案大小不能超過 10MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // 清除無效的選擇
        }
        return;
      }
      console.log('File selected:', file.name);
      setFile(file);
      // 重置分析相關的狀態
      setAnalysisResult(null);
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  // 新增一個 state 來保存原始數據
  const [originalData, setOriginalData] = useState<AnalysisResult | null>(null);

  // 在 AnalysisPage 組件中添加一個新的 state 來存儲所有可用的分類
  const [allCategories, setAllCategories] = useState<string[]>([]);

  // 修改 handleAnalyze 函數中的類型定義
  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '分析請求失敗');
      }

      if (!result.success || !result.data) {
        throw new Error('數據格式錯誤');
      }

      // 提取所有唯一的分類，添加明確的類型定義
      const uniqueCategories = Array.from(new Set(
        result.data.feedbacks.flatMap((f: { category: string }) => 
          f.category.split(/[,，]/).map((c: string) => c.trim())
        )
      )) as string[]; // 明確指定類型為 string[]

      // 設置所有可用的分類
      setAllCategories(uniqueCategories);
      
      // 保存原始數據
      setOriginalData(result.data);
      setAnalysisResult(result.data);
      setUploadStatus('success');
    } catch (error: any) {
      console.error('分析過程出錯:', error);
      setUploadStatus('error');
      setErrorMessage(error?.message || '未知錯誤');
      alert(error?.message || '分析過程發生錯誤，請檢查文件格式是否正確');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      // 檢查檔案類型
      if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
        alert('請上傳 .csv, .xlsx 或 .xls 格式的檔案');
        return;
      }
      // 檢查檔案大小
      if (file.size > 10 * 1024 * 1024) {
        alert('檔案大小不能超過 10MB');
        return;
      }
      setFile(file);
      // 重置分析相關的狀態
      setAnalysisResult(null);
      setUploadStatus('idle');
      setErrorMessage('');
      // 清除 input 的值，確保可以重新選擇相同檔案
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      // 清除當前的值，這樣即使選擇相同的檔案也會觸發 onChange 事件
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // 添加新的 state 來存儲 AI 分析結果
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // 替換原來的 downloadReport 函數
  const generateInsights = async () => {
    if (!analysisResult) return;
    
    setIsGeneratingInsights(true);
    try {
      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: analysisResult.keywords,
          totalFeedbacks: analysisResult.summary.totalCount,
          averageRating: analysisResult.summary.averageRating,
          positiveRatio: analysisResult.summary.positiveRatio,
          neutralRatio: analysisResult.summary.neutralRatio,
          negativeRatio: analysisResult.summary.negativeRatio,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setAiAnalysis(data.analysis);
    } catch (error) {
      console.error('生成分析時發生錯誤:', error);
      alert('生成分析時發生錯誤，請稍後再試');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const [showDataTable, setShowDataTable] = useState(true);

  // 新增篩選器區塊
  const [filters, setFilters] = useState<Filters>({
    dateRange: { start: '', end: '' },
    devices: [],
    ratings: [],
    sentiments: [],
    categories: []
  });

  // 修改 handleFilterChange 函數
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    
    if (originalData) {
      // 每次都從原始數據開始篩選
      const filteredData = originalData.feedbacks.filter(feedback => {
        const date = new Date(feedback.date);
        const matchDate = (!newFilters.dateRange.start || date >= new Date(newFilters.dateRange.start)) &&
                         (!newFilters.dateRange.end || date <= new Date(newFilters.dateRange.end));
        const matchDevice = newFilters.devices.length === 0 || newFilters.devices.includes(feedback.device);
        const matchRating = newFilters.ratings.length === 0 || newFilters.ratings.includes(Math.floor(feedback.rating));
        const matchSentiment = newFilters.sentiments.length === 0 || newFilters.sentiments.includes(feedback.sentiment);
        const matchCategory = newFilters.categories.length === 0 || 
                            feedback.category.split(/[,，]/).some(cat => newFilters.categories.includes(cat.trim()));
        
        return matchDate && matchDevice && matchRating && matchSentiment && matchCategory;
      });

      // 更新摘要數據
      const summary = {
        totalCount: filteredData.length,
        positiveRatio: filteredData.filter(f => f.sentiment === '正面').length / filteredData.length || 0,
        neutralRatio: filteredData.filter(f => f.sentiment === '中性').length / filteredData.length || 0,
        negativeRatio: filteredData.filter(f => f.sentiment === '負面').length / filteredData.length || 0,
        averageRating: filteredData.length ? filteredData.reduce((acc, curr) => acc + curr.rating, 0) / filteredData.length : 0
      };

      // 計算關鍵字統計
      const keywordCounts = filteredData.reduce((acc, feedback) => {
        feedback.keywords.forEach(keyword => {
          acc[keyword] = (acc[keyword] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      const keywords = Object.entries(keywordCounts)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count);

      // 更新分析結果
      setAnalysisResult({
        ...originalData,  // 保持原始數據的其他屬性
        feedbacks: filteredData,
        summary,
        keywords
      });

      // 重置分頁到第一頁
      setCurrentPage(1);
    }
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // 使用 hook
  useClickOutside(datePickerRef, () => setShowDatePicker(false));

  // 設定預設日期範圍 (Year to month)
  const getDefaultDateRange = () => {
    const now = new Date();
    const today = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
    const year = today.getFullYear();
    const month = today.getMonth();

    const startOfYear = new Date(Date.UTC(year, 0, 1)); // 今年1月1日
    const lastMonth = new Date(Date.UTC(year, month - 1, 1)); // 上個月1號

    return {
      start: startOfYear.toISOString().split('T')[0],
      end: lastMonth.toISOString().split('T')[0]
    };
  };

  // 修改時間範圍的處理函數
  const handleQuickDateSelect = (option: string) => {
    // 使用台北時區獲取當前日期
    const now = new Date();
    const today = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
    today.setHours(0, 0, 0, 0);

    let start: Date;
    let end: Date;

    switch (option) {
      case 'thisMonth': {
        // 本月1號到當前日期
        const year = today.getFullYear();
        const month = today.getMonth();
        const currentDate = today.getDate();
        
        start = new Date(Date.UTC(year, month, 1)); // 本月1號
        end = new Date(Date.UTC(year, month, currentDate)); // 當前日期
        break;
      }
      case 'lastMonth': {
        // 上個月的完整月份 (1號到月底)
        const year = today.getFullYear();
        const month = today.getMonth() - 1;
        
        start = new Date(Date.UTC(year, month, 1)); // 上個月1號
        end = new Date(Date.UTC(year, month + 1, 0)); // 上個月最後一天
        break;
      }
      case 'last7days': {
        // 今天往前推7天，不包含今天
        end = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 1)); // 昨天
        start = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 7)); // 7天前
        break;
      }
      case 'last14days': {
        // 今天往前推14天，不包含今天
        end = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 1)); // 昨天
        start = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 14)); // 14天前
        break;
      }
      case 'last30days': {
        // 今天往前推30天，不包含今天
        end = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 1)); // 昨天
        start = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 30)); // 30天前
        break;
      }
      case 'last3Months': {
        // 今天月份的上個月加上前2個月，不包含本月
        const year = today.getFullYear();
        const month = today.getMonth();
        
        // 3個月前的1號到上個月最後一天
        start = new Date(Date.UTC(year, month - 3, 1)); // 3個月前的1號
        end = new Date(Date.UTC(year, month, 0)); // 上個月的最後一天
        break;
      }
      default:
        return;
    }

    // 轉換為 ISO 字符串並只取日期部分 (YYYY-MM-DD)
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    handleFilterChange({
      ...filters,
      dateRange: {
        start: formatDate(start),
        end: formatDate(end)
      }
    });
  };

  // 修改重置篩選函數
  const handleResetFilters = () => {
    // 重置篩選條件 - 移除日期範圍重置為預設值
    setFilters({
      dateRange: { start: '', end: '' }, // 清空日期範圍
      devices: [],
      ratings: [],
      sentiments: [],
      categories: []
    });
    
    // 重置所有圖表和數據到初始狀態
    if (originalData) {
      setAnalysisResult({
        ...originalData,
        feedbacks: originalData.feedbacks,
        summary: {
          totalCount: originalData.feedbacks.length,
          positiveRatio: originalData.feedbacks.filter(f => f.sentiment === '正面').length / originalData.feedbacks.length,
          neutralRatio: originalData.feedbacks.filter(f => f.sentiment === '中性').length / originalData.feedbacks.length,
          negativeRatio: originalData.feedbacks.filter(f => f.sentiment === '負面').length / originalData.feedbacks.length,
          averageRating: originalData.feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / originalData.feedbacks.length
        },
        keywords: originalData.keywords
      });
    }
    
    // 重置分頁到第一頁
    setCurrentPage(1);
    
    // 關閉日期選擇器
    setShowDatePicker(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      {/* 使用說明區塊 */}
      <section className="mb-8 bg-blue-50 rounded-xl p-6 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">使用說明</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>1. 上包含用戶評論的CSV或Excel檔案（僅支援.csv、.xlsx、.xls格式）</p>
              <p>2. 檔案第一列應為欄位標題，至少需包含一個評論內容欄位</p>
              <p>3. 系統將自動分析評論內容，生成以下分析結果：</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>評論分類與情感傾向</li>
                <li>關鍵詞提取與統計</li>
                <li>文字雲視覺化</li>
                <li>整體情感分布分析</li>
              </ul>
              <p>4. 分析完成後可生成詳細洞察報告</p>
            </div>
          </div>
        </div>
      </section>

      {/* 檔案上傳區域 */}
      <section className="mb-12 bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">上傳檔案</h2>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={handleUploadClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept=".csv,.xlsx,.xls" 
            onChange={handleFileUpload}
          />
          {file ? (
            <div className="space-y-2">
              <svg className="w-12 h-12 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-gray-600 dark:text-gray-300">{file.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                點擊重新選擇檔案
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                拖放CSV或Excel檔案到此處
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                或點擊選擇檔案
              </p>
            </>
          )}
        </div>
      </section>

      {/* 分析按鈕 */}
      <section className="mb-8 flex justify-center">
        <button 
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAnalyze}
          disabled={!file || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>分析中...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>開始分析</span>
            </>
          )}
        </button>
      </section>

      {/* 分析結果預覽 */}
      {analysisResult && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">分析結果預覽</h2>
            <button
              onClick={() => setShowDataTable(!showDataTable)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              {showDataTable ? (
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
          
          {showDataTable && (
            <section className="mb-12 bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 w-32">日期</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">評論內容</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 w-24">評分</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 w-32">裝置</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 w-32">分類</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 w-32">情感</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 w-48">關鍵詞</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getCurrentPageData().map((feedback: AnalysisResult['feedbacks'][0], index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{feedback.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{feedback.content}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{feedback.rating}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{feedback.device}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {feedback.category.split(/[,，]/).map((category: string, cidx: number) => (
                              <span 
                                key={cidx} 
                                className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800"
                              >
                                {category.trim()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            feedback.sentiment.includes('正面') ? 'bg-green-100 text-green-800' :
                            feedback.sentiment.includes('負面') ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {feedback.sentiment}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {feedback.keywords.map((keyword: string, kidx: number) => (
                              <span 
                                key={kidx} 
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* 新增分頁控制區域 */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      顯示第 {((currentPage - 1) * itemsPerPage) + 1} 到 {Math.min(currentPage * itemsPerPage, analysisResult.feedbacks.length)} 筆，
                      共 {analysisResult.feedbacks.length} 筆資
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg 
                        className="h-5 w-5 mr-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15 19l-7-7 7-7" 
                        />
                      </svg>
                      上一頁
                    </button>
                    
                    {/* 頁碼顯示 */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="px-2 py-2 text-gray-500">...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一頁
                      <svg 
                        className="h-5 w-5 ml-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5l7 7-7 7" 
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 新增篩選器區塊 - 重新設計版本 */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">數據篩選</h2>
              </div>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                重置篩選
              </button>
            </div>

            <div className="space-y-6">
              {/* 時間範圍篩選 - 改為水平排列 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>時間範圍</span>
                  </span>
                </label>

                <div className="relative" ref={datePickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {filters.dateRange.start && filters.dateRange.end
                          ? `${filters.dateRange.start} 至 ${filters.dateRange.end}`
                          : '選擇日期範圍'}
                      </span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} 
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {showDatePicker && (
                    <div className="absolute z-50 w-[500px] mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-500">開始日期</label>
                      <input
                        type="date"
                        value={filters.dateRange.start}
                        onClick={() => setShowDatePicker(true)}
                        onChange={(e) => handleFilterChange({
                          ...filters,
                          dateRange: { ...filters.dateRange, start: e.target.value }
                        })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-500">結束日期</label>
                      <input
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => handleFilterChange({
                          ...filters,
                          dateRange: { ...filters.dateRange, end: e.target.value }
                        })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                        <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleQuickDateSelect('thisMonth')}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        本月
                      </button>
                      <button
                        onClick={() => handleQuickDateSelect('lastMonth')}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        上個月
                      </button>
                      <button
                        onClick={() => handleQuickDateSelect('last7days')}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        最近 7 天
                      </button>
                      <button
                        onClick={() => handleQuickDateSelect('last14days')}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        最近 14 天
                      </button>
                      <button
                        onClick={() => handleQuickDateSelect('last30days')}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        最近 30 天
                      </button>
                      <button
                        onClick={() => handleQuickDateSelect('last3Months')}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        最近 3 個月
                      </button>
                    </div>
                  </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 其他篩選條件 - 改為按鈕組樣式 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 裝置篩選 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span>裝置</span>
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['iOS', 'Android'].map(device => (
                      <button
                        key={device}
                        onClick={() => {
                          const newDevices = filters.devices.includes(device)
                            ? filters.devices.filter(d => d !== device)
                            : [...filters.devices, device];
                          handleFilterChange({
                            ...filters,
                            devices: newDevices
                          });
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          filters.devices.includes(device)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {device}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 星等篩選 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span>星等</span>
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <button
                        key={rating}
                        onClick={() => {
                          const newRatings = filters.ratings.includes(rating)
                            ? filters.ratings.filter(r => r !== rating)
                            : [...filters.ratings, rating];
                          handleFilterChange({
                            ...filters,
                            ratings: newRatings
                          });
                        }}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          filters.ratings.includes(rating)
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {rating} 星
                      </button>
                    ))}
                  </div>
                </div>

                {/* 情感篩選 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>情感</span>
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: '正面', bgColor: 'bg-green-600', hoverColor: 'hover:bg-green-700', lightBg: 'bg-green-100' },
                      { value: '中性', bgColor: 'bg-gray-600', hoverColor: 'hover:bg-gray-700', lightBg: 'bg-gray-100' },
                      { value: '負面', bgColor: 'bg-red-600', hoverColor: 'hover:bg-red-700', lightBg: 'bg-red-100' }
                    ].map(({ value, bgColor, hoverColor, lightBg }) => (
                      <button
                        key={value}
                        onClick={() => {
                          const newSentiments = filters.sentiments.includes(value)
                            ? filters.sentiments.filter(s => s !== value)
                            : [...filters.sentiments, value];
                          handleFilterChange({
                            ...filters,
                            sentiments: newSentiments
                          });
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          filters.sentiments.includes(value)
                            ? `${bgColor} text-white ${hoverColor}`
                            : `${lightBg} text-gray-700 hover:bg-gray-200`
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 分類篩選 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span>分類</span>
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map(category => (
                      <button
                        key={category}
                        onClick={() => {
                          const newCategories = filters.categories.includes(category)
                            ? filters.categories.filter(c => c !== category)
                            : [...filters.categories, category];
                          handleFilterChange({
                            ...filters,
                            categories: newCategories
                          });
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          filters.categories.includes(category)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 已選擇的篩選條件標籤 */}
            <div className="mt-6 flex flex-wrap gap-2">
              {filters.devices.map(device => (
                <span key={device} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  <span>裝置: {device}</span>
                  <button
                    onClick={() => handleFilterChange({
                      ...filters,
                      devices: filters.devices.filter(d => d !== device)
                    })}
                    className="ml-2 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              {filters.ratings.map(rating => (
                <span key={rating} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                  <span>{rating} 星</span>
                  <button
                    onClick={() => handleFilterChange({
                      ...filters,
                      ratings: filters.ratings.filter(r => r !== rating)
                    })}
                    className="ml-2 hover:text-yellow-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              {filters.sentiments.map(sentiment => (
                <span key={sentiment} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  <span>情感: {sentiment}</span>
                  <button
                    onClick={() => handleFilterChange({
                      ...filters,
                      sentiments: filters.sentiments.filter(s => s !== sentiment)
                    })}
                    className="ml-2 hover:text-green-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              {filters.categories.map(category => (
                <span key={category} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  <span>分類: {category}</span>
                  <button
                    onClick={() => handleFilterChange({
                      ...filters,
                      categories: filters.categories.filter(c => c !== category)
                    })}
                    className="ml-2 hover:text-purple-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </section>

          {/* 分析摘要和圖表區塊 */}
          <section id="analysis-report" className="grid grid-cols-1 gap-6">
            {/* 分析摘要 */}
            <div id="analysis-summary" className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">分析摘要</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">篩選後評論數</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analysisResult.summary.totalCount.toLocaleString()}
                  </p>
                  {analysisResult.summary.totalCount !== analysisResult.feedbacks.length && (
                    <p className="text-xs text-gray-500 mt-1">
                      共 {analysisResult.feedbacks.length.toLocaleString()} 筆
                    </p>
                  )}
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">正面評價比例</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {(analysisResult.summary.positiveRatio * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">中性評價比例</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {(analysisResult.summary.neutralRatio * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">負評價比例</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {(analysisResult.summary.negativeRatio * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">平均用戶評分</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analysisResult.summary.averageRating.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* 評論趨勢分析 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">評論趨勢分析</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[300px] sm:h-[400px]">
                  {analysisResult && <MonthlyTrendChart data={analysisResult.feedbacks} />}
                </div>
                <div className="h-[300px] sm:h-[400px]">
                  {analysisResult && <RatingDistributionChart data={analysisResult.feedbacks} />}
                </div>
              </div>
            </div>

            {/* 情感分析和分類統計 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">情感分析</h2>
                <div className="h-[300px] sm:h-[400px]">
                  {analysisResult && <SentimentPieChart data={analysisResult.feedbacks} />}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">分類統計</h2>
                <div className="h-[300px] sm:h-[400px]">
                  {analysisResult && <CategoryBarChart data={analysisResult.feedbacks} />}
                </div>
              </div>
            </div>

            {/* 關鍵詞統計和評分分布 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">關鍵詞統計 (前20名)</h2>
                <div className="h-[300px] sm:h-[400px]">
                  {analysisResult && <KeywordsBarChart keywords={analysisResult.keywords} />}
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">評分分布詳情</h2>
                <div className="h-[300px] sm:h-[400px]">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">評分</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">評論數</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">佔比</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Array.from({ length: 5 }, (_, i) => {
                        const rating = 5 - i;
                        const count = analysisResult.feedbacks.filter((f: AnalysisResult['feedbacks'][0]) => 
                          Math.floor(f.rating) === rating
                        ).length;
                        const percentage = (count / analysisResult.feedbacks.length * 100).toFixed(1);
                        
                        return (
                          <tr key={rating} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <span className="mr-2">{rating}</span>
                                <svg 
                                  className="w-5 h-5 text-yellow-400" 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              {count.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              {percentage}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="border-t border-gray-200">
                      <tr>
                        <td className="px-4 py-3 font-medium">總計</td>
                        <td className="px-4 py-3 font-medium">
                          {analysisResult.feedbacks.length.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-medium">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* 文字雲和 AI 分析區塊 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">文字雲分布</h2>
              
              {/* 調整文字雲容器高度和間距 */}
              <div className="mb-8">  {/* 添加底部間距 */}
                <div className="h-[300px] sm:h-[400px] w-full">
                  {analysisResult && <WordCloud keywords={analysisResult.keywords} />}
                </div>
              </div>

              {/* 將按鈕和分析結果移到文字雲下方 */}
              <div className="space-y-6">  {/* 使用 space-y-6 控制元素間距 */}
                <div className="flex justify-center">
                  <button
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center space-x-2 transition-colors disabled:opacity-50"
                    onClick={generateInsights}
                    disabled={isGeneratingInsights}
                  >
                    {isGeneratingInsights ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>生成分析中...</span>
                      </>
                    ) : (
                      <>
                        <svg 
                          className="w-5 h-5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                        <span>生成洞察分析</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* AI 分析結果 */}
                {aiAnalysis && (
                  <div className="w-full bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">AI 洞察分析結果</h3>
                    <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
                      {aiAnalysis}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
