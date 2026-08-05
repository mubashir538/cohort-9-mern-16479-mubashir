import express from 'express';
import authController from '../controllers/auth.controller';
import verifyToken from '../middlewares/auth.middleware';

const router = express.Router();


router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', verifyToken, authController.getMe);

export default router;
