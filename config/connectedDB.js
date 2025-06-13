import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://sabihop56:Mypassword12@cluster0.vfwnugr.mongodb.net/ecommerce?retryWrites=true&w=majority", {
      dbName: 'ecommerce',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('🎉 MongoDB Connected!');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
