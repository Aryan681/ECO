const mongoose = require('mongoose');

const codeSnippetSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  language: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CodeSnippet', codeSnippetSchema);  