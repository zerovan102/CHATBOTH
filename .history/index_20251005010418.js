import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

// Inisialisasi express
const app = express();

// Inisialisasi Google AI client (tidak ada perubahan di sini)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Inisialisasi middleware
app.use(cors());
app.use(express.json());

//extractedText
function extractedText(response) {
    try {
        const text =
            resp?.response?.candidates?.[0]?.contents?.parts?.[0]?.text ??
            resp?.candidates?.content?.parts?.[0]?.text ??
            resp?.response?.candidates?.[0]?.content?.text ??
            resp?.response?.candidates?.[0]?.text ??
            resp?.response?.text() ??
            "No text found";
        return text ?? JSON.stringify(resp, null, 2);
    } catch (error) {
        console.error("Error extracting text:", error);
        return JSON.stringify(resp, null, 2);
    }
}

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
        const contents = message.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));
        const resp = await model.generateContent({
            model: "gemini-2.5-flash",
            prompt: {
                contents: contents
            },
            temperature: 0.2,
            candidateCount: 1,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
            stopSequences: []
        });
        res.json({ result: extractedText(resp) });
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