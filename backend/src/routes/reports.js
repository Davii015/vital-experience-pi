const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth');
const ctrl    = require('../controllers/reportsController');
const asyncHandler = require('../utils/asyncHandler');

router.get('/user/:userId', auth, asyncHandler(ctrl.forUser));
router.get('/summary',      auth, asyncHandler(ctrl.summary));

module.exports = router;
