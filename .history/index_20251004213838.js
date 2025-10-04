import { GoogleGenerativeAI } from '@google/genai';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

//mulai persiapan 
// Inisialisasi express
const app = express();

// Initialize the Google AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//Inisialisasi middleware
app.use(cors());
app.use(express.json());

//Inisialisasi endpoint
//[HTTP method : GET, POST, PUT, PATCH, DELETE]
// GET
app.get('/', //https://localhost:3000/
    (req, res) => {
        res.status(200).json({
            message: 'Hello World!',
            data: null,
            success: true
        });
    }
);

// POST
app.post('/chat', //https://localhost:3000/chat
    async (req, res) => {
        try {
            const { message } = req.body;
            if (!message) {
                return res.status(400).json({
                    message: 'Message is required',
                    data: null,
                    success: false
                });
            }
            const response = await model.generateText({
                prompt: message,
                maxOutputTokens: 1024,
            });
            res.status(200).json({
                message: 'Success',
                data: response.text,
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
    }
);
//PUT
//PATCH
//DELETE

//Menjalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//selesai persiapan
//npm install express cors dotenv @google/genai
//node index.js
//npm install --save-dev jest
//npx jest
//npm test
//npm install multer
//npx jest --init
//npm test
//npm install --save-dev supertest
//npm test
//npm install --save-dev nodemon
//npx nodemon index.js
//npm start
//npm install --save-dev cross-env
//"start": "cross-env NODE_ENV=production nodemon index.js",
//"dev": "cross-env NODE_ENV=development nodemon index.js",
//npm run dev
//npm run start






