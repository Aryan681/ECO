const { executeCode } = require("../services/codeServices");

const runCode = async (req, res) => {
  try {
    const { language, code } = req.body;
    if (!language || !code) {
      return res.status(400).json({ error: "Missing language or code" });
    }

    const output = await executeCode(language, code);
    res.json({ output });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { runCode };
