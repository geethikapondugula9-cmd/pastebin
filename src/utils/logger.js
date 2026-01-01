const pino = require('pino');

const isProd = process.env.NODE_ENV === 'production';

const logger = pino({
    transport: isProd ? undefined : { target: 'pino-pretty', options: { colorize: true } },
    level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug')
});

module.exports = logger;
