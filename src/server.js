require('dotenv').config();
const app = require('./app');

const logger = require('./utils/logger');

// Only listen if not running as serverless function
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'unhandledRejection');
});

process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'uncaughtException');
    process.exit(1);
});
