'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { AnalysisResult } from '@/types/feedback';

interface SentimentPieChartProps {
  data: AnalysisResult['feedbacks'];
}

export function SentimentPieChart({ data }: SentimentPieChartProps) {
  // 計算情感分布
  const sentiments = data.reduce((acc, curr) => {
    const sentiment = curr.sentiment;
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(sentiments).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = {
    '正面': '#4ade80',
    '中性': '#93c5fd',
    '負面': '#f87171'
  };

  // 修改圖表主題配置
  const config = {
    // ...other configurations remain unchanged
    theme: {
      mode: 'light',
    },
    background: '#ffffff',
    // 確保文字顏色使用深色
    legend: {
      labels: {
        colors: '#1f2937' // 使用 gray-800 的顏色
      }
    },
    // ...
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          innerRadius={60}
          fill="#8884d8"
          dataKey="value"
          paddingAngle={2}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.name as keyof typeof COLORS]} 
            />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
          itemStyle={{ color: '#1f2937' }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          wrapperStyle={{ color: '#1f2937' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
} 