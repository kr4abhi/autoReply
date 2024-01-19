// src/services/gmailService.js
const { google } = require('googleapis');
const { getClient, listMessages, sendReply, labelAndMove } = require('../utils/gmailUtils');

const gmailConfig = require('../configs');

const oAuth2Client = new google.auth.OAuth2(
    gmailConfig.clientId,
    gmailConfig.clientSecret,
    gmailConfig.redirectUri
  );
  
  oAuth2Client.setCredentials({
    refresh_token: gmailConfig.refreshToken,
  });

const checkAndRespondToEmails = async () => {
  try {
    const auth = await getClient();
    const messages = await listMessages(auth);

    for (const message of messages) {
      // Check if the email has no prior replies
      const hasPriorReplies = /* Logic to check if there are prior replies */;

      if (!hasPriorReplies) {
        // Send a reply
        await sendReply(auth, message.id, 'Your auto-reply content');

        // Add a label and move the email
        await labelAndMove(auth, message.id, 'YourLabelName');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

module.exports = {
  checkAndRespondToEmails,
};
