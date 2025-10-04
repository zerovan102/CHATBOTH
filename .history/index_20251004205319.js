import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import { Gemini } from '@gemini-ai/gemini';
import 'dotenv/config';


//mulai persiapan 
// Inisialisasi express
const app = express();
const ai = new Gemini({});

//Inisialisasi middleware
app.use(cors());
app.use(multer());
app.use(express.json());

//Inisialisasi endpoint
//[HTTP method : GET, POST, PUT, PATCH, DELETE]
// GET
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// POST
app.post('/chat', async (req, res) => {
    const { body } = req.body;
    const { prompt } = req.body;
    const message = body || prompt;
    console.log(prompt);

    //guard clause
    if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({
            message: 'Prompt is required!',
            data: null,
            success: false
        });
        return;
    }

    //pokok
    try {
        const aiResponse = await ai.chat.models.generateContent({
            model: 'gemini-2.5-flash',
            contents
