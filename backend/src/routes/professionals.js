const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth');
const adminOnly = require('../middlewares/adminOnly');
const ctrl    = require('../controllers/professionalsController');
const asyncHandler = require('../utils/asyncHandler');

router.get('/',      auth, asyncHandler(ctrl.getAll));
router.get('/:id',   auth, asyncHandler(ctrl.getById));
router.post('/',     auth, adminOnly, asyncHandler(ctrl.create));
router.put('/:id',   auth, adminOnly, asyncHandler(ctrl.update));
router.delete('/:id',auth, adminOnly, asyncHandler(ctrl.remove));

module.exports = router;
