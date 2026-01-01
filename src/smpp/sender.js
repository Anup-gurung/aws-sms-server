const { getSession } = require('./client');
const config = require('./config');

function sendSMS(msisdn, message) {
  return new Promise((resolve, reject) => {
    const { session, isBound } = getSession();

    if (!isBound) {
      return reject('SMPP not connected');
    }

    session.submit_sm(
      {
        source_addr_ton: 5, // Alphanumeric
        source_addr_npi: 0,
        source_addr: config.senderId,

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

module.exports = { sendSMS };
