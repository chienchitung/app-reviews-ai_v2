'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [expiry, setExpiry] = useState(''); // 新增這行來管理有效期限的狀態

  // 在這裡加入處理有效期限的函數
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    // 如果是在刪除
    if (input.length < expiry.length) {
      // 如果刪除到只剩 "/" 就直接清空
      if (input === '/') {
        input = '';
      }
      // 如果刪到最後一個數字，同時移除斜線
      else if (input.length === 2 && expiry.length === 3) {
        input = input.slice(0, -1);
      }
    } 
    // 如果是在輸入
    else {
      // 自動加入斜線
      if (input.length === 2 && !input.includes('/')) {
        input = input + '/';
      }
      // 只允許數字
      input = input.replace(/[^\d/]/g, '');
    }
    
    setExpiry(input);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 這裡處理付款邏輯
      await new Promise(resolve => setTimeout(resolve, 1500)); // 模擬 API 請求
      router.push('/payment/success');
    } catch (error) {
      console.error('付款錯誤:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">付款資訊</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                持卡人姓名
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                信用卡號碼
              </label>
              <input
                type="text"
                required
                pattern="\d{16}"
                maxLength={16}
                placeholder="1234 5678 9012 3456"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
              <label className="block text-sm font-medium text-gray-700">
                  有效期限
                </label>
                <input
                  type="text"
                  required
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CVC/CVV
                </label>
                <input
                  type="text"
                  required
                  pattern="\d{3}"
                  maxLength={3}
                  placeholder="信用卡末三碼"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-150 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? '處理中...' : '確認付款 NT$ 499'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 