import mongoose from 'mongoose';
import logger from './logger';


async function connectToDatabase(): Promise<void> {
    const mongoURI = process.env.MONGODB_URI as string;
    await mongoose.connect(mongoURI);

    logger.info('Connected to MongoDB');
}

export default connectToDatabase;