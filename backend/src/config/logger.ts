import pino , {Logger} from 'pino';

const isDevelopment:boolean = process.env.NODE_ENV !== 'production';

const logger: Logger = pino({
    level: process.env.LOG_LEVEL || 'debug',
    transport: isDevelopment ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname'
        }
    }: undefined
});

export default logger;