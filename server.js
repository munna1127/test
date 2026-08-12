const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Question = require('./models/Question');
const User = require('./models/User');
const Result = require('./models/Result');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// NAYA FEATURE: Public folder ko allow karna taaki logo load ho sake
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Database connected successfully!'))
    .catch((err) => console.log('❌ Error:', err.message));

app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'TomarJi123') { res.status(200).json({ message: "Welcome Admin!" }); } 
    else { res.status(400).json({ error: "Invalid Credentials!" }); }
});

app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email is already registered!" });
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: "Account created successfully! Please login." });
    } catch (error) { res.status(500).json({ error: "Server error!" }); }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(400).json({ error: "Invalid Email or Password!" });
        res.status(200).json({ message: "Login Successful", name: user.name, email: user.email });
    } catch (error) { res.status(500).json({ error: "Server error!" }); }
});

app.get('/get-exams', async (req, res) => { try { res.status(200).json(await Question.distinct('examName')); } catch (error) { res.status(500).json({ error: "Failed" }); } });
app.get('/get-tests/:examName', async (req, res) => { try { res.status(200).json(await Question.distinct('testName', { examName: req.params.examName })); } catch (error) { res.status(500).json({ error: "Failed" }); } });
app.post('/get-test-questions', async (req, res) => { try { res.status(200).json(await Question.find({ examName: req.body.examName, testName: req.body.testName })); } catch (error) { res.status(500).json({ error: "Failed" }); } });

app.post('/save-result', async (req, res) => { try { const newResult = new Result(req.body); await newResult.save(); res.status(201).json({ message: "Saved!" }); } catch (error) { res.status(500).json({ error: error.message }); } });
app.post('/leaderboard', async (req, res) => { try { const leaderboard = await Result.find({ examName: req.body.examName, testName: req.body.testName }).sort({ score: -1, date: 1 }); res.status(200).json(leaderboard); } catch (error) { res.status(500).json({ error: "Failed" }); } });
app.get('/all-results', async (req, res) => { try { const results = await Result.find().sort({ date: -1 }); res.status(200).json(results); } catch (error) { res.status(500).json({ error: error.message }); } });

app.post('/add-question', async (req, res) => { try { const newQuestion = new Question(req.body); await newQuestion.save(); res.status(201).json({ message: "Added!" }); } catch (error) { res.status(500).json({ error: error.message }); } });
app.get('/all-questions', async (req, res) => { try { const questions = await Question.find().sort({ examName: 1, testName: 1 }); res.status(200).json(questions); } catch (error) { res.status(500).json({ error: error.message }); } });
app.put('/update-question/:id', async (req, res) => { try { await Question.findByIdAndUpdate(req.params.id, req.body); res.status(200).json({ message: "Updated!" }); } catch (error) { res.status(500).json({ error: error.message }); } });
app.delete('/delete-question/:id', async (req, res) => { try { await Question.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Deleted!" }); } catch (error) { res.status(500).json({ error: error.message }); } });

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });
app.get('/admin', (req, res) => { res.sendFile(path.join(__dirname, 'admin.html')); });

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => { console.log(`🚀 Server is running on port ${PORT}`); });
