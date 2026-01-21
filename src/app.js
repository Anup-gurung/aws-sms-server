import express, { json } from 'express';
import smsRoutes from './routes/sms.js';
import './smpp/client.js'; // <-- just import it to trigger connection

const app = express();
app.use(json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'hello' });
});

app.use('/api', smsRoutes);

console.log("Loaded routes:");
smsRoutes.stack
  .filter((l) => l.route)
  .forEach((l) => {
    const method = Object.keys(l.route.methods)[0].toUpperCase();
    console.log(method, l.route.path);
  });


export default app;
