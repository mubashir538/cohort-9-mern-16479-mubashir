import rateLimit from 'express-rate-limit';

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: {
            code: 'TOO_MANY_REQUESTS',
            msg: 'Too many attempts, please try again in a few minutes',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default authRateLimiter;