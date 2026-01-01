import { connect as _connect } from 'smpp';
import { host, port, systemId, password as _password } from './config';

let session;
let isBound = false;

function connect() {
  console.log('🔌 Connecting to SMPP...');

  session = _connect(`smpp://${host}:${port}`);

  session.bind_transceiver(
    {
      system_id: systemId,
      password: _password,
      interface_version: 0x34,
    },
    (pdu) => {
      if (pdu.command_status === 0) {
        isBound = true;
        console.log('✅ SMPP bind successful');
      } else {
        console.error('❌ SMPP bind failed:', pdu.command_status);
      }
    }
  );

  session.on('close', () => {
    isBound = false;
    console.log('⚠️ SMPP connection closed. Reconnecting...');
    setTimeout(connect, 5000);
  });

  session.on('error', (err) => {
    console.error('🔥 SMPP error:', err.message);
  });
}

function getSession() {
  return { session, isBound };
}

connect();

export default { getSession };
