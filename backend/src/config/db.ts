import mongoose from 'mongoose';
import logger from './logger';
import { Resolver } from 'node:dns/promises';

async function connectToDatabase(): Promise<void> {
    const mongoURI = process.env.MONGODB_URI as string;
    if (!mongoURI || (!mongoURI.startsWith('mongodb+srv://') && !mongoURI.includes('tls=true'))) {
    throw new Error('FATAL: Invalid MONGODB_URI. Production connections must require TLS (e.g., mongodb+srv://).');
  }
    try{

const customResolver = new Resolver();
  customResolver.setServers(['8.8.8.8', '8.8.4.4']);
        await mongoose.connect(mongoURI,{tls:true});
    }catch(err){
        logger.fatal({err: Error}, `Failed to connect to MongoDB! ${err}`);
        process.exit(1);
    }

    logger.info('Connected to MongoDB');
}



export default connectToDatabase;