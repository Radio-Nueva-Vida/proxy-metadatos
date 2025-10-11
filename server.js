const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/metadata', async (req, res) => {
    try {
        const response = await fetch('http://usa13.fastcast4u.com:5696/7.html');
        const text = await response.text();
        res.set('Access-Control-Allow-Origin', '*');
        res.send(text);
    } catch (error) {
        res.status(500).send('Error obteniendo metadatos');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
