import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // تفعيل CORS للسماح بمصدر Vercel
  app.use(cors({
    origin: 'https://pharmacy-medical-assistant.vercel.app', // الدومين الجديد
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }));

  app.use(express.json({ limit: '10mb' }));

  // API Proxy for OpenFDA
  app.get('/api/openfda', async (req, res) => {
    const { search, limit = 1 } = req.query;
    const apiKey = process.env.OPENFDA_API_KEY;

    if (!search) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    try {
      let url = new URL('https://api.fda.gov/drug/label.json');
      url.searchParams.append('search', search as string);
      url.searchParams.append('limit', limit as string);
      if (apiKey) {
        url.searchParams.append('api_key', apiKey);
      }

      console.log(`Searching OpenFDA: ${url.toString().replace(apiKey || '', '***')}`);
      
      let response = await fetch(url.toString());
      let data = await response.json();

      if ((!data.results || data.results.length === 0) && (search as string).includes('brand_name:')) {
        const queryTerm = (search as string).match(/brand_name:"([^"]+)"/)?.[1] || search;
        console.log(`No results for exact brand name, trying broad search for: ${queryTerm}`);
        
        url = new URL('https://api.fda.gov/drug/label.json');
        url.searchParams.append('search', `"${queryTerm}"`);
        url.searchParams.append('limit', limit as string);
        if (apiKey) {
          url.searchParams.append('api_key', apiKey);
        }
        
        response = await fetch(url.toString());
        data = await response.json();
      }

      res.status(response.status).json(data);
    } catch (error) {
      console.error('OpenFDA Proxy Error:', error);
      res.status(500).json({ error: 'Failed to fetch from OpenFDA' });
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();