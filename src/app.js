const express = require('express');
const cors = require('cors');
const pasteRoutes = require('./routes/paste.routes');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5174';
app.use(cors({ origin: allowedOrigin }));
app.use(requestLogger);

app.use(express.json());
app.use('/api/paste', pasteRoutes);

app.get('/', (_, res) => {
    res.send('Pastebin API running');
});

// Error handler (must be after routes)
app.use(errorHandler);

module.exports = app;
