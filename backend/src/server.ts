import dotenv from 'dotenv';
dotenv.config();

import logger from './config/logger';
import app from './app';


process.on('uncaughtException', (err:Error) => {
  logger.fatal({err: Error}, 'Uncaught Exception');
  process.exit(1);
});

process.on('unhandledRejection',(err:Error) => {
  logger.fatal({err: Error}, 'Unhandled Rejection');
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

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});