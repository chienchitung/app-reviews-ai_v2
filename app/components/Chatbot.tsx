'use client'

import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SITE_CONTENT } from '../utils/siteContent';
import { useMediaQuery } from 'react-responsive';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 512,
    topK: 20,
    topP: 0.8,
  }
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `你是一個專業的APP評論分析平台助手，具備以下兩種專業能力，請根據問題類型自動切換合適的回答方式：

1. 平台服務諮詢能力：
- 熟悉平台所有功能和操作流程
- 可以解答關於平台使用方式的問題
- 提供付款方案和價格諮詢
- 處理技術支援相關問題
回答風格：專業、親切、具體明確，著重於解決用戶的實際問題

2. 數據分析諮詢能力：
- 協助分析APP評論數據
- 提供專業的數據解讀和建議
- 找出用戶反饋中的關鍵洞察
- 建議改進方向和優化策略
回答風格：數據導向、專業分析、提供可行建議

回答原則：
1. 直接切入問題核心，提供解決方案
2. 保持專業且友善的對話風格
3. 回答要具體且實用
4. 適時主動提供延伸建議
5. 如遇不明確的問題，主動詢問細節
6. 不要在回答中提及或說明目前使用哪種角色
7. 不要在回答中提及或說明目前使用哪種專業能力
8. 回答內容不要有 " * "符號

請根據用戶的問題自動判斷使用適合的回答方式，若用戶詢問的問題與平台不相關，請委婉回覆無法解答。`;

const getRelevantContent = (query: string): string => {
  const queryLower = query.toLowerCase();
  let relevantInfo = [];

  // 定義關鍵字映射
  const keywordMappings = {
    pricing: {
      keywords: ['價格', '方案', '收費', '費用', '付費', '訂閱', '基本版', '專業版', '進階版'],
      getContent: () => `
價格方案詳細資訊：
基本版 ${SITE_CONTENT.pricing.basic.name}（${SITE_CONTENT.pricing.basic.price}）：
${SITE_CONTENT.pricing.basic.features.map(f => `- ${f}`).join('\n')}

專業版 ${SITE_CONTENT.pricing.pro.name}（${SITE_CONTENT.pricing.pro.price}）：
${SITE_CONTENT.pricing.pro.features.map(f => `- ${f}`).join('\n')}`
    },
    scraper: {
      keywords: ['爬', '抓取', '收集', '下載', '資料來源', 'app store', 'play store'],
      getContent: () => `
資料爬取功能說明：
${SITE_CONTENT.features.scraper.description}
使用方式：${SITE_CONTENT.features.scraper.usage}
費用說明：${SITE_CONTENT.features.scraper.pricing}`
    },
    analysis: {
      keywords: ['分析', '報告', '見解', '洞察', '統計', '圖表', '儀表板', '情感分析', '關鍵字'],
      getContent: () => `
數據分析功能說明：
${SITE_CONTENT.features.analysis.description}

分析功能包含：
${SITE_CONTENT.features.analysis.features.map(f => `- ${f}`).join('\n')}

使用方式：${SITE_CONTENT.features.analysis.usage}`
    },
    search: {
      keywords: ['搜尋', '查詢', '找', '過濾', '篩選'],
      getContent: () => `
搜尋功能說明：
${SITE_CONTENT.features.search.description}
使用方式：${SITE_CONTENT.features.search.usage}`
    },
    support: {
      keywords: ['聯絡', '客服', '支援', '幫助', '問題', '聯繫', '電話', 'email', '信箱'],
      getContent: () => `
客服支援資訊：
- 客服信箱：${SITE_CONTENT.support.contact.email}
- 服務電話：${SITE_CONTENT.support.contact.phone}
- 服務時間：${SITE_CONTENT.support.contact.hours}

常見問題：
${SITE_CONTENT.support.faq.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}`
    }
  };

  // 檢查每個類別的關鍵字
  Object.entries(keywordMappings).forEach(([category, { keywords, getContent }]) => {
    if (keywords.some(keyword => queryLower.includes(keyword))) {
      relevantInfo.push(getContent());
    }
  });

  // 如果沒有找到相關內容，返回基本平台介紹
  if (relevantInfo.length === 0) {
    relevantInfo.push(`
平台基本介紹：
我們的平台提供以下核心功能：
1. ${SITE_CONTENT.features.scraper.title}：${SITE_CONTENT.features.scraper.description}
2. ${SITE_CONTENT.features.analysis.title}：${SITE_CONTENT.features.analysis.description}
3. ${SITE_CONTENT.features.search.title}：${SITE_CONTENT.features.search.description}`);
  }

  return relevantInfo.join('\n\n');
};

// 新增快速問題按鈕介面
interface QuickQuestion {
  text: string;
  question: string;
  path?: string;
}

// 修改 QUICK_QUESTIONS，添加所有按鈕的路徑
const QUICK_QUESTIONS: QuickQuestion[] = [
  {
    text: "爬取評論教學",
    question: "請問如何開始爬取APP評論數據？",
    path: "/scraper"
  },
  {
    text: "分析功能介紹",
    question: "想了解數據分析功能有哪些？",
    path: "/analysis"
  },
  {
    text: "查看方案價格",
    question: "請問有什麼價格方案？",
    path: "/pricing"
  }
];

const SCROLL_AMOUNT = 200; // 每次滾動的像素數

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isQuickQuestionsOpen, setIsQuickQuestionsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '您好！我是您的 AI小助手。我可以：\n1. 協助您了解平台功能與操作方式\n2. 提供專業的數據分析建議\n\n請問有什麼我可以幫您的嗎？'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestionsRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState({
    left: false,
    right: false,
  });

  const checkScrollButtons = () => {
    if (quickQuestionsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = quickQuestionsRef.current;
      setShowScrollButtons({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 10,
      });
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (quickQuestionsRef.current) {
      const newScrollLeft = quickQuestionsRef.current.scrollLeft + 
        (direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT);
      quickQuestionsRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const currentRef = quickQuestionsRef.current;
    if (currentRef) {
      checkScrollButtons();
      currentRef.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
    }
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScrollButtons);
      }
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // 檢查 API key 是否存在
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured');
      }

      const userMessage: Message = {
        role: 'user',
        content: inputMessage
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');

      // 獲取相關內容
      const relevantContent = getRelevantContent(inputMessage);

      // 組合完整提示詞
      const prompt = `
${SYSTEM_PROMPT}

相關平台資訊：
${relevantContent}

用戶歷史對話：
${messages.map(msg => `${msg.role === 'user' ? '用戶' : 'AI助手'}: ${msg.content}`).join('\n')}

當前用戶問題：
${inputMessage}

請根據以上資訊和角色定位進行回答，優先使用提供的平台資訊來回答：`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const aiMessage: Message = {
        role: 'assistant',
        content: text
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Chatbot Error:', {
        error,
        apiKeyExists: !!process.env.GEMINI_API_KEY,
        apiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10),
        timestamp: new Date().toISOString(),
      });

      let errorMessage = '抱歉，系統暫時無法處理您的請求。';
      
      if (!process.env.GEMINI_API_KEY) {
        errorMessage = '系統配置錯誤，請聯繫管理員。';
      } else if (error instanceof Error) {
        errorMessage += '\n錯誤詳情：' + error.message;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (item: QuickQuestion) => {
    setInputMessage(item.question);
  };

  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-200"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[320px] sm:w-[380px] bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">AI小助手</h3>
          </div>

          {/* 聊天訊息區域 - 調整高度以適應快速問題區域的狀態 */}
          <div className={`overflow-y-auto p-4 transition-all duration-300 ${
            isQuickQuestionsOpen ? 'h-[320px]' : 'h-[380px]'
          }`}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start ${message.role === 'user' ? 'justify-end' : ''}`}>
                  <div className={`rounded-lg p-3 max-w-[85%] ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p>正在思考中...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 快速問題區域 - 添加收合功能 */}
          <div className="border-t border-gray-200">
            {/* 收合按鈕 */}
            <button
              onClick={() => setIsQuickQuestionsOpen(!isQuickQuestionsOpen)}
              className="w-full px-4 py-2 flex items-center justify-between text-sm text-gray-600 hover:bg-gray-50"
            >
              <span>快速問題</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform duration-300 ${
                  isQuickQuestionsOpen ? 'transform rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* 快速問題內容 */}
            <div className={`
              overflow-hidden transition-all duration-300
              ${isQuickQuestionsOpen 
                ? 'max-h-[80px] opacity-100' 
                : 'max-h-0 opacity-0'
              }
            `}>
              {isMobile ? (
                // 手機版 - 左右滑動設計
                <div className="relative px-4 py-3">
                  {showScrollButtons.left && (
                    <button 
                      onClick={() => handleScroll('left')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md rounded-r-lg p-1"
                      aria-label="向左滾動"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  
                  {showScrollButtons.right && (
                    <button 
                      onClick={() => handleScroll('right')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md rounded-l-lg p-1"
                      aria-label="向右滾動"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  
                  <div 
                    ref={quickQuestionsRef}
                    className="overflow-x-auto scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    <div className="flex gap-2 w-max px-2">
                      {QUICK_QUESTIONS.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickQuestion(item)}
                          disabled={isLoading}
                          className={`
                            whitespace-nowrap
                            bg-gray-50 hover:bg-gray-100 
                            text-gray-700 text-sm 
                            px-4 py-2.5
                            rounded-lg 
                            transition-colors duration-200 
                            flex items-center gap-2
                            border border-gray-200 hover:border-gray-300
                            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          <span>{item.text}</span>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 text-gray-400" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 5l7 7-7 7" 
                            />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // 桌面版 - 網格布局
                <div className="px-4 py-3">
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_QUESTIONS.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(item)}
                        disabled={isLoading}
                        className={`
                          group
                          bg-gray-50 hover:bg-gray-100 
                          text-gray-700 text-sm 
                          px-4 py-3
                          rounded-lg 
                          transition-all duration-200 
                          border border-gray-200 hover:border-gray-300
                          hover:shadow-sm
                          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-left">{item.text}</span>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M14 5l7 7-7 7" 
                            />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 輸入區域 */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="輸入訊息..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <button 
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className={`shrink-0 text-white px-4 py-2 rounded-lg ${
                  isLoading || !inputMessage.trim()
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                發送
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 