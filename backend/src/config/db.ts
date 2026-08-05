import mongoose from 'mongoose';
import logger from './logger';

async function connectToDatabase(): Promise<void> {
    const mongoURI = process.env.MONGODB_URI as string;
    if (!mongoURI || (!mongoURI.startsWith('mongodb+srv://') && !mongoURI.includes('tls=true'))) {
    throw new Error('FATAL: Invalid MONGODB_URI. Production connections must require TLS (e.g., mongodb+srv://).');
  }
    try{

        await mongoose.connect(mongoURI,{tls:true,
      serverSelectionTimeoutMS: 10000,});
    }catch(err){
        logger.fatal({err}, `Failed to connect to MongoDB! ${err}`);
        process.exit(1);
    }

    logger.info('Connected to MongoDB');
}



export default connectToDatabase;