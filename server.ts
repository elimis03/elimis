import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for CORS and JSON
  app.use(express.json());

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
