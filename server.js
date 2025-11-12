import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL bağlantısı (Render DB ortam değişkenlerinden)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test için tablo oluştur (ilk açılışta)
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS likes (
      id SERIAL PRIMARY KEY,
      username TEXT,
      post_id TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}
initDB();

// Statik dosyaları servis et
app.use(express.static(__dirname, { index: false }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Basit API: toplam beğeni sayısı
app.get("/api/likes/:postid", async (req, res) => {
  const { postid } = req.params;
  const result = await pool.query("SELECT COUNT(*) FROM likes WHERE post_id=$1", [postid]);
  res.json({ postid, likes: parseInt(result.rows[0].count, 10) });
});

// Beğeni ekle
app.post("/api/like/:user/:postid", async (req, res) => {
  const { user, postid } = req.params;
  // Aynı kullanıcı aynı postu sadece 1 kez beğenebilir
  const existing = await pool.query("SELECT 1 FROM likes WHERE username=$1 AND post_id=$2", [user, postid]);
  if (existing.rowCount) return res.status(400).json({ error: "already_liked" });
  await pool.query("INSERT INTO likes(username, post_id) VALUES($1,$2)", [user, postid]);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`KZMedia Node + PostgreSQL http://localhost:${PORT}`));
