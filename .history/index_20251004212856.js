import { Gemini } from '@gemini-ai/gemini';
import { GoogleGenerativeAI } from '@google/genai';
import cors from 'cors';
import 'dotenv/config';
import multer from 'multer';
import express from 'express';
const express = require('express');
const bodyParser = require('body-parser');


//mulai persiapan 
// Inisialisasi express
const app = express();
const ai = new Gemini({});

// Initialize the Google AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
app.post('/chat', //https://localhost:3000/chat
    async (req, res) => {
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
                contents: [
                    {
                        ports: [
                            { text: prompt }
                        ]
                    }
                ]
            });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();


            res.status(200).json({
                success: 'true',
                data: aiResponse[0].text,
                success: true,
                data: text,
                message: 'perintah berhasil dijalankan',
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: 'false',
                success: false,
                data: null,
                message: 'perintah gagal dijalankan',
            });
        }

    });


//entry point
const PORT = process.env.PORT || 3000;
// Jalankan server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


