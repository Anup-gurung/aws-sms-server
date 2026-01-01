import express, { json } from 'express';
import smsRoutes from './routes/sms';

const app = express();
app.use(json());
app.use('/api', smsRoutes);

export default app;