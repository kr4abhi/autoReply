// routes/gmailRoutes.js
const express = require('express');
const { google } = require('googleapis');
const gmailConfig = require('../config/gmailConfig');
const { readTokens, writeTokens, TOKEN_PATH } = require('../tokens');
const gmailController = require("../controllers/gmailControllers");

const router = express.Router();
let isInitialCheckDone = false;


router.get('/', async (req, res) => {

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

  if (!isInitialCheckDone) {
    await gmailController.checkAndRespondToEmails(gmail, oAuth2Client);
    isInitialCheckDone = true;
  }

  // Set up a recurring interval for email checking with a random delay
  const randomInterval = () => Math.floor(Math.random() * (120000 - 45000 + 1) + 45000); // Random between 45s and 120s

  setInterval(async () => {
    await gmailController.checkAndRespondToEmails(gmail, oAuth2Client);
  }, randomInterval());

   await writeTokens(oAuth2Client.credentials);


  res.send('Email checking completed.');

}
 catch (error) {
    console.error('Error checking emails:', error.message);
    res.status(500).send('Error checking emails.');
  }
});

module.exports = router;
