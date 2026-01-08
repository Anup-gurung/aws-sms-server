import smpp from 'smpp';
import * as config from './config.js';

let session = null;
let isBound = false;

const startConnection = () => {
    console.log('🔌 Initiating connection to Tashicell...');

    // 1. Connect using the URL string format with timeout
    session = smpp.connect({
        url: `smpp://${config.host}:${config.port}`,
        auto_enquire_link_period: 30000,
        socket_timeout: 60000
    });

    // 2. Increase timeout to prevent the ETIMEDOUT you saw earlier
    session.on('connect', () => {
        console.log('📡 TCP Socket Connected. Sending Bind PDU...');
        
        session.bind_transceiver({
            system_id: config.systemId,
            password: config.password,
            system_type: '',             
            interface_version: 0x34,     
            addr_ton: 0,
            addr_npi: 0
        }, (pdu) => {
            if (pdu.command_status === 0) {
                console.log('✅ SUCCESS: SMPP bound to Tashicell');
                isBound = true;
                
                // 3. Heartbeat (Enquire Link) - Runs every 30 seconds
                // This prevents Tashicell from closing the host connection
                const heartbeat = setInterval(() => {
                    if (session.socket && session.socket.writable) {
                        session.enquire_link();
                    } else {
                        clearInterval(heartbeat);
                    }
                }, 30000);

            } else {
                // If this triggers, Tashicell is alive but rejected your 'AnupG' login
                console.error('❌ Bind rejected. Status Code:', pdu.command_status);
                isBound = false;
            }
        });
    });

    // 4. Handle errors (like ETIMEDOUT or ECONNRESET)
    session.on('error', (err) => {
        console.error('🔥 SMPP Error:', err.code || err.message);
    });

    // 5. Automatic Reconnection logic
    session.on('close', () => {
        console.log('⚠️ Connection closed. Reconnecting in 10s...');
        isBound = false;
        setTimeout(startConnection, 10000);
    });
    
    return session;
};

const getSession = () => {
    return { session, isBound };
};

startConnection();

export default { getSession };