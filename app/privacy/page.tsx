'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 返回按鈕 */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="py-4">
            <Link 
              href="/signup" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              返回註冊
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">隱私政策</h1>
        
        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 資料收集</h2>
            <p className="text-gray-600 mb-4">
              我們收集的個人資料包括但不限於：
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>基本資料（姓名、電子郵件）</li>
              <li>使用數據（登入時間、功能使用記錄）</li>
              <li>裝置資訊（IP 位址、瀏覽器類型）</li>
              <li>付款資訊（信用卡後四碼、交易記錄）</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 資料使用</h2>
            <p className="text-gray-600 mb-4">
              我們使用收集的資料用於：
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>提供和改進服務</li>
              <li>個人化用戶體驗</li>
              <li>發送服務通知和更新</li>
              <li>防止濫用和詐騙</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 資料保護</h2>
            <p className="text-gray-600 mb-4">
              我們採取以下措施保護您的資料：
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>使用加密技術傳輸和儲存資料</li>
              <li>定期進行安全審查</li>
              <li>限制員工訪問權限</li>
              <li>遵守資料保護法規</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Cookie 使用</h2>
            <p className="text-gray-600 mb-4">
              我們使用 Cookie 和類似技術來：
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>記住您的登入狀態</li>
              <li>分析使用模式</li>
              <li>提供個人化體驗</li>
              <li>改善服務效能</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. 第三方服務</h2>
            <p className="text-gray-600 mb-4">
              我們可能使用第三方服務來：
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>處理付款</li>
              <li>分析使用數據</li>
              <li>提供客戶支援</li>
              <li>發送電子郵件通知</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. 用戶權利</h2>
            <p className="text-gray-600 mb-4">
              您擁有以下權利：
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>查看和更正個人資料</li>
              <li>要求刪除帳戶</li>
              <li>選擇退出電子郵件通知</li>
              <li>提出隱私相關問題</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
} 