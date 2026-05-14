const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth');
const ctrl    = require('../controllers/reportsController');

router.get('/user/:userId', auth, ctrl.forUser);
router.get('/summary',      auth, ctrl.summary);

module.exports = router;
