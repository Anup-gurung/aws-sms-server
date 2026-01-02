import { connect as _connect } from 'smpp';
import { host, port, systemId, password as _password } from './config.js';

let session;
let isBound = false;
let retryCount = 0;
const MAX_RETRIES = 5;

function connect() {
  console.log('🔌 Connecting to SMPP...');

  session = _connect(`smpp://${host}:${port}`);

  session.on('close', () => {
    isBound = false;
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`⚠️ SMPP connection closed. Reconnecting... (${retryCount}/${MAX_RETRIES})`);
      setTimeout(connect, 5000);
    } else {
      console.log('❌ Max SMPP reconnection attempts reached.');
    }
  });

  session.on('error', (err) => {
    console.error('🔥 SMPP error:', err.message);
  });

  session.bind_transceiver(
    {
      system_id: systemId,
      password: _password,
      interface_version: 0x34,
    },
    (pdu) => {
      if (pdu.command_status === 0) {
        isBound = true;
        retryCount = 0;
        console.log('✅ SMPP bind successful');
      } else {
        console.error('❌ SMPP bind failed:', pdu.command_status);
      }
    }
  );
}

function getSession() {
  return { session, isBound };
}

// 🔥 start connection immediately
connect();

export default { getSession };
