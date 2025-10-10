// ===============================
// Proxy Seguro HTTPS para Icecast (Caster.fm)
// ===============================

import express from "express";
import fetch from "node-fetch";

const app = express();

// URL del stream Caster.fm (Icecast)
const STREAM_URL = "http://shaincast.caster.fm:48858/listen.mp3";

// Permitir CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Ruta principal
app.get("/", (req, res) => {
  res.send("🎧 Proxy HTTPS activo - Radio Nueva Vida (Caster.fm)");
});

// Ruta del stream
app.get("/stream", async (req, res) => {
  try {
    const response = await fetch(STREAM_URL);
    if (!response.ok) {
      return res.status(response.status).send("Error al conectar con el stream");
    }
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-cache");
    response.body.pipe(res);
  } catch (error) {
    console.error("Error al conectar con Caster.fm:", error);
    res.status(500).send("Error interno del proxy");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Proxy Caster.fm activo en puerto ${PORT}`);
});
