'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">服務條款</h1>
        
        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 服務範圍</h2>
            <p className="text-gray-600 mb-4">
              AppReviews AI 提供以下服務：
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>App 評論分析與洞察</li>
              <li>自動化評論回覆建議</li>
              <li>評論情緒分析</li>
              <li>競品分析報告</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 使用規範</h2>
            <p className="text-gray-600 mb-4">
              用戶在使用本服務時需遵守：
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>不得進行任何非法或未經授權的行為</li>
              <li>不得干擾或破壞服務的正常運作</li>
              <li>不得侵犯他人的智慧財產權</li>
              <li>不得濫用系統資源或進行惡意操作</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 付費方案</h2>
            <p className="text-gray-600 mb-4">
              關於付費服務的規定：
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>費用依據選擇的方案收取</li>
              <li>可選擇月付或年付方案</li>
              <li>升級或降級方案將按比例計費</li>
              <li>取消訂閱後將服務至週期結束</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 智慧財產權</h2>
            <p className="text-gray-600 mb-4">
              關於平台內容的權利歸屬：
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>平台介面和功能的著作權歸屬本公司</li>
              <li>用戶上傳的內容權利歸屬用戶</li>
              <li>分析報告的使用權歸屬付費用戶</li>
              <li>禁止未經授權轉載或散布平台內容</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. 免責聲明</h2>
            <p className="text-gray-600 mb-4">
              本服務不承擔以下責任：
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>因不可抗力導致的服務中斷</li>
              <li>用戶因使用建議造成的損失</li>
              <li>第三方服務的可用性問題</li>
              <li>用戶間的糾紛或損失</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. 條款修改</h2>
            <p className="text-gray-600 mb-4">
              關於服務條款的更新：
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>本公司保留修改條款的權利</li>
              <li>重大更新將通過郵件通知</li>
              <li>繼續使用服務視為同意新條款</li>
              <li>不同意新條款可終止使用服務</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
} 