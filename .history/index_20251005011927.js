// 1. Menggunakan NAMA PAKET YANG BENAR
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

const app = express();

// 2. Deklarasi PORT HANYA SATU KALI
const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Anda bisa menggunakan gemini-1.5-flash atau model lain yang tersedia
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());
app.use(express.json());

// Ini akan menyajikan file HTML, CSS, dan JS dari folder 'public'
app.use(express.static('public'));

// 3. LOGIKA YANG SESUAI DENGAN FRONTEND
// Endpoint ini menerima satu 'message' string, bukan array.
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

        // Mengirim kembali respons dalam format { data: '...' } yang diharapkan frontend
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

