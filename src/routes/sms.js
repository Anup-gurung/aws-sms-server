import { Router } from 'express';
import { sendSMS, sendSMSViaBT } from '../smpp/sender.js';

const router = Router();

// Original endpoint - uses Tashicell by default
router.post('/send-sms', async (req, res) => {
  const { number, message, provider } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: 'number and message required' });
  }

  try {
    let msgId;
    
    // Route to appropriate provider based on 'provider' field
    if (provider === 'bt' || provider === 'btsms') {
      msgId = await sendSMSViaBT(number, message);
    } else {
      // Default to Tashicell
      msgId = await sendSMS(number, message);
    }
    
    res.json({ 
      success: true, 
      messageId: msgId,
      provider: provider === 'bt' || provider === 'btsms' ? 'BT SMS' : 'Tashicell'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Specific endpoint for BT SMS
router.post('/send-sms/bt', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: 'number and message required' });
  }

  try {
    const msgId = await sendSMSViaBT(number, message);
    res.json({ success: true, messageId: msgId, provider: 'BT SMS' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Specific endpoint for Tashicell
router.post('/send-sms/tashicell', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: 'number and message required' });
  }

  try {
    const msgId = await sendSMS(number, message);
    res.json({ success: true, messageId: msgId, provider: 'Tashicell' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;


