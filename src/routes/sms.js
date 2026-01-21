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
    // Split comma-separated numbers and trim whitespace
    const numbers = number.split(',').map(n => n.trim()).filter(n => n);
    
    if (numbers.length === 0) {
      return res.status(400).json({ error: 'No valid phone numbers provided' });
    }

    const results = [];
    const errors = [];
    
    // Send to each number individually
    for (const num of numbers) {
      try {
        let msgId;
        
        // Route to appropriate provider based on 'provider' field
        if (provider === 'bt' || provider === 'btsms') {
          msgId = await sendSMSViaBT(num, message);
        } else {
          // Default to Tashicell
          msgId = await sendSMS(num, message);
        }
        
        results.push({ number: num, messageId: msgId, success: true });
      } catch (err) {
        errors.push({ number: num, error: err.message || err });
      }
    }
    
    res.json({ 
      success: errors.length === 0,
      total: numbers.length,
      sent: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
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
    // Split comma-separated numbers and trim whitespace
    const numbers = number.split(',').map(n => n.trim()).filter(n => n);
    
    if (numbers.length === 0) {
      return res.status(400).json({ error: 'No valid phone numbers provided' });
    }

    const results = [];
    const errors = [];
    
    // Send to each number individually
    for (const num of numbers) {
      try {
        const msgId = await sendSMSViaBT(num, message);
        results.push({ number: num, messageId: msgId, success: true });
      } catch (err) {
        errors.push({ number: num, error: err.message || err });
      }
    }
    
    res.json({ 
      success: errors.length === 0,
      total: numbers.length,
      sent: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      provider: 'BT SMS'
    });
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
    // Split comma-separated numbers and trim whitespace
    const numbers = number.split(',').map(n => n.trim()).filter(n => n);
    
    if (numbers.length === 0) {
      return res.status(400).json({ error: 'No valid phone numbers provided' });
    }

    const results = [];
    const errors = [];
    
    // Send to each number individually
    for (const num of numbers) {
      try {
        const msgId = await sendSMS(num, message);
        results.push({ number: num, messageId: msgId, success: true });
      } catch (err) {
        errors.push({ number: num, error: err.message || err });
      }
    }
    
    res.json({ 
      success: errors.length === 0,
      total: numbers.length,
      sent: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      provider: 'Tashicell'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;


