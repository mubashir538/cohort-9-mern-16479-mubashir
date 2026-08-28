import pino , {Logger} from 'pino';

const isDevelopment:boolean = process.env.NODE_ENV === 'development';
const isTest : boolean = process.env.NODE_ENV === 'test';

const logger: Logger = pino({
    level: isTest? 'silent' : process.env.LOG_LEVEL || 'debug',
    redact: {
        paths: [
            'req.headers.cookie',
            'req.headers.authorization',
            'res.headers["set-cookie"]'
        ],
        censor: '[REDACTED]',
    },
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