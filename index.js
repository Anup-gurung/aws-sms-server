// import express from "express";
// import axios from "axios";
// import dotenv from "dotenv";

// dotenv.config();
// const app = express();
// app.use(express.json());

// app.get("/hello", (req, res) => {
//   res.json({ 
//     message: "Hello! The SMS server is up and running.",
//     timestamp: new Date().toISOString()
//   });
// });

// // Simple API key protection
// app.use((req, res, next) => {
//   const key = req.headers["x-api-key"];
//   if (key !== process.env.API_KEY) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }
//   next();
// });

// app.post("/send-sms", async (req, res) => {
//   const { phone, message } = req.body;

//   if (!phone || !message) {
//     return res.status(400).json({ error: "Missing phone or message" });
//   }

//   try {
//     const response = await axios.post(process.env.BT_SMS_URL, {
//       username: process.env.BT_USERNAME,
//       password: process.env.BT_PASSWORD,
//       from: process.env.BT_SENDER_ID,
//       to: phone,
//       text: message
//     });

//     res.json({ success: true, response: response.data });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.response?.data || error.message
//     });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`SMS server running on port ${PORT}`);
// });



import express from "express";
import smpp from "smpp";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

/* ------------------ SMPP SESSION ------------------ */

let session;

function connectSMPP() {
  session = new smpp.Session({
    host: process.env.SMPP_HOST,
    port: process.env.SMPP_PORT
  });

  session.bind_transceiver(
    {
      system_id: process.env.SMPP_SYSTEM_ID,
      password: process.env.SMPP_PASSWORD
    },
    (pdu) => {
      if (pdu.command_status === 0) {
        console.log("✅ SMPP bound successfully");
      } else {
        console.error("❌ SMPP bind failed", pdu.command_status);
      }
    }
  );

  session.on("error", (err) => {
    console.error("SMPP error:", err);
    reconnect();
  });

  session.on("close", () => {
    console.warn("SMPP connection closed");
    reconnect();
  });

  // Keep alive
  setInterval(() => {
    if (session) {
      session.enquire_link();
    }
  }, 30000);
}

function reconnect() {
  console.log("🔄 Reconnecting SMPP in 5s...");
  setTimeout(connectSMPP, 5000);
}

connectSMPP();

/* ------------------ ROUTES ------------------ */

app.get("/hello", (req, res) => {
  res.json({
    message: "Hello! SMPP SMS server is running.",
    timestamp: new Date().toISOString()
  });
});

/* -------- API KEY PROTECTION -------- */

app.use((req, res, next) => {
  const key = req.headers["x-api-key"];
  if (key !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

/* -------- SEND SMS -------- */

app.post("/send-sms", (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: "Missing phone or message" });
  }

  session.submit_sm(
    {
      destination_addr: phone,
      source_addr: process.env.SMPP_SENDER_ID,
      short_message: message
    },
    (pdu) => {
      if (pdu.command_status === 0) {
        res.json({
          success: true,
          message_id: pdu.message_id
        });
      } else {
        res.status(500).json({
          success: false,
          error: "SMPP submit failed"
        });
      }
    }
  );
});

/* ------------------ SERVER ------------------ */

const PORT = process.env.PORT || 5019;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SMPP SMS server running on port ${PORT}`);
});
