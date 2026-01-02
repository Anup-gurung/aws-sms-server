import smpp from 'smpp';

const startConnection = () => {
    // Connect using the raw IP and Port
    const session = smpp.connect('118.103.137.224', 5019);

    session.on('connect', () => {
        console.log('📡 Socket connected! Binding immediately...');
        
        // You must bind immediately before the server closes the host
        session.bind_transceiver({
            system_id: 'AnupG',
            password: 'AnupG',
            interface_version: 0x34 // Force SMPP v3.4
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
};

export default startConnection;