'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, Clock } from 'lucide-react';

export default function EnterpriseSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          表單提交成功！
        </h1>
        
        <div className="text-gray-600 mb-8 space-y-4">
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Clock className="h-5 w-5" />
            <span>預計 1-3 個工作天內與您聯繫</span>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg text-left">
            <h3 className="font-semibold mb-2">後續流程：</h3>
            <ul className="space-y-2 text-sm">
              <li>1. 我們的企業顧問將仔細評估您的需求</li>
              <li>2. 安排線上或實體會議討論詳細合作方案</li>
              <li>3. 提供客製化報價與解決方案</li>
            </ul>
          </div>
          
          <p className="text-sm">
            如有緊急需求，歡迎直接聯繫：
            <br />
            <a href="tel:+886223456789" className="text-blue-600">
              +886 2 2345 6789
            </a>
          </p>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition duration-150"
        >
          返回首頁
        </button>
      </div>
    </div>
  );
} 