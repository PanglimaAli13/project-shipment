// api/shipments.js
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
    if (req.method === 'GET') {
        // --- LOGIKA GET SHIPMENTS ---
        const { nik, startDate, endDate } = req.query;
        try {
            const query = `
                SELECT * FROM shipment 
                WHERE nik_driver = $1 
                AND tanggal >= $2 AND tanggal <= $3
            `;
            const result = await pool.query(query, [nik, startDate, endDate]);
            res.status(200).json(result.rows);
        } catch (err) {
            console.error('Error fetching shipments:', err);
            res.status(500).json({ message: 'Server Error during GET' });
        }
    } 
    else if (req.method === 'POST') {
        // --- LOGIKA POST (SIMPAN/EDIT) SHIPMENTS ---
        const { nik_driver, nama_driver, tanggal, shipment_code } = req.body;

        if (!/^\d{10}$/.test(shipment_code) && shipment_code !== '-') {
             return res.status(400).json({ message: "Format Shipment Code salah. Harus 10 digit atau '-'." });
        }

        try {
            const query = `
                INSERT INTO shipment (nik_driver, nama_driver, tanggal, shipment_code)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (nik_driver, tanggal) 
                DO UPDATE SET shipment_code = EXCLUDED.shipment_code, nama_driver = EXCLUDED.nama_driver;
            `;
            await pool.query(query, [nik_driver, nama_driver, tanggal, shipment_code]);
            res.status(200).json({ success: true });
        } catch (err) {
            console.error('Error saving shipments:', err);
            res.status(500).json({ message: 'Server Error during POST' });
        }
    } 
    else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}