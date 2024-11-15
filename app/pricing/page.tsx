import { PricingCard, type Plan } from '../components/PricingCard';
import { Check } from 'lucide-react';

const plans: Plan[] = [
  {
    name: '基本版',
    price: '免費',
    description: '適合個人使用者',
    features: [
      '每月分析 100 則評論',
      '基礎情感分析',
      '關鍵字分析',
      '基礎數據導出'
    ],
    popular: false,
    type: 'free' as const  // 使用 const assertion 確保類型正確
  },
  {
    name: '專業版',
    price: 'NT$ 499',
    description: '適合小型企業',
    features: [
      '每月分析 1,000 則評論',
      '進階情感分析',
      '完整關鍵字分析',
      '評論趨勢分析',
      '優先技術支援',
      'API 存取權限'
    ],
    popular: true,
    type: 'pro' as const
  },
  {
    name: '企業版',
    price: '聯繫銷售',
    description: '適合大型企業',
    features: [
      '無限評論分析',
      '客製化分析模型',
      '專屬客戶經理',
      '24/7 技術支援',
      '完整 API 整合',
      '優先功能更新'
    ],
    type: 'enterprise' as const
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            選擇適合您的方案
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            無論您是個人用戶還是企業用戶，我們都有適合您的解決方案
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </div>
  );
} 