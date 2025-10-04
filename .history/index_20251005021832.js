import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
    console.error("\nFATAL ERROR: GEMINI_API_KEY is not defined in your .env file.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());
app.use(express.json());

// --- SOLUSI BARU: PAKSA BROWSER UNTUK TIDAK MELAKUKAN CACHING ---
app.use(
    express.static('public', {
        etag: false,
        lastModified: false,
        setHeaders: (res, path, stat) => {
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        },
    })
);
// ----------------------------------------------------------------

app.post('/chat', async (req, res) => {
    try {
        const { history } = req.body;
        if (!history || !Array.isArray(history)) {
            return res.status(400).json({ message: 'History is required.' });
        }

        console.log(`[${new Date().toLocaleTimeString()}] Menerima riwayat: ${history.length} pesan.`);
        const userPrompt = history.pop().content;
        const geminiHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(userPrompt);
        const text = result.response.text();

        console.log(`[${new Date().toLocaleTimeString()}] Mengirim balasan.`);
        res.status(200).json({ data: text });

    } catch (error) {
        console.error('\n--- ERROR DI BACKEND ---', error);
        res.status(500).json({ message: 'Internal Server Error. Check terminal.' });
    }
});

app.post('/generate-suggestions', async (req, res) => {
    try {
        const prompt = "Generate 3 short, interesting conversation starter questions for a general AI. Return as a JSON array of strings.";
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
    console.log("Anti-Cache Mode: ON\n");
});

