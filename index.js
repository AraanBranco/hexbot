require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const Commander = require('./commander')
const { DISCORD_TOKEN, FIREBASE_PROJECT_ID, FIREBASE_API_KEY, FIREBASE_MESSAGE_ID } = process.env
const firebase = require('firebase');

var config = {
  apiKey: FIREBASE_API_KEY,
  authDomain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: `https://${FIREBASE_PROJECT_ID}.firebaseio.com`,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: `${FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: FIREBASE_MESSAGE_ID
};

firebase.initializeApp(config)

client.on('ready', () => console.log('Bot is ready'))

new Commander(client, firebase);

client.login(DISCORD_TOKEN)