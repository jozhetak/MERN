const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => res.json({profile: "toto"}) );

module.exports = router;