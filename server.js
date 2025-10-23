import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

// Health endpoint so the platform can detect open port quickly
app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

if (fs.existsSync(distPath)) {
  console.log('dist folder found, serving static files from dist');
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('dist folder not found — build may have failed. Serving placeholder page.');
  app.get('/', (req, res) => {
    res.status(200).send('App not built yet. Run `npm run build` to create dist.');
  });
}

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
