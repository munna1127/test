const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Question = require('./models/Question');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Database connected successfully!'))
    .catch((err) => console.log('❌ Error:', err.message));

app.post('/add-question', async (req, res) => {
    try {
        const newQuestion = new Question(req.body);
        await newQuestion.save();
        res.status(201).json({ message: "Ekdum Mast! Question add ho gaya!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Nayi API: Saare unique Exams fetch karne ke liye
app.get('/get-exams', async (req, res) => {
    try {
        const exams = await Question.distinct('examName');
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ error: "Exams nahi mile" });
    }
});

// Nayi API: Kisi ek Exam ke saare Tests fetch karne ke liye
app.get('/get-tests/:examName', async (req, res) => {
    try {
        const tests = await Question.distinct('testName', { examName: req.params.examName });
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ error: "Tests nahi mile" });
    }
});

// Nayi API: Exam aur Test ke hisaab se questions bhejna
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
