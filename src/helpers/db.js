import mongoose from "mongoose";
import dotenv from "dotenv"

(async () => {
    dotenv.config()
    try {
        mongoose.set('strictQuery', true);
        const mongoUrl = `mongodb://127.0.0.1:27017/leasePlan`;
        mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database is connected successfully...........');
    } catch (error) {
        console.error('mongodb is not connected', error);
    }
})();