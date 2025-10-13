const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. MIDDLEWARE CORS CORREGIDO: Se aplica a todas las solicitudes
app.use((req, res, next) => {
    // Permite el acceso desde cualquier dominio
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// 🔤 Función para limpiar texto y embellecerlo tipo Spotify
function limpiarYFormatear(texto) {
    if (!texto) return '';
    return texto
        .replace(/_/g, ' ')                       // Reemplaza guiones bajos por espacios
        .replace(/-Xvidadura/gi, '')              // Elimina sufijos específicos
        .replace(/\.mp3|\.wav|\.aac|\.ogg/gi, '') // Elimina extensiones
        .replace(/\s{2,}/g, ' ')                  // Elimina espacios dobles
        .replace(/\s*-\s*$/, '')                  // Elimina guiones finales
        .trim()
        .toLowerCase()                            // Pone todo en minúscula
        .replace(/\b\w/g, c => c.toUpperCase());  // Mayúscula inicial en cada palabra
}

app.get('/', (req, res) => {
    res.send('✅ Proxy de metadatos activo. Usa /metadata para obtener información del stream.');
});

app.get('/metadata', async (req, res) => {
    try {
        // 2. AÑADIR TIMEOUT: Ayuda a prevenir el error 500 si la URL de la radio es lenta
        const response = await fetch('http://usa13.fastcast4u.com:5696/7.html', {
            timeout: 5000 // 5 segundos de espera máxima
        });

        if (!response.ok) {
            // Manejar errores de respuesta HTTP (ej: 404, 503 del servidor de la radio)
            throw new Error(`Stream server responded with status: ${response.status}`);
        }

        const text = await response.text();

        // Limpieza del HTML y separación de los datos
        // Tu lógica de parseo es correcta para este tipo de stream
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

        // Enviar JSON limpio
        // Ya no necesitamos res.setHeader aquí, lo hace el middleware.
        res.json({
            artist: artist || 'Desconocido',
            title: title || 'Sin título',
            stream: 'https://usa13.fastcast4u.com/proxy/nuevavidaonline?mp=/1'
        });

    } catch (error) {
        console.error('Error al obtener metadatos:', error.message);
        // Devolver el error 500 al cliente con un mensaje útil
        res.status(500).json({ error: `Error obteniendo metadatos: ${error.message}` });
    }
});

app.listen(PORT, () => {
    console.log(`🎧 Proxy de metadatos activo y escuchando en el puerto ${PORT}`);
});
