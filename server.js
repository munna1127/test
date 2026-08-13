const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Question = require('./models/Question');
const User = require('./models/User');
const Result = require('./models/Result');
const AccessRequest = require('./models/AccessRequest');
const TestSettings = require('./models/TestSettings'); // Naya Model Import
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Database connected successfully!'))
    .catch((err) => console.log('❌ Error:', err.message));

app.post('/admin-login', (req, res) => {
    if (req.body.username === 'admin' && req.body.password === 'TomarJi123') res.status(200).json({ message: "Welcome Admin!" });
    else res.status(400).json({ error: "Invalid Credentials!" });
});

app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (await User.findOne({ email })) return res.status(400).json({ error: "Email already registered!" });
        await new User({ name, email, password }).save();
        res.status(201).json({ message: "Account created! Please login." });
    } catch (e) { res.status(500).json({ error: "Server error" }); }
});

app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email, password: req.body.password });
        if (!user) return res.status(400).json({ error: "Invalid Credentials!" });
        res.status(200).json({ message: "Success", name: user.name, email: user.email });
    } catch (e) { res.status(500).json({ error: "Server error" }); }
});

app.get('/get-exams', async (req, res) => { try { res.status(200).json(await Question.distinct('examName')); } catch (e) { res.status(500).json({ error: "Failed" }); } });
app.get('/get-tests/:examName', async (req, res) => { try { res.status(200).json(await Question.distinct('testName', { examName: req.params.examName })); } catch (e) { res.status(500).json({ error: "Failed" }); } });
app.post('/get-test-questions', async (req, res) => { try { res.status(200).json(await Question.find({ examName: req.body.examName, testName: req.body.testName })); } catch (e) { res.status(500).json({ error: "Failed" }); } });

app.post('/check-access', async (req, res) => {
    try { const access = await AccessRequest.findOne({ userEmail: req.body.userEmail, examName: req.body.examName, testName: req.body.testName }).sort({ date: -1 }); res.status(200).json(access || { status: 'none' }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.post('/request-access', async (req, res) => {
    try { let reqRecord = await AccessRequest.findOne({ userEmail: req.body.userEmail, examName: req.body.examName, testName: req.body.testName }); if (reqRecord) { reqRecord.status = 'pending'; reqRecord.date = Date.now(); } else { reqRecord = new AccessRequest(req.body); } await reqRecord.save(); res.status(200).json({ message: "Requested" }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.get('/all-requests', async (req, res) => { try { res.status(200).json(await AccessRequest.find().sort({ date: -1 })); } catch (e) { res.status(500).json({ error: "Failed" }); } });
app.put('/update-request/:id', async (req, res) => { try { await AccessRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }); res.status(200).json({ message: "Updated" }); } catch (e) { res.status(500).json({ error: "Failed" }); } });

// --- NAYI APIs: TEST RANKING SCHEDULER ---
app.post('/get-test-settings', async (req, res) => {
    try { const settings = await TestSettings.findOne({ examName: req.body.examName, testName: req.body.testName }); res.status(200).json(settings || {}); } catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.post('/save-test-settings', async (req, res) => {
    try { 
        let settings = await TestSettings.findOne({ examName: req.body.examName, testName: req.body.testName }); 
        if (settings) { settings.rankingEndDate = req.body.rankingEndDate; settings.rankingMaxStudents = req.body.rankingMaxStudents; } 
        else { settings = new TestSettings(req.body); } 
        await settings.save(); res.status(200).json({ message: "Settings Updated!" }); 
    } catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.post('/save-result', async (req, res) => { try { await new Result(req.body).save(); res.status(201).json({ message: "Saved!" }); } catch (e) { res.status(500).json({ error: "Failed" }); } });

// UPDATED LEADERBOARD API: Ab ye limit check karega
app.post('/leaderboard', async (req, res) => { 
    try { 
        const { examName, testName } = req.body;
        const leaderboard = await Result.find({ examName, testName }).sort({ score: -1, date: 1 }); 
        const settings = await TestSettings.findOne({ examName, testName });
        
        let showRank = true;
        let hideMessage = "";
        
        if (settings) {
            if (settings.rankingEndDate && new Date() > new Date(settings.rankingEndDate)) {
                showRank = false; hideMessage = "Ranking visibility date has expired for this test.";
            }
            if (settings.rankingMaxStudents && leaderboard.length > settings.rankingMaxStudents) {
                showRank = false; hideMessage = `Ranking was restricted to the first ${settings.rankingMaxStudents} students.`;
            }
        }
        res.status(200).json({ leaderboard, showRank, hideMessage }); 
    } catch (e) { res.status(500).json({ error: "Failed" }); } 
});

app.get('/all-results', async (req, res) => { try { res.status(200).json(await Result.find().sort({ date: -1 })); } catch (e) { res.status(500).json({ error: "Failed" }); } });
app.post('/add-question', async (req, res) => { try { await new Question(req.body).save(); res.status(201).json({ message: "Added!" }); } catch (e) { res.status(500).json({ error: "Failed" }); } });
app.get('/all-questions', async (req, res) => { try { res.status(200).json(await Question.find().sort({ examName: 1, testName: 1 })); } catch (e) { res.status(500).json({ error: "Failed" }); } });
app.put('/update-question/:id', async (req, res) => { try { await Question.findByIdAndUpdate(req.params.id, req.body); res.status(200).json({ message: "Updated!" }); } catch (e) { res.status(500).json({ error: "Failed" }); } });
app.delete('/delete-question/:id', async (req, res) => { try { await Question.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Deleted!" }); } catch (e) { res.status(500).json({ error: "Failed" }); } });

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });
app.get('/admin', (req, res) => { res.sendFile(path.join(__dirname, 'admin.html')); });

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => { console.log(`🚀 Server is running on port ${PORT}`); });
