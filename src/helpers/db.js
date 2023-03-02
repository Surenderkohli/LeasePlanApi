import mongoose from 'mongoose';
import dotenv from 'dotenv';

(async () => {
     dotenv.config();
     try {
          mongoose.set('strictQuery', true);
          const mongoUrl = process.env.DB_URL;
          mongoose.connect(mongoUrl, {
               useNewUrlParser: true,
               useUnifiedTopology: true,
          });
          console.log('Database is connected successfully...........');
     } catch (error) {
          console.error('mongodb is not connected', error);
     }
})();
