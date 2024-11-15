'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Keyword } from '@/types/feedback';

interface KeywordsBarChartProps {
  keywords: Keyword[];
}

export const KeywordsBarChart = ({ keywords }: KeywordsBarChartProps) => {
  const sortedData = [...keywords]
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const options = {
    theme: {
      mode: 'light',
    },
    background: '#ffffff',
    chart: {
      background: '#ffffff',
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
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
      >
        <XAxis type="number" stroke="#1f2937" />
        <YAxis 
          dataKey="word" 
          type="category" 
          width={80}
          style={{
            fontSize: '0.75rem',
            fill: '#1f2937'
          }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb' 
          }}
        />
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <Bar dataKey="count" fill="#60a5fa" />
      </BarChart>
    </ResponsiveContainer>
  );
}; 