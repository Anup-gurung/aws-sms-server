import express, { json } from 'express';
import smsRoutes from './routes/sms.js';

const app = express();
app.use(json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'hello' });
});

app.use('/api', smsRoutes);

export default app;