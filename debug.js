require('dotenv').config();
console.log('API KEY:', process.env.GEMINI_API_KEY ? 'FOUND: ' + process.env.GEMINI_API_KEY.substring(0, 15) + '...' : 'NOT FOUND');
