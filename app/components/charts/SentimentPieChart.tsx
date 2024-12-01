'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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

  // 計算總數用於百分比計算
  const total = Object.values(sentiments).reduce((sum, count) => sum + count, 0);

  const chartData = Object.entries(sentiments).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / total) * 100).toFixed(1)
  }));

  const COLORS = {
    '正面': '#4ade80',
    '中性': '#93c5fd',
    '負面': '#f87171'
  };

  // 自定義提示框內容
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-4 py-2 shadow-lg rounded-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-900">
            {data.name}：{data.value} 則 ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={undefined}
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
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          wrapperStyle={{ color: '#1f2937' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
} 