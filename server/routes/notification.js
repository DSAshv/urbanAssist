const express = require('express');
const { sendPushNotification } = require('../utils/firebaseAdmin');

const router = express.Router();

router.post('/send-notification', async (req, res) => {
  const { token, title, body } = req.body;

  try {
    await sendPushNotification(token, title, body);
    res.status(200).send({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to send notification' });
  }
});

module.exports = router;
