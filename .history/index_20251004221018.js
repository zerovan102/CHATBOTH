import * as genai from "@google/genai";
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

// Inisialisasi express
const app = express();

// ▼ DIUBAH: Menambahkan .default untuk mengakses kelasnya
const genAI = new genai.default.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Inisialisasi middleware
app.use(cors());
app.use(express.json());

// Endpoint GET untuk tes
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'API is running!',
        data: null,
        success: true
    });
});

// Endpoint POST untuk chat
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({
                message: 'Message is required',
                data: null,
                success: false
            });
        }

        const result = await model.generateContent(message);
        const response = result.response;
        const text = response.text();

        res.status(200).json({
            message: 'Success',
            data: text,
            success: true
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            data: null,
            success: false
        });
    }
});

// Menjalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});