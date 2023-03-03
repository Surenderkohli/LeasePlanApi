import { StatusCodes } from 'http-status-codes';
import { CreateApp, finishApp, useModules } from './app.js';
import './helpers/db.js';
import http from 'http';

(async () => {
     const app = CreateApp();
     app.get('/healthy', (req, res) => {
          res.send(StatusCodes.OK);
     });

     useModules(app);

     finishApp(app);

     try {
          const PORT = 5001;
          const server = http.createServer(app);
          await server.listen(PORT);
          console.log(`Application is running on Port Number ${PORT}`);
     } catch (err) {
          console.error(err);
          console.log(`Something went wrong`);
          process.exit(1);
     }
})();
