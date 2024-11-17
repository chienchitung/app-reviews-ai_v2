import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: Request): Promise<Response> {
  try {
    const { searchTerm } = await request.json();

    if (!searchTerm) {
      return NextResponse.json(
        { error: '請提供搜尋關鍵字' },
        { status: 400 }
      );
    }

    // 執行 Python 腳本
    const scriptPath = path.join(process.cwd(), 'scripts', 'app_search.py');
    
    const pythonProcess = spawn('python', [scriptPath, searchTerm]);

    return new Promise<Response>((resolve) => {
      let dataString = '';

      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        try {
          const results = JSON.parse(dataString);
          resolve(NextResponse.json({ data: results }));
        } catch (error) {
          resolve(NextResponse.json(
            { error: '解析搜尋結果時發生錯誤' },
            { status: 500 }
          ));
        }
      });
    });
  } catch (error) {
    return NextResponse.json(
      { error: '搜尋處理失敗' },
      { status: 500 }
    );
  }
} 