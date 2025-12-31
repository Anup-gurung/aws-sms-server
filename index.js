import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

// --- ADDED TEST ROUTE ---
// This sits BEFORE the API key middleware if you want it publicly accessible, 
// or AFTER if you want to test your API key logic.
app.get("/hello", (req, res) => {
  res.json({ 
    message: "Hello! The SMS server is up and running.",
    timestamp: new Date().toISOString()
  });
});

// Simple API key protection
app.use((req, res, next) => {
  const key = req.headers["x-api-key"];
  if (key !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

app.post("/send-sms", async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: "Missing phone or message" });
  }

  try {
    const response = await axios.post(process.env.BT_SMS_URL, {
      username: process.env.BT_USERNAME,
      password: process.env.BT_PASSWORD,
      from: process.env.BT_SENDER_ID,
      to: phone,
      text: message
    });

    res.json({ success: true, response: response.data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SMS server running on port ${PORT}`);
});