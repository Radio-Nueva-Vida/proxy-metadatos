const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// 📡 Archivo de metadatos (NO el stream de audio)
const METADATA_URL = "https://radios.solumedia.com:6292/7.html";

// 1. CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 🔤 Limpieza de texto
function limpiarYFormatear(texto) {
  if (!texto) return '';
  return texto
    .replace(/_/g, ' ')
    .replace(/\.mp3|\.aac|\.ogg|\.wav/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

app.get('/', (req, res) => {
  res.send('✅ Proxy activo. Usa /metadata para obtener información del stream.');
});

app.get('/metadata', async (req, res) => {
  try {
    // 🔸 Agregamos parámetro aleatorio para evitar caché en el servidor origen
    const response = await axios.get(`${METADATA_URL}?t=${Date.now()}`, {
      timeout: 5000,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    const text = response.data.replace(/<[^>]+>/g, '');
    const parts = text.split(',');

    let rawSong = parts[6] || parts[0] || '';
    rawSong = rawSong.trim();

    let artist = '', title = '';
    if (rawSong.includes(' - ')) {
      [artist, title] = rawSong.split(' - ');
    } else {
      title = rawSong;
    }

    // 🔸 Respuesta sin caché al cliente (tu reproductor)
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      artist: limpiarYFormatear(artist),
      title: limpiarYFormatear(title),
      stream: "https://radios.solumedia.com:6292/stream?icy=http"
    });

  } catch (error) {
    console.error('Error obteniendo metadatos:', error.message);
    res.status(503).json({ error: 'No se pudo obtener metadatos', detail: error.message });
  }
});

// 🚀 Auto-PING: evita que Render entre en hibernación
setInterval(() => {
  axios.get(`https://${process.env.RENDER_EXTERNAL_URL || 'proxy-metadatos.onrender.com'}/`)
    .then(() => console.log("Ping para mantener activo el servidor."))
    .catch(() => {});
}, 14 * 60 * 1000); // cada 14 minutos (Render hiberna a los 15)

app.listen(PORT, () => {
  console.log(`🎧 Proxy de metadatos activo en puerto ${PORT}`);
});
