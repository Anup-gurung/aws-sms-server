// import { Router } from 'express';
// import { sendSMS, sendSMSViaBT } from '../smpp/sender.js';

// const router = Router();

// // Original endpoint - uses Tashicell by default
// router.post('/send-sms', async (req, res) => {
//   const { number, message, provider } = req.body;

//   if (!number || !message) {
//     return res.status(400).json({ error: 'number and message required' });
//   }

//   try {
//     // Split comma-separated numbers and trim whitespace
//     const numbers = number.split(',').map(n => n.trim()).filter(n => n);
    
//     if (numbers.length === 0) {
//       return res.status(400).json({ error: 'No valid phone numbers provided' });
//     }

//     const results = [];
//     const errors = [];
    
//     // Send to each number individually
//     for (const num of numbers) {
//       try {
//         let msgId;
        
//         // Route to appropriate provider based on 'provider' field
//         if (provider === 'bt' || provider === 'btsms') {
//           msgId = await sendSMSViaBT(num, message);
//         } else {
//           // Default to Tashicell
//           msgId = await sendSMS(num, message);
//         }
        
//         results.push({ number: num, messageId: msgId, success: true });
//       } catch (err) {
//         errors.push({ number: num, error: err.message || err });
//       }
//     }
    
//     res.json({ 
//       success: errors.length === 0,
//       total: numbers.length,
//       sent: results.length,
//       failed: errors.length,
//       results,
//       errors: errors.length > 0 ? errors : undefined,
//       provider: provider === 'bt' || provider === 'btsms' ? 'BT SMS' : 'Tashicell'
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Specific endpoint for BT SMS
// router.post('/send-sms/bt', async (req, res) => {
//   const { number, message } = req.body;

//   if (!number || !message) {
//     return res.status(400).json({ error: 'number and message required' });
//   }

//   try {
//     // Split comma-separated numbers and trim whitespace
//     const numbers = number.split(',').map(n => n.trim()).filter(n => n);
    
//     if (numbers.length === 0) {
//       return res.status(400).json({ error: 'No valid phone numbers provided' });
//     }

//     const results = [];
//     const errors = [];
    
//     // Send to each number individually
//     for (const num of numbers) {
//       try {
//         const msgId = await sendSMSViaBT(num, message);
//         results.push({ number: num, messageId: msgId, success: true });
//       } catch (err) {
//         errors.push({ number: num, error: err.message || err });
//       }
//     }
    
//     res.json({ 
//       success: errors.length === 0,
//       total: numbers.length,
//       sent: results.length,
//       failed: errors.length,
//       results,
//       errors: errors.length > 0 ? errors : undefined,
//       provider: 'BT SMS'
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Specific endpoint for Tashicell
// router.post('/send-sms/tashicell', async (req, res) => {
//   const { number, message } = req.body;

//   if (!number || !message) {
//     return res.status(400).json({ error: 'number and message required' });
//   }

//   try {
//     // Split comma-separated numbers and trim whitespace
//     const numbers = number.split(',').map(n => n.trim()).filter(n => n);
    
//     if (numbers.length === 0) {
//       return res.status(400).json({ error: 'No valid phone numbers provided' });
//     }

//     const results = [];
//     const errors = [];
    
//     // Send to each number individually
//     for (const num of numbers) {
//       try {
//         const msgId = await sendSMS(num, message);
//         results.push({ number: num, messageId: msgId, success: true });
//       } catch (err) {
//         errors.push({ number: num, error: err.message || err });
//       }
//     }
    
//     res.json({ 
//       success: errors.length === 0,
//       total: numbers.length,
//       sent: results.length,
//       failed: errors.length,
//       results,
//       errors: errors.length > 0 ? errors : undefined,
//       provider: 'Tashicell'
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;

import { Router } from "express";
import { sendSMS, sendSMSViaBT } from "../smpp/sender.js";

const router = Router();

/**
 * Promise timeout wrapper so API never hangs
 */
function withTimeout(promise, ms, label = "Operation") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Parse numbers from string:
 * - accepts comma-separated
 * - trims spaces
 * - removes empty
 */
function parseNumbers(number) {
  return String(number || "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
}

/**
 * Simple concurrency limiter (no extra packages)
 */
async function runWithConcurrency(items, limit, worker) {
  const results = [];
  let idx = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const currentIndex = idx++;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(runners);
  return results;
}

// Original endpoint - uses Tashicell by default
router.post("/send-sms", async (req, res) => {
  const { number, message, provider } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: "number and message required" });
  }

  const numbers = parseNumbers(number);
  if (numbers.length === 0) {
    return res.status(400).json({ error: "No valid phone numbers provided" });
  }

  // Tune these
  const SEND_TIMEOUT_MS = 15000; // 15s per number
  const CONCURRENCY = 3;         // send 3 at a time (prevents overload)

  try {
    const useBT = provider === "bt" || provider === "btsms";

    const perNumber = await runWithConcurrency(numbers, CONCURRENCY, async (num) => {
      try {
        const sendFn = useBT ? sendSMSViaBT : sendSMS;
        const msgId = await withTimeout(
          sendFn(num, message),
          SEND_TIMEOUT_MS,
          `SMPP send to ${num}`
        );

        return { number: num, messageId: msgId, success: true };
      } catch (err) {
        return { number: num, success: false, error: err?.message || String(err) };
      }
    });

    const results = perNumber.filter((r) => r.success);
    const errors = perNumber.filter((r) => !r.success).map(({ number, error }) => ({ number, error }));

    return res.status(errors.length ? 207 : 200).json({
      success: errors.length === 0,
      total: numbers.length,
      sent: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      provider: useBT ? "BT SMS" : "Tashicell",
    });
  } catch (err) {
    console.error("send-sms ERROR:", err);
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
});

// Specific endpoint for BT SMS
router.post("/send-sms/bt", async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: "number and message required" });
  }

  const numbers = parseNumbers(number);
  if (numbers.length === 0) {
    return res.status(400).json({ error: "No valid phone numbers provided" });
  }

  const SEND_TIMEOUT_MS = 15000;
  const CONCURRENCY = 3;

  try {
    const perNumber = await runWithConcurrency(numbers, CONCURRENCY, async (num) => {
      try {
        const msgId = await withTimeout(
          sendSMSViaBT(num, message),
          SEND_TIMEOUT_MS,
          `BT SMPP send to ${num}`
        );
        return { number: num, messageId: msgId, success: true };
      } catch (err) {
        return { number: num, success: false, error: err?.message || String(err) };
      }
    });

    const results = perNumber.filter((r) => r.success);
    const errors = perNumber.filter((r) => !r.success).map(({ number, error }) => ({ number, error }));

    return res.status(errors.length ? 207 : 200).json({
      success: errors.length === 0,
      total: numbers.length,
      sent: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      provider: "BT SMS",
    });
  } catch (err) {
    console.error("send-sms/bt ERROR:", err);
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
});

// Specific endpoint for Tashicell
router.post("/send-sms/tashicell", async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: "number and message required" });
  }

  const numbers = parseNumbers(number);
  if (numbers.length === 0) {
    return res.status(400).json({ error: "No valid phone numbers provided" });
  }

  const SEND_TIMEOUT_MS = 15000;
  const CONCURRENCY = 3;

  try {
    const perNumber = await runWithConcurrency(numbers, CONCURRENCY, async (num) => {
      try {
        const msgId = await withTimeout(
          sendSMS(num, message),
          SEND_TIMEOUT_MS,
          `Tashicell SMPP send to ${num}`
        );
        return { number: num, messageId: msgId, success: true };
      } catch (err) {
        return { number: num, success: false, error: err?.message || String(err) };
      }
    });

    const results = perNumber.filter((r) => r.success);
    const errors = perNumber.filter((r) => !r.success).map(({ number, error }) => ({ number, error }));

    return res.status(errors.length ? 207 : 200).json({
      success: errors.length === 0,
      total: numbers.length,
      sent: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      provider: "Tashicell",
    });
  } catch (err) {
    console.error("send-sms/tashicell ERROR:", err);
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
});

export default router;

