import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const TMDB_API_KEY = process.env.TMDB_API_KEY || '32e5e53999e380a0291d66fb304153fe';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.use(express.json());

// Proxy endpoint to TMDb API so API key is hidden from frontend
app.get('/api/tmdb/*', async (req, res) => {
  try {
    const endpoint = req.params[0];
    const queryParams = new URLSearchParams(req.query);
    queryParams.set('api_key', TMDB_API_KEY);
    if (!queryParams.has('language')) {
      queryParams.set('language', 'es-ES');
    }

    const targetUrl = `${TMDB_BASE_URL}/${endpoint}?${queryParams.toString()}`;
    const response = await fetch(targetUrl);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Error proxying TMDb request:', error);
    res.status(500).json({ error: 'Error fetching data from TMDb' });
  }
});

// Serve static files in production build
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
