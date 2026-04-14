const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Chat API endpoint - menggunakan Groq API (Dinamis)
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history, model, temperature } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key belum dikonfigurasi.' });
        }

        // Build messages array (OpenAI-compatible format)
        const messages = [
            {
                role: 'system',
                content: 'Kamu adalah asisten AI yang cerdas dan membantu. Jawab dengan bahasa yang sama dengan yang digunakan pengguna.'
            }
        ];

        if (history && Array.isArray(history)) {
            history.forEach(msg => {
                messages.push({
                    role: msg.role === 'model' ? 'assistant' : 'user',
                    content: msg.text
                });
            });
        }

        messages.push({ role: 'user', content: message });

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: model || 'llama-3.3-70b-versatile',
                messages,
                temperature: temperature !== undefined ? temperature : 0.7,
                max_tokens: 2048,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        const reply = response.data.choices?.[0]?.message?.content || 'Maaf, tidak ada respons dari AI.';
        res.json({ reply });

    } catch (error) {
        console.error('Server error:', error.response?.data || error.message);
        const errMsg = error.response?.data?.error?.message || error.message;
        res.status(500).json({ error: 'Terjadi kesalahan pada server.', message: errMsg });
    }
});

// Catch-all to serve index.html for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Only start server locally (not on Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n🚀 CHATBOTH Server berjalan di: http://localhost:${PORT}`);
        console.log(`🦙 Model: Llama 3.3 70B (via Groq)`);
        console.log(`✅ Tekan Ctrl+C untuk berhenti\n`);
    });
}

// Export for Vercel serverless
module.exports = app;
