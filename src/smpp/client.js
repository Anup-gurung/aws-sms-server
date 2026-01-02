import smpp from 'smpp';

const startConnection = () => {
    console.log('🔌 Connecting to SMPP...');

    // Use a direct session object instead of a URL string if ETIMEDOUT persists
    const session = smpp.connect({
        host: '118.103.137.224',
        port: 5019,
        timeout: 10000 // Increase timeout to 10 seconds
    });

    session.on('connect', () => {
        console.log('📡 Socket connected, attempting bind...');
        
        session.bind_transceiver({
            system_id: 'AnupG',
            password: 'AnupG',
        }, (pdu) => {
            if (pdu.command_status === 0) {
                console.log('✅ SMPP bind successful');
            } else {
                console.error('❌ SMPP bind failed. Status:', pdu.command_status);
            }
        });
    });

    session.on('error', (err) => {
        console.error('🔥 SMPP error:', err.message);
    });

    session.on('close', () => {
        console.log('⚠️ SMPP connection closed.');
    });
};

export default startConnection;