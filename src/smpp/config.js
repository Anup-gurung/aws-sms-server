require('dotenv').config();

export const host = process.env.SMPP_HOST;
export const port = process.env.SMPP_PORT;
export const systemId = process.env.SMPP_SYSTEM_ID;
export const password = process.env.SMPP_PASSWORD;
export const senderId = process.env.SMPP_SENDER_ID;
