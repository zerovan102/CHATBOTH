import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
    console.error("\nFATAL ERROR: GEMINI_API_KEY is not defined or is empty in your .env file.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/chat', async (req, res) => {
    try {
        const { history } = req.body;

        if (!history || !Array.isArray(history)) {
            return res.status(400).json({ message: 'History is required and must be an array.' });
        }

        console.log(`[${new Date().toLocaleTimeString()}] Menerima riwayat dengan ${history.length} pesan.`);

        const userPrompt = history.pop().content;

        const geminiHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(userPrompt);
        const response = result.response;
        const text = response.text();

        console.log(`[${new Date().toLocaleTimeString()}] Mengirim balasan: "${text.substring(0, 50)}..."`);

        res.status(200).json({ data: text });

    } catch (error) {
        console.error('\n--- ERROR DI BACKEND ---');
        console.error(error);
        console.error('----------------------\n');
        res.status(500).json({ message: 'Internal Server Error. Check terminal for details.' });
    }
});

app.post('/generate-suggestions', async (req, res) => {
    try {
        const prompt = "Generate 3 short, interesting conversation starter questions for a general AI assistant. Return as a JSON array of strings.";
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const suggestions = JSON.parse(text.replace(/```json\n|\n```/g, ''));
        res.status(200).json({ suggestions });
    } catch (error) {
        console.error('\n--- ERROR DI SUGGESTIONS ---', error);
        res.status(500).json({ message: 'Failed to generate suggestions.' });
    }
});

app.listen(PORT, () => {
    console.log(`\nServer berjalan di http://localhost:${PORT}`);
    console.log("Pastikan file .env berisi GEMINI_API_KEY yang valid.\n");
});