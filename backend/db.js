// db.js — This file does two things:
// 1. Connects to MongoDB
// 2. Defines what a chat message looks like in the database

const mongoose = require("mongoose");

/*
  CONNECT TO MONGODB
  
  mongoose.connect() opens a connection to your MongoDB database
  process.env.MONGO_URI reads the link from your .env file
  
  Think of this like opening a door to your database
*/

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully!');
  })
  .catch((error) => {
    console.log('MongoDB connection failed:', error.message);
  });

  // Schema

const chatSchema = new mongoose.Schema({
    merchantId: {
        type: String,
        default:'guest'
    },
    userMessage: {
        type: String,
        required: true
    },
    botReply: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/*
  CREATE A MODEL
  
  A model is like a class that lets you
  save, find, and delete data in MongoDB.
  
  'Chat' will become a collection called 'chats' in MongoDB
  Think of it like a table in SQL — but for MongoDB
*/

const Chat = mongoose.model("chat",chatSchema);



/*
  EXPORT THE MODEL
  
  We export Chat so server.js can use it
  to save and read messages
*/
module.exports = Chat;


