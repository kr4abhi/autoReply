// routes/gmailRoutes.js
const express = require('express');
const { google } = require('googleapis');
const gmailConfig = require('../config/gmailConfig');
const { readTokens, writeTokens, TOKEN_PATH } = require('../tokens');
const gmailController = require("../controllers/gmailControllers");

const router = express.Router();

router.get('/check-emails', async (req, res) => {

try {
  // Load saved tokens
  const savedTokens = await readTokens();

  if (!savedTokens || !savedTokens.refresh_token) {
    return res.status(500).send('Refresh token not found. Please authenticate.');
  }

  const oAuth2Client = new google.auth.OAuth2(
    gmailConfig.clientId,
    gmailConfig.clientSecret,
    gmailConfig.redirectUri
  );

  // Set the credentials using the saved refresh token
  oAuth2Client.setCredentials({
    refresh_token: savedTokens.refresh_token,
  });

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  await gmailController.checkAndRespondToEmails(gmail, oAuth2Client);

   // Save the updated tokens after refreshing
   await writeTokens(oAuth2Client.credentials);


  res.send('Email checking completed.');

}
 catch (error) {
    console.error('Error checking emails:', error.message);
    res.status(500).send('Error checking emails.');
  }

//   try {
//     // List messages in the user's inbox
//     const response = await gmail.users.messages.list({
//       userId: 'me',
//       labelIds: ['INBOX'],
//     });

//     const messages = response.data.messages || [];
    
//     if (messages.length === 0) {
//       return res.send('No new emails.');
//     }

//     // Process each message, check for prior replies, and send auto-replies as needed
//     for (const message of messages) {
//       // Implement logic to check for prior replies and send auto-replies
//       // This is where you'll implement steps 2, 3, and 4
//       // ...

//       // For now, let's just log the message ID
//       console.log('New Email ID:', message.id);

//       const messageDetails = await gmail.users.messages.get({
//         userId: 'me',
//         id: message.id,
//       });
  
//       const senderEmail = messageDetails.data.payload.headers.find(header => header.name === 'From').value;
    
//     // Now you have the sender's email address (senderEmail)
//     console.log('New Email from:', senderEmail);
//     }

//     res.send('Email checking completed.');
//   } catch (error) {
//     console.error('Error checking emails:', error.message);
//     res.status(500).send('Error checking emails.');
//   }
});

module.exports = router;
