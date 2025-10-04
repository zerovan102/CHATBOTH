import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Validasi API Key saat server dimulai
if (!process.env.GEMINI_API_KEY) {
    console.error("\nFATAL ERROR: GEMINI_API_KEY is not defined in your .env file.");
    console.error("Please create a .env file and add GEMINI_API_KEY=YOUR_API_KEY\n");
    process.exit(1); // Hentikan aplikasi jika key tidak ada
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

/**
 * Endpoint utama untuk chat.
 * Sekarang menerima seluruh riwayat percakapan.
 */
app.post('/chat', async (req, res) => {
    try {
        const { history } = req.body; // Mengharapkan 'history' bukan 'message'

        if (!history || !Array.isArray(history)) {
            return res.status(400).json({ message: 'History is required and must be an array.' });
        }

        console.log(`[${new Date().toLocaleTimeString()}] Menerima riwayat dengan ${history.length} pesan.`);

        // Memisahkan riwayat lama dengan prompt baru dari pengguna
        const userPrompt = history.pop().content;

        // Format riwayat untuk Gemini API
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
        console.error('\n--- ERROR DI ENDPOINT /chat ---');
        console.error(error);
        console.error('--------------------------------\n');
        res.status(500).json({ message: 'Internal Server Error. Check terminal for details.' });
    }
});

/**
 * ✨ FITUR BARU: Endpoint untuk menghasilkan saran pertanyaan secara dinamis.
 */
app.post('/generate-suggestions', async (req, res) => {
    try {
        console.log(`[${new Date().toLocaleTimeString()}] Menghasilkan saran pertanyaan...`);
        const prompt = "Generate 3 short and interesting conversation starter questions for a general AI assistant. Return the response as a JSON array of strings. For example: [\"What is recursion?\", \"Tell me a joke\", \"Explain black holes\"]";

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Membersihkan dan mem-parsing output dari model menjadi JSON
        const suggestions = JSON.parse(text.replace(/```json\n|\n```/g, ''));

        console.log(`[${new Date().toLocaleTimeString()}] Saran dihasilkan:`, suggestions);
        res.status(200).json({ suggestions });

    } catch (error) {
        console.error('\n--- ERROR DI ENDPOINT /generate-suggestions ---');
        console.error(error);
        console.error('--------------------------------------------\n');
        res.status(500).json({ message: 'Failed to generate suggestions.' });
    }
});


app.listen(PORT, () => {
    console.log(`\nServer berjalan di http://localhost:${PORT}`);
    console.log("Buka browser dan kunjungi alamat di atas.");
    console.log("Pastikan file .env sudah berisi GEMINI_API_KEY yang valid.\n");
});

