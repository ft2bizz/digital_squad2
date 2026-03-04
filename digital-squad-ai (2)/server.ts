import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const db = new Database('app.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    prompt TEXT,
    createdAt INTEGER NOT NULL,
    metadata TEXT
  )
`);

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
    const assets = db.prepare('SELECT * FROM assets ORDER BY createdAt DESC').all();
    res.json(assets.map((a: any) => ({ ...a, metadata: a.metadata ? JSON.parse(a.metadata) : null })));
  });

  app.post('/api/assets', (req, res) => {
    const { id, type, title, url, prompt, createdAt, metadata } = req.body;
    db.prepare('INSERT INTO assets (id, type, title, url, prompt, createdAt, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, type, title, url, prompt, createdAt, metadata ? JSON.stringify(metadata) : null);
    res.json({ success: true });
  });

  app.delete('/api/assets/:id', (req, res) => {
    db.prepare('DELETE FROM assets WHERE id = ?').run(req.params.id);
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
