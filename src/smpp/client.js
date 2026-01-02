import smpp from 'smpp';

const startConnection = () => {
    console.log('🔌 Connecting to SMPP...');

    // Use a direct session object with a shorter timeout to trigger faster retries
    const session = smpp.connect({
        host: '118.103.137.224',
        port: 5019,
        connectTimeout: 5000 // 5 seconds
    });

    session.on('connect', () => {
        console.log('📡 Socket established. Binding now...');
        
        // Immediate bind is required by many providers
        session.bind_transceiver({
            system_id: 'AnupG',
            password: 'AnupG',
            interface_version: 0x34 // SMPP v3.4
        }, (pdu) => {
            if (pdu.command_status === 0) {
                console.log('✅ SMPP bind successful');
            } else {
                console.error('❌ Bind failed. Status:', pdu.command_status);
            }
        });
    });

    session.on('error', (err) => {
        console.error('🔥 SMPP Error:', err.message);
    });

    // Handle auto-reconnect if the server drops the link
    session.on('close', () => {
        console.log('⚠️ SMPP link closed. Retrying in 5s...');
        setTimeout(startConnection, 5000);
    });
};

// Start connection when module is imported
startConnection();

export default startConnection;