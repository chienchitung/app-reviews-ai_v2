'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          付款成功！
        </h1>
        
        <div className="text-gray-600 mb-8 space-y-2">
          <p>感謝您訂閱我們的專業版服務</p>
          <p>您現在可以使用所有進階功能</p>
          <p className="text-sm">
            訂閱確認信已發送至您的信箱
          </p>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition duration-150"
        >
          返回首頁開始使用
        </button>
      </div>
    </div>
  );
} 