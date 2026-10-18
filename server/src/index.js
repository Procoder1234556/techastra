import { config } from './config.js';
import { initApp } from './app.js';

initApp()
  .then((app) => {
    app.listen(config.port, () => {
      console.log(`API http://localhost:${config.port} (Supabase PostgreSQL)`);
      console.log(
        `Dev auth: http://localhost:${config.port}/auth/google?email=student@techastra.local`,
      );
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
