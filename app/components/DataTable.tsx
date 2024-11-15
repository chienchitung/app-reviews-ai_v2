import { useState } from 'react';
import type { Review } from '@/types/feedback';

interface DataTableProps {
  data: Review[];
}

export default function DataTable({ data }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const getCurrentPageData = () => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-[10%] px-4 py-2 text-sm text-gray-500 border">日期</th>
              <th className="w-[10%] px-4 py-2 text-sm text-gray-500 border">用戶名</th>
              <th className="w-[35%] px-4 py-2 text-sm text-gray-500 border">評論內容</th>
              <th className="w-[5%] px-4 py-2 text-sm text-gray-500 border">評分</th>
              <th className="w-[8%] px-4 py-2 text-sm text-gray-500 border">平台</th>
              <th className="w-[25%] px-4 py-2 text-sm text-gray-500 border">開發者回覆</th>
              <th className="w-[7%] px-4 py-2 text-sm text-gray-500 border">語言</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageData().map((review, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="w-[10%] px-4 py-2 text-xs text-gray-700 border truncate">
                  {review.date}
                </td>
                <td className="w-[10%] px-4 py-2 text-xs text-gray-700 border truncate">
                  {review.username}
                </td>
                <td className="w-[35%] px-4 py-2 text-xs text-gray-700 border">
                  <div className="max-h-32 overflow-y-auto">
                    {review.review}
                  </div>
                </td>
                <td className="w-[5%] px-4 py-2 text-xs text-gray-700 text-center border">
                  {review.rating}
                </td>
                <td className="w-[8%] px-4 py-2 text-xs text-gray-700 border truncate">
                  {review.platform}
                </td>
                <td className="w-[25%] px-4 py-2 text-xs text-gray-700 border">
                  <div className="max-h-32 overflow-y-auto">
                    {review.developerResponse}
                  </div>
                </td>
                <td className="w-[7%] px-4 py-2 text-xs text-gray-700 border truncate">
                  {review.language}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm bg-gray-100 rounded-md disabled:opacity-50"
        >
          上一頁
        </button>
        <span className="text-sm text-gray-600">
          第 {currentPage} 頁，共 {totalPages} 頁
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm bg-gray-100 rounded-md disabled:opacity-50"
        >
          下一頁
        </button>
      </div>
    </div>
  );
} 