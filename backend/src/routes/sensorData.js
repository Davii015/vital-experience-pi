const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth');
const ctrl    = require('../controllers/sensorDataController');

router.get('/',                    auth, ctrl.getAll);
router.get('/session/:sessionId',  auth, ctrl.getBySession);
router.post('/',                   auth, ctrl.create);
router.delete('/:id',              auth, ctrl.remove);

module.exports = router;
