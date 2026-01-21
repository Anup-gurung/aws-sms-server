import client from './client.js';
import * as config from './config.js';

// Generic send function
function sendSMSViaProvider(msisdn, message, providerSession, senderConfig) {
  return new Promise((resolve, reject) => {
    const { session, isBound } = providerSession;

    if (!isBound) {
      return reject('SMPP not connected');
    }

    session.submit_sm(
      {
        source_addr_ton: 5, // Alphanumeric
        source_addr_npi: 0,
        source_addr: senderConfig.senderId,

        dest_addr_ton: 1,
        dest_addr_npi: 1,
        destination_addr: msisdn,

        short_message: message,
      },
      (pdu) => {
        if (pdu.command_status === 0) {
          resolve(pdu.message_id);
        } else {
          reject(`SMPP error: ${pdu.command_status}`);
        }
      }
    );
  });
}

// Send via Tashicell (default/legacy)
function sendSMS(msisdn, message) {
  return sendSMSViaProvider(
    msisdn, 
    message, 
    client.getTashicellSession(), 
    config.tashicell
  );
}

// Send via BT SMS
function sendSMSViaBT(msisdn, message) {
  return sendSMSViaProvider(
    msisdn, 
    message, 
    client.getBtSmsSession(), 
    config.btSms
  );
}

export { sendSMS, sendSMSViaBT };
