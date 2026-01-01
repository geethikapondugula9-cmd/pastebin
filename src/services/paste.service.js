const pool = require('../db');
const { nanoid } = require('nanoid');
const { isExpired } = require('../utils/expiration');
const HttpError = require('../utils/httpError');

const isMySQL = (process.env.DATABASE_URL || '').startsWith('mysql');

exports.create = async ({ content, expiresInSeconds, maxViews }) => {
    if (!content) throw new HttpError(400, 'Content required');

    const id = nanoid(6);
    const expiresAt = expiresInSeconds ? new Date(Date.now() + expiresInSeconds * 1000) : null;

    if (isMySQL) {
        // mysql2 uses ? placeholders
        await pool.execute(
            'INSERT INTO pastes (id, content, expires_at, max_views) VALUES (?, ?, ?, ?)',
            [id, content, expiresAt, maxViews || null]
        );
    } else {
        // Postgres
        await pool.query(
            `INSERT INTO pastes (id, content, expires_at, max_views) VALUES ($1, $2, $3, $4)`,
            [id, content, expiresAt, maxViews || null]
        );
    }

    return {
        id,
        url: `${process.env.BASE_URL}/api/paste/${id}`
    };
};

exports.get = async (id) => {
    if (isMySQL) {
        // MySQL: use transaction: SELECT FOR UPDATE -> check -> UPDATE -> SELECT updated
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            const [rows] = await conn.execute('SELECT * FROM pastes WHERE id = ? FOR UPDATE', [id]);
            if (!rows.length) {
                await conn.rollback();
                throw new HttpError(404, 'Not found or expired');
            }
            const paste = rows[0];
            if (isExpired(paste)) {
                await conn.rollback();
                throw new HttpError(404, 'Not found or expired');
            }
            await conn.execute('UPDATE pastes SET views = views + 1 WHERE id = ?', [id]);
            const [after] = await conn.execute('SELECT id, content, views, expires_at, max_views FROM pastes WHERE id = ?', [id]);
            await conn.commit();
            const p = after[0];
            return {
                content: p.content,
                views: p.views,
                expiresAt: p.expires_at,
                maxViews: p.max_views
            };
        } catch (err) {
            try { await conn.rollback(); } catch (e) {}
            throw err;
        } finally {
            try { await conn.release(); } catch (e) {}
        }
    } else {
        // Postgres: atomic UPDATE ... RETURNING
        const res = await pool.query(
            `UPDATE pastes SET views = views + 1 WHERE id = $1 RETURNING id, content, views, expires_at, max_views`,
            [id]
        );

        if (!res.rows.length) throw new HttpError(404, 'Not found or expired');

        const paste = res.rows[0];

        if (isExpired(paste)) {
            throw new HttpError(404, 'Not found or expired');
        }

        return {
            content: paste.content,
            views: paste.views,
            expiresAt: paste.expires_at,
            maxViews: paste.max_views
        };
    }
};
