const mongoose = require('mongoose');
const requestSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    examName: { type: String, required: true },
    testName: { type: String, required: true },
    status: { type: String, default: 'pending' }, // 'pending', 'approved', 'rejected'
    date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('AccessRequest', requestSchema);
