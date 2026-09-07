const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');

router.post('/login',  asyncHandler(ctrl.login));
router.post('/logout', ctrl.logout);

module.exports = router;
