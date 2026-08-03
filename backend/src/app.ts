import express , {Application} from 'express';
import cors from 'cors';
import pino_http from 'pino-http';
import logger from './config/logger';


const app: Application = express();


app.use(cors());
app.use(express.json());
app.use(pino_http({ logger }));


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


export default app;

