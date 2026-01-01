const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
    const status = err.statusCode || err.status || 500;
    const safeMessage = err.message || 'Internal Server Error';

    logger.error({ err, path: req.path, method: req.method }, 'unhandled_error');

    const payload = { error: safeMessage };
    if (process.env.NODE_ENV !== 'production') {
        payload.stack = err.stack;
    }

    res.status(status).json(payload);
};
