const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => res.json({post: "toto"}) );

module.exports = router;