import { listen } from './app.js';

const PORT = process.env.PORT || 3000;
listen(PORT, () => {
  console.log(`🚀 SMS API running on port ${PORT}`);
});
