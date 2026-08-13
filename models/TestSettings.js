const mongoose = require('mongoose');
const testSettingsSchema = new mongoose.Schema({
    examName: { type: String, required: true },
    testName: { type: String, required: true },
    rankingEndDate: { type: String, default: "" }, // Date limit (YYYY-MM-DD)
    rankingMaxStudents: { type: Number, default: null } // Student limit
});
module.exports = mongoose.model('TestSettings', testSettingsSchema);
