const { google } = require('googleapis');
const gmailConfig = require('../config/gmailConfig');
const { readTokens, writeTokens, TOKEN_PATH } = require('../tokens');
// const {checkIfReplied} = require('../utils/ifReplied');
const { cloudchannel } = require('googleapis/build/src/apis/cloudchannel');

// const repliedUsers = new Set();

async function checkAndRespondToEmails(gmail) {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
    });

    const messages = response.data.messages || [];

    if (messages.length === 0) {
      console.log('No new emails.');
      return;
    }

    for (const message of messages) {
      try {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        });

        const from = email.data.payload.headers.find(
            (header) => header.name === "From"
        );
          const toHeader = email.data.payload.headers.find(
            (header) => header.name === "To"
        );
          const Subject = email.data.payload.headers.find(
            (header) => header.name === "Subject"
        );
             
        const From = from.value;
        const toEmail = toHeader.value;
        const subject = Subject.value;

        console.log("Email From:", From);
        console.log("To Email:", toEmail);
        console.log("Subject: ", subject);

        

        const thread = await gmail.users.threads.get({
            userId: "me",
            id: message.threadId,
        });

        console.log("thread found correctly", thread.data.id);
        console.log(thread);

        const replies = thread.data.messages;

        const messageIds = replies.map((message)=>message.id);
        console.log('Message IDs in the thread:', messageIds);


// Check if any message in the thread was sent by the user
        const userSentMessage = replies.some((message) => {
        // Assuming the user's email address is stored in a variable called 'userEmailAddress'
        return message.payload.headers.some((header) => {
            return header.name === 'From' && header.value === toEmail;
        });
        });

        if (!userSentMessage) {
            // If no message in the thread was sent by the user, proceed to reply
            const replyRaw = await createReplyRaw(toEmail, From, subject, message.threadId, messageIds);

            const sentReply = await gmail.users.messages.send({
              userId: 'me',
              requestBody: {
                raw: replyRaw,
                threadId: message.threadId
              },
            });
          
            const labelName = "onVacation";

            await gmail.users.messages.modify({
                userId: 'me',
                id: sentReply.data.id,
                requestBody: {
                  addLabelIds: [await createLabelIfNeeded(labelName, gmail)],
                },
              });

            await gmail.users.messages.modify({
              userId: 'me',
              id: message.threadId,
              requestBody: {
                addLabelIds: [await createLabelIfNeeded(labelName, gmail)],
              },
            });
          
            console.log("Sent reply to email:", From);
          } else {
            console.log("User has already sent a message in this thread.");
            continue;
          }

        // const threadId = thread.data.id

        // if (repliedUsers.has(thread)) {
        //     console.log("Already replied to : ", From);
        //     continue;
        //   }

        ///   making changes to reply logic

        // const replies = thread.data.messages.slice(1);
        // console.log("REPLY:  ", replies);

        // if(replies.length === 0){
        //     const replyRaw = await createReplyRaw(toEmail, From, subject);
        //     const sentReply = await gmail.users.messages.send({
        //         userId: 'me',
        //         requestBody: {
        //           raw: replyRaw,
        //         },
        //       });

    

        //     const labelName = "onVacation";
        //     await gmail.users.messages.modify({
        //         userId: 'me',
        //         id: sentReply.data.id, // Use the ID of the sent reply, not the original message
        //         requestBody: {
        //           addLabelIds: [await createLabelIfNeeded(labelName, gmail)],
        //         },
        //       });
         

        //       console.log("Sent reply to email:", From);
        //   //Add the user to replied users set
              
        // }

        

         ///   making changes to reply logic

        // repliedUsers.add(thread);
        // to comment 

        // // console.log('New Email from:', senderEmail);

//comm
      } catch (error) {
        console.error('Error fetching email details:', error.message);
      }
    }

    console.log('Email checking completed.');
  } catch (error) {
    console.error('Error checking emails:', error.message);
  }
}

async function createReplyRaw(from, to, subject, threadId, messageIds) {
    const referencesHeader = messageIds.map((id) => `<${id}>`).join(' ');
    const emailContent = `From: ${from}\nTo: ${to}\nSubject: Re: ${subject}\nIn-Reply-To: <${threadId}>\nReferences: ${referencesHeader}\n\nThank you for your message. I am unavailable right now, but will respond as soon as possible...`;
    const base64EncodedEmail = Buffer.from(emailContent)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    return base64EncodedEmail;
  }
  

async function createLabelIfNeeded(labelName, gmail) {
    // const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
    // Check if the label already exists.
    
    try {
        const res = await gmail.users.labels.list({ userId: "me" });
        const labels = res.data.labels;
        const existingLabel = labels.find((label) => label.name === labelName);

        if (existingLabel) {
            return existingLabel.id;
          }
          
        const newLabel = await gmail.users.labels.create({
            userId: "me",
            requestBody: {
              name: labelName,
              labelListVisibility: "labelShow",
              messageListVisibility: "show",
            },
          });
        // console.log(newLabel.data.id)
        console.log("creting bl")
          return newLabel.data.id;
    
    } catch (error) {
        console.log("err creating label", error)
    }
    
  
    

    
    }
    


module.exports = {
  checkAndRespondToEmails,
};



