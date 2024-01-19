const { google } = require('googleapis');
const gmailConfig = require('../config/gmailConfig');
const { readTokens } = require('../tokens');

async function checkIfReplied(threadId, userId = 'me') {
    const auth = await getAuthenticatedClient();
  
    try {
      // Get the authenticated user's email address
      const userProfile = await google.gmail({ version: 'v1', auth }).users.getProfile({
        userId,
      });
  
      const authenticatedUserEmail = userProfile.data.emailAddress;
  
      // Get the list of messages in the thread
      const response = await google.gmail({ version: 'v1', auth }).users.threads.get({
        userId,
        id: threadId,
      });
  
      const messages = response.data.messages;
  
      // Check if any message in the thread is sent by the authenticated user
    //   const hasReplied = messages.some((message) =>
    //     message.from && message.from.emailAddress.address === authenticatedUserEmail
    //   );

    //   hasReplied = messages.some((message) =>
    //   message.from && message.from.emailAddress.address === authenticatedUserEmail
    //   || message.to && message.to.some(recipient => recipient.emailAddress.address === authenticatedUserEmail)
    // );

    const hasReplied = messages.some((message) =>
      message.payload.headers.some(header =>
        header.name === 'From' && header.value === authenticatedUserEmail
      )
    );
    //   console.log(authenticatedUserEmail)
      return hasReplied;
    } catch (error) {
      console.error('Error checking if replied:', error.message);
      return false;
    }
  }

async function getAuthenticatedClient() {
  const tokens = await readTokens();
  const oAuth2Client = new google.auth.OAuth2(
    gmailConfig.clientId,
    gmailConfig.clientSecret,
    gmailConfig.redirectUri
  );

  oAuth2Client.setCredentials(tokens);

  return oAuth2Client;
}


module.exports = {
    checkIfReplied
}
