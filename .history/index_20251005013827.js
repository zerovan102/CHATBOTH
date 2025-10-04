import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Pastikan API Key Anda ada
if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in .env file.");
    process.exit(1); // Hentikan aplikasi jika key tidak ada
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());
app.use(express.json());

// Sajikan file dari folder 'public'
app.use(express.static('public'));

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        console.log("Menerima pesan:", message); // LOGGING: Cek apakah pesan masuk

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const result = await model.generateContent(message);
        const response = result.response;
        const text = response.text();

        console.log("Mengirim balasan:", text); // LOGGING: Cek balasan dari AI

        res.status(200).json({
            // Frontend akan membaca properti 'data' ini
            data: text
        });

    } catch (error) {
        console.error('Error processing chat:', error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

