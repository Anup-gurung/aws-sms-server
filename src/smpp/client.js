import smpp from 'smpp';
import * as config from './config.js';

// Tashicell Session
let tashicellSession = null;
let tashicellBound = false;

// BT SMS Session
let btSmsSession = null;
let btSmsBound = false;

// Create a generic connection function
const createConnection = (providerConfig, providerName) => {
    let session = null;
    let isBound = false;

    const startConnection = () => {
        console.log(`🔌 Initiating connection to ${providerName}...`);

        session = smpp.connect({
            url: `smpp://${providerConfig.host}:${providerConfig.port}`,
            auto_enquire_link_period: 30000,
            socket_timeout: 60000
        });

        session.on('connect', () => {
            console.log(`📡 TCP Socket Connected to ${providerName}. Sending Bind PDU...`);
            
            session.bind_transceiver({
                system_id: providerConfig.systemId,
                password: providerConfig.password,
                system_type: '',             
                interface_version: 0x34,     
                addr_ton: 0,
                addr_npi: 0
            }, (pdu) => {
                if (pdu.command_status === 0) {
                    console.log(`✅ SUCCESS: SMPP bound to ${providerName}`);
                    isBound = true;
                    
                    // Heartbeat (Enquire Link) - Runs every 30 seconds
                    const heartbeat = setInterval(() => {
                        if (session.socket && session.socket.writable) {
                            session.enquire_link();
                        } else {
                            clearInterval(heartbeat);
                        }
                    }, 30000);

                } else {
                    console.error(`❌ ${providerName} Bind rejected. Status Code:`, pdu.command_status);
                    isBound = false;
                }
            });
        });

        session.on('error', (err) => {
            console.error(`🔥 ${providerName} SMPP Error:`, err.code || err.message);
        });

        session.on('close', () => {
            console.log(`⚠️ ${providerName} Connection closed. Reconnecting in 10s...`);
            isBound = false;
            setTimeout(startConnection, 10000);
        });
        
        return { session, getStatus: () => isBound };
    };

    startConnection();
    
    return {
        getSession: () => ({ session, isBound }),
        getStatus: () => isBound
    };
};

// Initialize both connections
const tashicellClient = createConnection(config.tashicell, 'Tashicell');
const btSmsClient = createConnection(config.btSms, 'BT SMS');

// Legacy getSession for backward compatibility
const getSession = () => {
    return tashicellClient.getSession();
};

// New methods to get specific provider sessions
const getTashicellSession = () => tashicellClient.getSession();
const getBtSmsSession = () => btSmsClient.getSession();

export default { 
    getSession,           // Legacy - returns Tashicell
    getTashicellSession,
    getBtSmsSession
};