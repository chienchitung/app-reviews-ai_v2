'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Phone, Users } from 'lucide-react';

export default function EnterprisePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 這裡處理表單提交邏輯
      await new Promise(resolve => setTimeout(resolve, 1500)); // 模擬 API 請求
      router.push('/enterprise/success');
    } catch (error) {
      console.error('提交錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            企業方案諮詢
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            讓我們為您的企業打造最適合的解決方案
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  公司名稱
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  聯絡人姓名
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  電子郵件
                </label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  聯絡電話
                </label>
                <input
                  type="tel"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  需求說明
                </label>
                <textarea
                  required
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-150 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? '提交中...' : '提交諮詢'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              企業方案特色
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Users className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-semibold">專屬客戶經理</h4>
                  <p className="text-gray-600">一對一專屬服務，快速回應您的需求</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Building2 className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-semibold">客製化解決方案</h4>
                  <p className="text-gray-600">根據您的業務需求打造專屬分析模型</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-semibold">24/7 技術支援</h4>
                  <p className="text-gray-600">全天候技術團隊支援，確保服務穩定運行</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-semibold">聯絡方式</h4>
                  <p className="text-gray-600">enterprise@appreviews.ai</p>
                  <p className="text-gray-600">+886 2 1234 5678</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 