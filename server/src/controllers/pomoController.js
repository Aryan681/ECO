const pomodoroService = require('../services/pomoService');

exports.startPomodoro = async (req, res) => {
  try {
    const duration = req.body.duration || 1500; // 25 mins default
    const session = await pomodoroService.startPomodoro(req.user.id, duration);
    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.pausePomodoro = async (req, res) => {
  try {
    const session = await pomodoroService.pausePomodoro(req.user.id);
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.resumePomodoro = async (req, res) => {
  try {
    const session = await pomodoroService.resumePomodoro(req.user.id);
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.resetPomodoro = async (req, res) => {
  try {
    const session = await pomodoroService.resetPomodoro(req.user.id);
    res.status(200).json({ success: true, message: 'Session reset' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPomodoroStatus = async (req, res) => {
  try {
    const session = await pomodoroService.getPomodoroStatus(req.user.id);
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPomodoroHistory = async (req, res) => {
  try {
    const history = await pomodoroService.getPomodoroHistory(req.user.id);
    res.status(200).json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
