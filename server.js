import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Set required headers for SharedArrayBuffer (needed for WebContainers)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Serve static files from the dist directory (bundled files)
app.use(express.static(path.join(__dirname, 'dist')));

// Serve static files from the current directory for development
app.use(express.static(__dirname));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Bundled version available at http://localhost:${PORT}/dist/index.html`);
});
