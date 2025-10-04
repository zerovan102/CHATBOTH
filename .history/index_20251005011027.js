import { GoogleGenerativeAI } from "@google/genai";
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

// Inisialisasi express
const app = express();
const PORT = process.env.PORT || 3000;

// Inisialisasi Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
        if (!Array.isArray(message)) throw new Error('Message must be an array');

        // The Gemini API expects a flat array of content for history, and the last item is the new prompt
        const history = message.slice(0, -1).map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }],
        }));
        const userPrompt = message[message.length - 1].content;

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(userPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ result: text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: error.message || 'Internal Server Error'
        });
    }
});


// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});