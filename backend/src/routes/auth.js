const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middlewares/auth');

router.post('/login',  asyncHandler(ctrl.login));
router.post('/logout', auth, ctrl.logout);
router.get('/me', auth, asyncHandler(ctrl.me));
router.put('/me', auth, asyncHandler(ctrl.updateMe));
router.put('/password', auth, asyncHandler(ctrl.changePassword));

module.exports = router;
