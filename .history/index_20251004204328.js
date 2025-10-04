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
    const { message } = req.body;
    const { prompt } = req.body;
    console.log(message);
    console.log(prompt);

    //guard clause
    if (!message) {
        return res.status(400).json({
            error: 'Message is required
' });
    try {

                // Konfigurasi dotenv
                dotenv.config();
