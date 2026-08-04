import dotenv from 'dotenv';
dotenv.config();
import dns from 'node:dns';


import logger from './config/logger';
import app from './app';
import connectToDatabase from './config/db';



dns.setServers(['8.8.8.8', '8.8.4.4']);

process.on('uncaughtException', (err:Error) => {
  logger.fatal({err: Error}, `Uncaught Exception: ${err.message} -- Shutting down`);
  process.exit(1);
});

process.on('unhandledRejection',(err:Error) => {
  logger.fatal({err: Error}, `Unhandled Rejection: ${err.message} -- Shutting down`);
  process.exit(1);
});


function getPort():number{
  const port = (process.env.PORT || '').trim();
  if (port === ''){
    return 3000;
  }
  const parsedPort = parseInt(port,10);
  if (isNaN(parsedPort) || parsedPort <= 0 || parsedPort > 65535){
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
  }catch (err ){
    logger.fatal({err: Error}, `Failed to start server! ${err}`);
    process.exit(1);
  }
}

startServer();

