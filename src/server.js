import app from './app.js';

const HOST = '0.0.0.0';
const PORT = parseInt(process.env.PORT, 10) || 5000;

app.listen(PORT, HOST, () => {
  console.log(`🚀 SMS API running on ${HOST}:${PORT}`);
});
