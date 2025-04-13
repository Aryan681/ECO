const express = require('express');
const router = express.Router();
const pomodoroController = require('../controllers/pomoController');
const { authenticate } = require('../middlewares/auth');

router.post('/start', authenticate, pomodoroController.startPomodoro);
router.post('/pause', authenticate, pomodoroController.pausePomodoro);
router.post('/resume', authenticate, pomodoroController.resumePomodoro);
router.post('/reset', authenticate, pomodoroController.resetPomodoro);
router.get('/status', authenticate, pomodoroController.getPomodoroStatus);
router.get('/history', authenticate, pomodoroController.getPomodoroHistory);

module.exports = router;
