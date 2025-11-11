// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url'); // para extraer el hostname
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false })); 
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Almacenamiento temporal en memoria
let urls = []; 

// Endpoint para crear short URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url; 

  // 🔹 Validar formato antes de usar dns.lookup
  const urlRegex = /^(http|https):\/\/[^ "]+$/;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    const hostname = urlParser.parse(originalUrl).hostname;

    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      // Generar short_url (id incremental)
      const shortUrl = urls.length + 1;

      urls.push({ original_url: originalUrl, short_url: shortUrl });

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    });
  } catch (error) {
    res.json({ error: 'invalid url' });
  }
});

// Endpoint para redirigir
app.get('/api/shorturl/:short_url', (req, res) => {
  const short = parseInt(req.params.short_url);
  const found = urls.find((u) => u.short_url === short);

  if (found) {
    res.redirect(found.original_url);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});