require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const logger = require('./utils/logger');

process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'unhandledRejection');
});

process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'uncaughtException');
    process.exit(1);
});
