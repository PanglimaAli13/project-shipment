// api/drivers.js
const { Pool } = require('pg');
// require('dotenv') tidak digunakan karena Vercel otomatis menyediakan Environment Variables

const pool = new Pool({
    // Vercel akan otomatis mengisi process.env.DATABASE_URL
    connectionString: process.env.DATABASE_URL,
});

// Fungsi Serverless utama
export default async function handler(req, res) {
    // Vercel Serverless Functions hanya menerima 1 fungsi export default
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const result = await pool.query('SELECT nik_driver, nama_driver FROM users ORDER BY nama_driver ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching drivers:', err);
        res.status(500).json({ message: 'Error fetching drivers from database' });
    }
}