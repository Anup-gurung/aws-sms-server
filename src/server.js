import app from './app.js';

const PORT = parseInt(process.env.PORT, 10) || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SMS API running on port ${PORT}`);
});
