const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Initialize environment variables
dotenv.config();

// Initialize Firebase Admin with credentials from .env
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

// Function to send push notification
async function sendPushNotification(token, title, body) {
  try {
    const message = {
      token: token,
      notification: {
        title: title,
        body: body,
      },
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

module.exports = { sendPushNotification };
