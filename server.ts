import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');
const dbFile = path.join(__dirname, 'app.json');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Simple JSON database
let db: any[] = [];
if (fs.existsSync(dbFile)) {
  try {
    db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
  } catch (e) {
    db = [];
  }
}

function saveDb() {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '100mb' }));
  app.use('/uploads', express.static(uploadsDir));

  function saveBase64ToDisk(base64Data: string, extension: string): string {
    const filename = `${crypto.randomBytes(16).toString('hex')}.${extension}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
    return `/uploads/${filename}`;
  }

  app.post('/api/upload', (req, res) => {
    try {
      const { data, extension } = req.body;
      if (!data || !extension) {
        return res.status(400).json({ error: 'Missing data or extension' });
      }
      const url = saveBase64ToDisk(data, extension);
      res.json({ url });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // --- Assets API ---

  app.get('/api/assets', (req, res) => {
    const assets = [...db].sort((a, b) => b.createdAt - a.createdAt);
    res.json(assets);
  });

  app.post('/api/assets', (req, res) => {
    const { id, type, title, url, prompt, createdAt, metadata } = req.body;
    db.push({ id, type, title, url, prompt, createdAt, metadata });
    saveDb();
    res.json({ success: true });
  });

  app.delete('/api/assets/:id', (req, res) => {
    db = db.filter((a: any) => a.id !== req.params.id);
    saveDb();
    res.json({ success: true });
  });

  // --- Vite Middleware ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist', { index: false }));
    app.get('*', (req, res) => {
      try {
        let html = fs.readFileSync(path.resolve(__dirname, 'dist', 'index.html'), 'utf-8');
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
        html = html.replace(
          '</head>',
          `<script>window.ENV = { API_KEY: "${apiKey}" };</script></head>`
        );
        res.send(html);
      } catch (err) {
        res.status(500).send('Error loading index.html');
      }
    });
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT as number, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
