const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    examName: { type: String, required: true },
    testName: { type: String, required: true },
    subject: { type: String, required: true, default: "General" }, // NAYA FEATURE: Subject
    topic: { type: String, required: true, default: "Mixed" },     // NAYA FEATURE: Chapter/Topic
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true },
    positiveMarks: { type: Number, default: 4 },
    negativeMarks: { type: Number, default: 1 }
});

module.exports = mongoose.model('Question', questionSchema);
