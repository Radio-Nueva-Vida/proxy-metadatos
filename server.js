const express = require('express');
const axios = require('axios'); // Usamos AXIOS para la petición HTTP
const app = express();
const PORT = process.env.PORT || 3000;
const STREAM_URL = 'http://usa13.fastcast4u.com:5696/7.html';

// 1. MIDDLEWARE CORS: Habilitar acceso desde cualquier origen
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// 🔤 Función para limpiar texto y embellecerlo tipo Spotify
function limpiarYFormatear(texto) {
    if (!texto) return '';
    return texto
        .replace(/_/g, ' ')                       
        .replace(/-Xvidadura/gi, '')              
        .replace(/\.mp3|\.wav|\.aac|\.ogg/gi, '') 
        .replace(/\s{2,}/g, ' ')                  
        .replace(/\s*-\s*$/, '')                  
        .trim()
        .toLowerCase()                            
        .replace(/\b\w/g, c => c.toUpperCase());  
}

app.get('/', (req, res) => {
    res.send('✅ Proxy de metadatos activo. Usa /metadata para obtener información del stream.');
});

app.get('/metadata', async (req, res) => {
    try {
        // 2. USO DE AXIOS: Obtiene la respuesta con un timeout
        const response = await axios.get(STREAM_URL, {
            timeout: 5000 // 5 segundos de espera
        });

        const text = response.data;

        // Lógica de parseo
        const parts = text.replace(/<[^>]*>?/gm, '').split(',');
        const songInfo = parts[6] ? parts[6].trim() : '';

        let artist = '';
        let title = '';

        if (songInfo.includes(' - ')) {
            [artist, title] = songInfo.split(' - ');
        } else {
            title = songInfo;
        }

        // Aplicar formato limpio y elegante
        artist = limpiarYFormatear(artist);
        title = limpiarYFormatear(title);

        // Enviar JSON
        res.json({
            artist: artist || 'Desconocido',
            title: title || 'Sin título',
            stream: 'https://usa13.fastcast4u.com/proxy/nuevavidaonline?mp=/1'
        });

    } catch (error) {
        // 3. LOGGING CLARO Y CÓDIGO DE ERROR 503
        console.error('Error al obtener metadatos (AXIOS):', error.message);
        
        // El 503 indica que el servicio (stream) no está disponible temporalmente.
        res.status(503).json({ 
            error: 'Stream temporalmente no disponible (Proxy error)',
            detail: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🎧 Proxy de metadatos activo y escuchando en el puerto ${PORT}`);
});
