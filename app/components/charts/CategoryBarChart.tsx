'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AnalysisResult } from '@/types/feedback';

interface CategoryBarChartProps {
  data: AnalysisResult['feedbacks'];
}

export const CategoryBarChart = ({ data }: CategoryBarChartProps) => {
  // 統計各分類的出現次數
  const categoryCount = data.reduce((acc, feedback) => {
    const categories = feedback.category.split(/[,，]/).map(c => c.trim());
    categories.forEach(category => {
      acc[category] = (acc[category] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // 轉換為圖表數據格式並排序
  const chartData = Object.entries(categoryCount)
    .map(([category, count]) => ({
      category,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // 只顯示前10個分類

  // 修改類別圖表配置
  const options = {
    // ...其他配置保持不變
    theme: {
      mode: 'light',
    },
    background: '#ffffff',
    plotOptions: {
      bar: {
        background: '#ffffff',
      }
    },
    xaxis: {
      labels: {
        style: {
          colors: '#1f2937'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#1f2937'
        }
      }
    }
    // ...
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis 
          dataKey="category" 
          type="category" 
          width={80}
          style={{
            fontSize: '0.75rem'
          }}
        />
        <Tooltip />
        <Bar 
          dataKey="count" 
          fill="#9333EA"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}; 