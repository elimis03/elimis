import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for CORS and JSON
  app.use(express.json());

  // AI Review / Comment Generation Route
  app.post('/api/generate-comment', async (req, res) => {
    try {
      const { movieNm, keywords } = req.body;
      if (!movieNm || !keywords || !Array.isArray(keywords) || keywords.length !== 3) {
        res.status(400).json({ error: '영화 제목과 정확히 3개의 키워드가 필요합니다.' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: '서버에 GEMINI_API_KEY가 설정되지 않았습니다. AI Studio Secrets 패널에서 등록해주세요.' });
        return;
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
      const prompt = `영화 "${movieNm}"을 관람한 뒤에 남겨진 흥미롭고 감성적인 감상평을 작성해주세요.
반드시 제공된 3개의 핵심 키워드 [${keywords.join(', ')}]가 문장 내에 매우 자연스럽고 유기적으로 포함되어야 합니다.
감상평은 3~5줄 분량의 품격 있고 몰입감 있는 한국어 톤앤매너로 작성하여 신선한 인상을 주도록 디자인해주세요.`;

      const apiResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'aistudio-build'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`Gemini API Error: ${apiResponse.status} - ${errorText}`);
      }

      const responseData = await apiResponse.json();
      const candidateText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText) {
        throw new Error('Gemini API 응답에서 감상평 텍스트를 파싱할 수 없습니다.');
      }

      res.json({ comment: candidateText });
    } catch (error: any) {
      console.error('Error in /api/generate-comment:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  // Kobis API Proxy Routes
  app.get('/api/boxoffice', async (req, res) => {
    try {
      const { date } = req.query;
      if (!date || typeof date !== 'string') {
        res.status(400).json({ error: 'date query parameter (YYYYMMDD) is required' });
        return;
      }
      
      const apiKey = process.env.KOBIS_API_KEY || '2375f106fa512b6b733e0c377819d9f9';
      const kobisUrl = `http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${apiKey}&targetDt=${date}`;
      
      console.log(`Fetching Daily Box Office for targetDt=${date}...`);
      const response = await fetch(kobisUrl);
      if (!response.ok) {
        throw new Error(`Kobis API error: ${response.statusText}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Error in /api/boxoffice:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  app.get('/api/movie-detail', async (req, res) => {
    try {
      const { movieCd } = req.query;
      if (!movieCd || typeof movieCd !== 'string') {
        res.status(400).json({ error: 'movieCd query parameter is required' });
        return;
      }

      const apiKey = process.env.KOBIS_API_KEY || '2375f106fa512b6b733e0c377819d9f9';
      const kobisUrl = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${apiKey}&movieCd=${movieCd}`;

      console.log(`Fetching Movie Detail for movieCd=${movieCd}...`);
      const response = await fetch(kobisUrl);
      if (!response.ok) {
        throw new Error(`Kobis API error: ${response.statusText}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Error in /api/movie-detail:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support Express v4 / v5 wildcard catch
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
});
