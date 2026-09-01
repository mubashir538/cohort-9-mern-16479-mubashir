import rateLimit from 'express-rate-limit';

interface AuthRateLimitMessage{
    success: boolean;
    message: { code: string; msg: string };
}

const rateLimitMessage: AuthRateLimitMessage = {
    success: false,
    message: {code: 'TOO_MANY_REQUESTS', msg: 'Too many attempts, try again later'},
};

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    message: rateLimitMessage,
});

export default authRateLimiter;