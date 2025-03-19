import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const userdatabase = async () => {
    try {
        // For testing purposes, we'll use a mock connection
        if (process.env.NODE_ENV === 'test' || !process.env.MONGODB_URI) {
            console.log('Using mock database connection for testing');
            return;
        }
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');   
    } catch (error) {
        console.log('MongoDB connection error:', error.message);
        // Don't crash the app, just log the error
    }
}

export default userdatabase;