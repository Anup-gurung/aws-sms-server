import 'dotenv/config';

// Tashicell SMPP Configuration
export const tashicell = {
  host: process.env.SMPP_HOST,
  port: Number(process.env.SMPP_PORT),
  systemId: process.env.SMPP_SYSTEM_ID,
  password: process.env.SMPP_PASSWORD,
  senderId: process.env.SMPP_SENDER_ID
};

// BT SMS SMPP Configuration
export const btSms = {
  host: process.env.BT_SMPP_HOST,
  port: Number(process.env.BT_SMPP_PORT),
  systemId: process.env.BT_SMPP_SYSTEM_ID,
  password: process.env.BT_SMPP_PASSWORD,
  senderId: process.env.BT_SMPP_SENDER_ID
};

// Legacy exports for backward compatibility
export const host = process.env.SMPP_HOST;
export const port = Number(process.env.SMPP_PORT);
export const systemId = process.env.SMPP_SYSTEM_ID;
export const password = process.env.SMPP_PASSWORD;
export const senderId = process.env.SMPP_SENDER_ID;
