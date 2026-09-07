const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth');
const ctrl    = require('../controllers/sensorDataController');
const asyncHandler = require('../utils/asyncHandler');

router.get('/',                    auth, asyncHandler(ctrl.getAll));
router.get('/session/:sessionId',  auth, asyncHandler(ctrl.getBySession));
router.post('/',                   auth, asyncHandler(ctrl.create));
router.delete('/:id',              auth, asyncHandler(ctrl.remove));

module.exports = router;
