import express , {Application} from 'express';
import cors,{CorsOptions} from 'cors';
import pino_http from 'pino-http';
import logger from './config/logger';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import errorMiddleware from './middlewares/error.middleware';


const app: Application = express();


const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map((origin)=> origin.trim()).filter(Boolean);

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && allowedOrigins.length === 0) {
  throw new Error('CORS_ORIGINS environment variable must be set in production');
}


const corsOptions: CorsOptions = {
  origin: (origin, callback)=>{
    if (!origin){
      return callback(null, true);
    }
    if (isProduction && allowedOrigins.length === 0){
      return callback(null,true);
    }
    if (allowedOrigins.includes(origin)){
      return callback(null,true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  }
}

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(pino_http({ logger }));


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use(errorMiddleware);


export default app;

