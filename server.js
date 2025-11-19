// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// =========================================================
// !!! GANTI DENGAN CONNECTION STRING NEON.TECH ANDA !!!
// =========================================================
require('dotenv').config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Ambil Data Driver untuk Dropdown
app.get('/api/drivers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY nama_driver ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Ambil Data Shipment berdasarkan range tanggal dan driver
app.get('/api/shipments', async (req, res) => {
  const { nik, startDate, endDate } = req.query;
  try {
    const query = `
      SELECT * FROM shipment 
      WHERE nik_driver = $1 
      AND tanggal >= $2 AND tanggal <= $3
    `;
    const result = await pool.query(query, [nik, startDate, endDate]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Simpan Data (Upsert: Insert atau Update jika data driver/tanggal sudah ada)
app.post('/api/shipments', async (req, res) => {
  const { nik_driver, nama_driver, tanggal, shipment_code } = req.body;

  // Validasi server side: hanya angka 10 digit atau '-' (untuk kosong)
  if (!/^\d{10}$/.test(shipment_code) && shipment_code !== '-') {
     return res.status(400).json({message: "Format Shipment Code salah. Harus 10 digit atau '-'."});
  }

  try {
    const query = `
      INSERT INTO shipment (nik_driver, nama_driver, tanggal, shipment_code)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (nik_driver, tanggal) 
      DO UPDATE SET shipment_code = EXCLUDED.shipment_code, nama_driver = EXCLUDED.nama_driver;
    `;
    await pool.query(query, [nik_driver, nama_driver, tanggal, shipment_code]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});