
const express = require('express');
const { google } = require('googleapis');
const gmailConfig = require('./config/gmailConfig');
const gmailRouter = require('./routes/gmailRouter');
const gmailController = require('./controllers/gmailControllers');
const { writeTokens, TOKEN_PATH } = require('./tokens');  // Import writeTokens and TOKEN_PATH



const app = express();
const port = 3000;


const oAuth2Client = new google.auth.OAuth2(
  gmailConfig.clientId,
  gmailConfig.clientSecret,
  gmailConfig.redirectUri
);

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/gmail.labels', 'https://mail.google.com/'];



app.get('/login', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
//   console.log(code)
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    await writeTokens(tokens); 
    console.log('Successfully authenticated!');
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);

    //  
    //
    res.json({
      message: 'Authentication successful!',
      redirectUrl: '/gmail',
    });
  } catch (error) {
    console.error('Error during authentication:', error.message);
    res.status(500).send('Authentication failed.');
  }

  
});



app.use('/gmail', gmailRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
