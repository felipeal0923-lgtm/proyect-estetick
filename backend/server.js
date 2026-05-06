require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' http://localhost:3001; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self';"
  );
  next();
});
// ─── Conexión a la base de datos ───────────────────────────────────────────
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Alias para mantener la misma API interna
const db = {
    run: (text, params = []) => pool.query(text, params),
    get: (text, params = []) => pool.query(text, params).then(r => r.rows[0]),
    all: (text, params = []) => pool.query(text, params).then(r => r.rows),
};

// ─── Inicializar esquema ────────────────────────────────────────────────────
async function initDB() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS businesses (
            id SERIAL PRIMARY KEY,
            name TEXT,
            logo TEXT,
            primary_color TEXT DEFAULT '#F14C8B',
            secondary_color TEXT DEFAULT '#898989'
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            identifier TEXT UNIQUE,
            name TEXT,
            phone TEXT,
            password TEXT,
            role TEXT DEFAULT 'user',
            "businessId" INTEGER DEFAULT 1
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS appointments (
            id SERIAL PRIMARY KEY,
            date TEXT,
            time TEXT,
            "userId" INTEGER,
            "businessId" INTEGER DEFAULT 1,
            UNIQUE(date, time, "businessId")
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS prices (
            id SERIAL PRIMARY KEY,
            name TEXT,
            price TEXT,
            "businessId" INTEGER DEFAULT 1
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS gallery (
            id SERIAL PRIMARY KEY,
            url TEXT,
            "businessId" INTEGER DEFAULT 1
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            "userId" INTEGER,
            message TEXT,
            date TEXT,
            read INTEGER DEFAULT 0,
            "businessId" INTEGER DEFAULT 1
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS promotions (
            id SERIAL PRIMARY KEY,
            name TEXT,
            price TEXT,
            "businessId" INTEGER DEFAULT 1
        )
    `);

    // Negocio por defecto
    const biz = await pool.query('SELECT COUNT(*) as count FROM businesses');
    if (parseInt(biz.rows[0].count) === 0) {
        await pool.query("INSERT INTO businesses (name, logo) VALUES ($1, $2)", ['Glamour Touch', '']);
    }

    // Precios iniciales
    const pricesCount = await pool.query('SELECT COUNT(*) as count FROM prices');
    if (parseInt(pricesCount.rows[0].count) === 0) {
        const initialPrices = [
            ['Cejas', '15,000'], ['Bozo', '9,000'], ['Axilas', '15,000'],
            ['Media pierna', '20,000'], ['Pierna completa', '40,000'],
            ['Bikiny completo', '35,000'], ['Cejas semipermanentes', '25,000'],
            ['Pestañas punto a punto', '25,000'], ['Pestañas pelo a pelo', '60,000'],
            ['Laminado de cejas', '55,000'], ['Lifting de pestañas', '45,000'],
            ['Cejas micropigmentadas (incluye retoques)', '180,000']
        ];
        for (const [name, price] of initialPrices) {
            await pool.query('INSERT INTO prices (name, price, "businessId") VALUES ($1, $2, 1)', [name, price]);
        }
    }

    // Galería inicial
    const galleryCount = await pool.query('SELECT COUNT(*) as count FROM gallery');
    if (parseInt(galleryCount.rows[0].count) === 0) {
        const initialImages = [
            "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&q=80&w=600"
        ];
        for (const url of initialImages) {
            await pool.query('INSERT INTO gallery (url, "businessId") VALUES ($1, 1)', [url]);
        }
    }

    // Promociones iniciales
    const promosCount = await pool.query('SELECT COUNT(*) as count FROM promotions');
    if (parseInt(promosCount.rows[0].count) === 0) {
        const initialPromos = [
            ['Masaje relajante', '60,000'],
            ['Pestañas pelo a pelo + cejas semi', '50,000'],
            ['Depilación completa', '50,000'],
            ['Depilación cejas + bozo + axilas', '18,000'],
            ['Cejas semipermanentes + pestañas punto a punto', '20,000']
        ];
        for (const [name, price] of initialPromos) {
            await pool.query('INSERT INTO promotions (name, price, "businessId") VALUES ($1, $2, 1)', [name, price]);
        }
    }

    console.log('✅ Base de datos PostgreSQL inicializada');
}

// ─── ENDPOINTS ─────────────────────────────────────────────────────────────

// Registro
app.post('/api/register', async (req, res) => {
    const { identifier, name, phone, password, businessId = 1 } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO users (identifier, name, phone, password, "businessId") VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [identifier, name, phone, password, businessId]
        );
        res.json({ success: true, userId: result.rows[0].id, name, businessId });
    } catch (err) {
        res.status(400).json({ error: 'Este correo o teléfono ya está registrado' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const result = await pool.query(
            `SELECT id, name, "businessId", role FROM users WHERE identifier = $1 AND password = $2`,
            [identifier, password]
        );
        if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });
        const row = result.rows[0];
        res.json({ success: true, userId: row.id, name: row.name, businessId: row.businessId, role: row.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar perfil
app.put('/api/user/update-profile', async (req, res) => {
    const { userId, name, phone, identifier } = req.body;
    try {
        await pool.query(
            'UPDATE users SET name = $1, phone = $2, identifier = $3 WHERE id = $4',
            [name, phone, identifier, userId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Este correo ya está registrado por otro usuario' });
    }
});

// Obtener usuario
app.get('/api/user/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT name, identifier, phone, "businessId" FROM users WHERE id = $1`,
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Información del negocio
app.get('/api/business/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM businesses WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Negocio no encontrado' });
        res.json({ success: true, business: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Disponibilidad de citas
app.get('/api/appointments', async (req, res) => {
    const { date, businessId = 1 } = req.query;
    try {
        const result = await pool.query(
            `SELECT time FROM appointments WHERE date = $1 AND "businessId" = $2`,
            [date, businessId]
        );
        res.json({ success: true, bookedTimes: result.rows.map(r => r.time) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Agendar cita
app.post('/api/appointments', async (req, res) => {
    const { date, time, userId, businessId = 1 } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO appointments (date, time, "userId", "businessId") VALUES ($1, $2, $3, $4) RETURNING id`,
            [date, time, userId, businessId]
        );
        res.json({ success: true, appointmentId: result.rows[0].id });
    } catch (err) {
        res.status(400).json({ success: false, error: 'Este horario ya está ocupado' });
    }
});

// Citas de un usuario
app.get('/api/appointments/user/:userId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM appointments WHERE "userId" = $1 ORDER BY date DESC, time DESC`,
            [req.params.userId]
        );
        res.json({ success: true, appointments: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar cita (con notificaciones bidireccionales)
app.delete('/api/appointments/:id', async (req, res) => {
    const { source } = req.query; // 'admin' o 'user'
    try {
        const appt = await pool.query(
            `SELECT a."userId", a.date, a.time, u.name 
             FROM appointments a JOIN users u ON a."userId" = u.id 
             WHERE a.id = $1`, [req.params.id]
        );
        if (appt.rows.length > 0) {
            const { userId, date, time, name } = appt.rows[0];
            if (source === 'admin') {
                const message = `Tu cita del ${date} a las ${time} ha sido cancelada por el administrador.`;
                await pool.query(
                    `INSERT INTO notifications ("userId", message, date, "businessId") VALUES ($1, $2, $3, 1)`,
                    [userId, message, new Date().toISOString()]
                );
            } else if (source === 'user') {
                const message = `El cliente ${name} canceló su cita del ${date} a las ${time}.`;
                await pool.query(
                    `INSERT INTO notifications ("userId", message, date, "businessId") VALUES ($1, $2, $3, 1)`,
                    [1, message, new Date().toISOString()] // 1 es el ID del admin
                );
            }
        }
        await pool.query('DELETE FROM appointments WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin — todas las citas
app.get('/api/admin/all-data', async (req, res) => {
    const { businessId = 1 } = req.query;
    try {
        const appointments = await pool.query(
            `SELECT a.id, a.date, a.time, u.name, u.phone
             FROM appointments a JOIN users u ON a."userId" = u.id
             WHERE a."businessId" = $1 ORDER BY a.date ASC, a.time ASC`,
            [businessId]
        );
        const prices = await pool.query(`SELECT * FROM prices WHERE "businessId" = $1`, [businessId]);
        const gallery = await pool.query(`SELECT * FROM gallery WHERE "businessId" = $1`, [businessId]);
        const promotions = await pool.query(`SELECT * FROM promotions WHERE "businessId" = $1`, [businessId]);
        res.json({
            success: true,
            allAppointments: appointments.rows,
            prices: prices.rows,
            gallery: gallery.rows,
            promotions: promotions.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// RUTAS GET PÚBLICAS
app.get('/api/prices', async (req, res) => {
    const { businessId = 1 } = req.query;
    try {
        const result = await pool.query(`SELECT * FROM prices WHERE "businessId" = $1 ORDER BY id ASC`, [businessId]);
        res.json({ success: true, prices: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/gallery', async (req, res) => {
    const { businessId = 1 } = req.query;
    try {
        const result = await pool.query(`SELECT * FROM gallery WHERE "businessId" = $1 ORDER BY id ASC`, [businessId]);
        res.json({ success: true, images: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/promotions', async (req, res) => {
    const { businessId = 1 } = req.query;
    try {
        const result = await pool.query(`SELECT * FROM promotions WHERE "businessId" = $1 ORDER BY id ASC`, [businessId]);
        res.json({ success: true, promotions: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Notificaciones
app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM notifications WHERE "userId" = $1 ORDER BY date DESC`,
            [req.params.userId]
        );
        res.json({ success: true, notifications: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/notifications/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM notifications WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/notifications/user/:userId', async (req, res) => {
    try {
        await pool.query(`DELETE FROM notifications WHERE "userId" = $1`, [req.params.userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin — Precios
app.post('/api/admin/prices', async (req, res) => {
    const { name, price, businessId = 1 } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO prices (name, price, "businessId") VALUES ($1, $2, $3) RETURNING id`,
            [name, price, businessId]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/prices/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM prices WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/prices/:id', async (req, res) => {
    const { name, price } = req.body;
    try {
        await pool.query(
            'UPDATE prices SET name = $1, price = $2 WHERE id = $3',
            [name, price, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin — Galería
app.post('/api/admin/gallery', async (req, res) => {
    const { url, businessId = 1 } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO gallery (url, "businessId") VALUES ($1, $2) RETURNING id`,
            [url, businessId]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/gallery/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM gallery WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin — Promociones
app.post('/api/admin/promotions', async (req, res) => {
    const { name, price, businessId = 1 } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO promotions (name, price, "businessId") VALUES ($1, $2, $3) RETURNING id`,
            [name, price, businessId]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/promotions/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM promotions WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/promotions/:id', async (req, res) => {
    const { name, price } = req.body;
    try {
        await pool.query(
            'UPDATE promotions SET name = $1, price = $2 WHERE id = $3',
            [name, price, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Inicio ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Error al inicializar la DB:', err);
    process.exit(1);
});
