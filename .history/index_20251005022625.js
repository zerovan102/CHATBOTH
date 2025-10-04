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
    console.log('Tekan CTRL+C untuk menghentikan server.\n');
});

// --- IGNORE ---
{
    const chatForm = document.getElementById('chat-form');
    atch(error) {
        console.error('Failed to fetch suggestions:', error);
        suggestionsBar.innerHTML = '';
    }
}

// --- Logika Utama Pengiriman Chat ---
async function handleChatSubmit(event) {
    event.preventDefault();
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    messageInput.disabled = true;
    sendButton.disabled = true;
    suggestionsBar.innerHTML = '';

    // Tambahkan pesan pengguna ke riwayat dan UI
    addMessageToChatbox('user', userMessage);
    chatHistory.push({ role: 'user', content: userMessage });
    messageInput.value = '';

    const thinkingMessageElement = addMessageToChatbox('bot', 'Thinking...');

    try {
        // KIRIM SELURUH RIWAYAT ke backend, sesuai yang diharapkan index.js
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: [...chatHistory] }), // Kirim salinan riwayat
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Server Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.data) {
            thinkingMessageElement.querySelector('.message-content').textContent = data.data;
            // Tambahkan balasan AI ke riwayat
            chatHistory.push({ role: 'model', content: data.data });
        } else {
            throw new Error('Response from server was empty.');
        }
    } catch (error) {
        console.error('Frontend Error:', error);
        thinkingMessageElement.querySelector('.message-content').textContent = `Error: ${error.message}`;
    } finally {
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
        // Hanya tampilkan saran di awal percakapan agar tidak mengganggu
        if (chatHistory.length < 5) {
            fetchAndDisplaySuggestions();
        }
    }
}

chatForm.addEventListener('submit', handleChatSubmit);

// Ambil saran saat halaman pertama kali dimuat
fetchAndDisplaySuggestions();
