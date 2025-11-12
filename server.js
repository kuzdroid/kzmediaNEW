# Dosya: package.json
{
  "name": "kzmedia-node",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}

# Dosya: server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Statik dosyaları KÖK dizinden servis et (public klasörü YOK)
app.use(express.static(__dirname, { index: false, maxAge: "1h" }));

// Ana sayfa
app.get(["/", "/index.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// (İsteğe bağlı) SPA rotaları varsa 404 yerine index.html döndürmek için:
// app.get("*", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.listen(PORT, () => {
  console.log(`KZMedia Node sunucu hazır: http://localhost:${PORT}`);
});

# Dosya: render.yaml
services:
  - type: web
    name: kzmedia-node
    runtime: node
    plan: free
    buildCommand: "npm install"
    startCommand: "node server.js"
    envVars:
      - key: NODE_VERSION
        value: 20
    healthCheckPath: "/"

# Dosya: index.html
<!-- Buraya mevcut KZMedia tek-dosya HTML'ini (kanvastaki güncel sürüm) AYNI İSİMLE koy. -->
<!-- Dikkat: public klasörü YOK; dosya kökten servis ediliyor. -->
