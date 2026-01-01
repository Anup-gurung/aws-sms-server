import { Router } from 'express';
import { sendSMS } from '../smpp/sender.js';

const router = Router();

router.post('/send-sms', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: 'number and message required' });
  }

  try {
    const msgId = await sendSMS(number, message);
    res.json({ success: true, messageId: msgId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD
export default router;


=======
export default router;
>>>>>>> 422ff395dc4132e12aa746d5af7be7e1be58b47f
