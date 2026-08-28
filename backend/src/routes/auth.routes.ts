import express from 'express';
import authController from '../controllers/auth.controller';
import verifyToken from '../middlewares/auth.middleware';
import authRateLimiter from '../middlewares/rateLimiter.middleware';

const router = express.Router();


router.post('/signup', authRateLimiter, authController.signup);
router.post('/login', authRateLimiter, authController.login);
router.post('/logout', authRateLimiter, authController.logout);
router.get('/me', authRateLimiter, verifyToken, authController.getMe);

export default router;
