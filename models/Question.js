const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    examName: { type: String, required: true },
    testName: { type: String, required: true },
    subject: { type: String, required: true, default: "General" },
    topic: { type: String, required: true, default: "Mixed" },
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true },
    positiveMarks: { type: Number, default: 4 }, // Ab ye decimals support karega
    negativeMarks: { type: Number, default: 1 }, // Ab ye decimals support karega
    testDuration: { type: Number, default: 60 }  // NAYA: Test Timer (in Minutes)
});

module.exports = mongoose.model('Question', questionSchema);
