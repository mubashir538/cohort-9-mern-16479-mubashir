import dotenv from 'dotenv';
dotenv.config();
import logger from './config/logger';
import app from './app';
import connectToDatabase from './config/db';

process.on('uncaughtException', (reason:unknown) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
    logger.fatal({err}, `Uncaught Exception: ${err.message} -- Shutting down`);
  process.exit(1);
});

process.on('unhandledRejection',(reason:unknown) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  logger.fatal({err}, `Unhandled Rejection: ${err.message} -- Shutting down`);
  process.exit(1);
});


function getPort():number{
  const port = (process.env.PORT || '').trim();
  if (port === ''){
    return 3000;
  }

  if (!/^\d+$/.test(port)) {
  throw new Error(`Invalid PORT value: ${port}`);
}
  const parsedPort = Number.parseInt(port,10);
  if (Number.isNaN(parsedPort) || parsedPort <= 0 || parsedPort > 65535){
    throw new Error(`Invalid PORT value: ${port}`);
  }

  return parsedPort;
}

const PORT = getPort();

async function startServer(): Promise<void> {
  try{
    await connectToDatabase();

    app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
  }catch (err){
    logger.fatal({err}, `Failed to start server! ${err}`);
    process.exit(1);
  }
}

startServer();

