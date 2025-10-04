import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import { Gemini } from '@gemini-ai/gemini';
import 'dotenv/config';


//mulai persiapan 
// Inisialisasi express
const app = express();
const ai = new Gemini({});

//Inisialisasi middleware
app.use(cors());
app.use(multer());
app.use(express.json());


// Konfigurasi dotenv
dotenv.config();
