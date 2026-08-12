const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true },
    positiveMarks: { type: Number, default: 4 },
    negativeMarks: { type: Number, default: 1 }
});

module.exports = mongoose.model('Question', questionSchema);
