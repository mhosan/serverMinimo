// routes/index.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');

// GET /
router.get('/', controller.getWelcome);

// GET /json
router.get('/json', controller.getJson);

// POST /
router.post('/', controller.postText);

// PUT /
router.put('/', controller.putWelcome);

// DELETE /
router.delete('/', controller.deleteWelcome);

module.exports = router;
