const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    examName: { type: String, required: true },
    testName: { type: String, required: true },
    score: { type: Number, required: true },
    correct: { type: Number, required: true },
    wrong: { type: Number, required: true },
    skipped: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', resultSchema);
