<<<<<<< HEAD
import { listen } from './app.js';
=======
import app from './app.js';
>>>>>>> 422ff395dc4132e12aa746d5af7be7e1be58b47f

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SMS API running on port ${PORT}`);
});
