
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/metadata', async (req, res) => {
    try {
        const response = await fetch('http://usa13.fastcast4u.com:5696/7.html');
        const text = await response.text();

        // Limpia el texto y separa los valores
        const parts = text.replace(/<[^>]*>?/gm, '').split(',');

        // Último valor: "Artista - Canción"
        const songInfo = parts[6] ? parts[6].trim() : '';
        let artist = '';
        let title = '';

        if (songInfo.includes(' - ')) {
            [artist, title] = songInfo.split(' - ');
        } else {
            title = songInfo;
        }

        // Habilitar CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json({
            artist: artist || 'Desconocido',
            title: title || 'Sin título',
            stream: 'https://usa13.fastcast4u.com/proxy/nuevavidaonline?mp=/1'
        });
    } catch (error) {
        console.error('Error al obtener metadatos:', error);
        res.status(500).json({ error: 'Error obteniendo metadatos' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Servidor proxy de metadatos escuchando en el puerto ${PORT}`);
});
