// Load secret keys from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const Chat = require('./db');   

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Connect to Groq AI using your secret key
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});
// Route 1 - Home
app.get('/', (req, res) => {
  res.json({ message: 'Merchant AI chatbot is running!' });
});

// Route 2 - Chat with AI
app.post('/api/chat', async(req, res) =>{
    try{
     /*
      Read the message and merchantId from request
      If no merchantId is sent, use 'guest' as default
    */
    const userMessage = req.body.message;
     const merchantId = req.body.merchantId || 'guest';
    // This is the AI's personality and job description

    const systemPrompt = `You are a helpful technical support 
agent for merchants. You help with:
- Payment API errors and error codes
- Onboarding issues
- Integration problems
- Transaction failures
Be friendly, clear and give practical solutions.
Keep answers short and easy to understand.`;

// Send message to Groq AI and get reply
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    });
 // Extract the AI reply
    const answer = response.choices[0].message.content;

     /*
      SAVE TO MONGODB
      
      Chat.create() saves a new document to the database
      We save the merchantId, their question, and the AI reply
      
      This is like doing INSERT INTO in SQL
      but for MongoDB it is Chat.create()
    */
   await Chat.create({
    merchantId: merchantId,
    userMessage: userMessage,
    botReply: answer,
   });
    console.log('Chat saved to MongoDB!');

     // Send back to user/frontend
    res.json({ answer });

    }
 catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: 'Something went wrong. Check your API key.' 
    });
  }
});
/*
  Route 3 — Get chat history
  
  This is a new route that returns all saved chats
  You can open this in browser or Postman to see all conversations
  
  Chat.find() is like SELECT * FROM chats in SQL
  .sort({ createdAt: -1 }) shows newest first
  .limit(20) shows only last 20 chats
*/
app.get('/api/history', async(req, res) =>{
    try{
        const chats = await Chat.find()
        .sort({ createdAt: -1 })
        .limit(20);
       res.json(chats);
    } catch(error) {
        res.status(500).json({error: error.message});
    }
});


// Start server
app.listen(process.env.PORT || port, ()=> {
    console.log(`Server is running at ${port}`);
});








