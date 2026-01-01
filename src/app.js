import express, { json } from 'express';
import smsRoutes from './routes/sms.js';
<<<<<<< HEAD
import { connectSMPP } from './smpp.js'; // your SMPP logic
=======
>>>>>>> 422ff395dc4132e12aa746d5af7be7e1be58b47f

const app = express();
app.use(json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'hello' });
});

app.use('/api', smsRoutes);

// Export a listen function for server.js
export function listen(port, callback) {
  // First connect SMPP
  connectSMPP()
    .then(() => {
      console.log('✅ SMPP bind successful');
      app.listen(port, callback);
    })
    .catch(err => {
      console.error('❌ SMPP bind failed:', err);
      process.exit(1); // stop process if SMPP fails
    });
}

export default app;

