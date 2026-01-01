const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const {
    createPaste,
    getPaste
} = require('../controllers/paste.controller');

const router = express.Router();

router.post('/', asyncHandler(createPaste));
router.get('/:id', asyncHandler(getPaste));

module.exports = router;

// CRUD
// Create - POST /api/paste
// Read - GET /api/paste/:id