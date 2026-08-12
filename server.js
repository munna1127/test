const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Question = require('./models/Question');
const User = require('./models/User'); // Naya User Model import kiya
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Database connected successfully!'))
    .catch((err) => console.log('❌ Error:', err.message));

// --- STUDENT LOGIN & SIGNUP APIs ---
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Ye email pehle se registered hai!" });
        
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: "Account ban gaya! Ab login karo." });
    } catch (error) {
        res.status(500).json({ error: "Server error!" });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(400).json({ error: "Email ya Password galat hai!" });
        
        res.status(200).json({ message: "Login Successful", name: user.name, email: user.email });
    } catch (error) {
        res.status(500).json({ error: "Server error!" });
    }
});

// --- PURANI TEST APIs ---
app.post('/add-question', async (req, res) => {
    try {
        const newQuestion = new Question(req.body);
        await newQuestion.save();
        res.status(201).json({ message: "Ekdum Mast! Question add ho gaya!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/get-exams', async (req, res) => {
    try {
        const exams = await Question.distinct('examName');
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ error: "Exams nahi mile" });
    }
});

app.get('/get-tests/:examName', async (req, res) => {
    try {
        const tests = await Question.distinct('testName', { examName: req.params.examName });
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ error: "Tests nahi mile" });
    }
});

app.post('/get-test-questions', async (req, res) => {
    try {
        const { examName, testName } = req.body;
        const questions = await Question.find({ examName, testName });
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: "Questions fetch karne mein dikkat aayi" });
    }
});

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });
app.get('/admin', (req, res) => { res.sendFile(path.join(__dirname, 'admin.html')); });

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => { console.log(`🚀 Server is running on port ${PORT}`); });
