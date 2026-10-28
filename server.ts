import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.join(__dirname, 'data');
const CARDS_FILE = path.join(DATA_DIR, 'cards.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial cards fallback if empty
function loadStoredCards() {
  try {
    if (fs.existsSync(CARDS_FILE)) {
      const content = fs.readFileSync(CARDS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading cards file:', err);
  }
  return [];
}

function saveStoredCards(cards: any[]) {
  try {
    fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing cards file:', err);
    return false;
  }
}

// Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve public uploads statically
app.use('/uploads', express.static(UPLOADS_DIR));

// API Routes
app.get('/api/health', (req, res) => {
  const cards = loadStoredCards();
  res.json({
    status: 'OK',
    driver: 'Express Persistent JSON Storage',
    cardsCount: cards.length,
    timestamp: new Date().toISOString(),
    message: 'Servidor LAV Digital Pagos activo y listo para sincronizar.'
  });
});

app.get('/api/cards', (req, res) => {
  const cards = loadStoredCards();
  res.json(cards);
});

app.get('/api/cards/:slug', (req, res) => {
  const slug = req.params.slug.toLowerCase().trim();
  const cards = loadStoredCards();
  const card = cards.find((c: any) => c.slug?.toLowerCase() === slug || c.id === slug);
  if (!card) {
    return res.status(404).json({ error: 'Tarjeta no encontrada' });
  }
  res.json(card);
});

app.post('/api/cards', (req, res) => {
  const incomingCard = req.body;
  if (!incomingCard || !incomingCard.slug || !incomingCard.businessName) {
    return res.status(400).json({ error: 'Datos incompletos: slug y businessName son obligatorios' });
  }

  const cards = loadStoredCards();
  const index = cards.findIndex((c: any) => c.id === incomingCard.id);

  if (index >= 0) {
    cards[index] = { ...cards[index], ...incomingCard, updatedAt: new Date().toISOString() };
  } else {
    cards.unshift({
      ...incomingCard,
      createdAt: incomingCard.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  saveStoredCards(cards);
  res.json({ success: true, card: incomingCard });
});

app.delete('/api/cards/:id', (req, res) => {
  const id = req.params.id;
  let cards = loadStoredCards();
  cards = cards.filter((c: any) => c.id !== id);
  saveStoredCards(cards);
  res.json({ success: true, id });
});

// Logo upload endpoint supporting base64 data URLs
app.post('/api/upload', (req, res) => {
  const { dataUrl, filename } = req.body;
  if (!dataUrl) {
    return res.status(400).json({ error: 'No se envió imagen' });
  }

  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If it's already a URL, return it
      return res.json({ url: dataUrl });
    }

    const ext = matches[1].split('/')[1] || 'png';
    const cleanExt = ext === 'svg+xml' ? 'svg' : ext;
    const safeName = `logo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    const buffer = Buffer.from(matches[2], 'base64');
    fs.writeFileSync(filePath, buffer);

    res.json({ url: `/uploads/${safeName}` });
  } catch (err: any) {
    console.error('Error saving uploaded file:', err);
    res.status(500).json({ error: 'Error al guardar el archivo', details: err.message });
  }
});

// Vite middleware in dev or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LAV Digital Pagos server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
