import express from 'express';
const router = express.Router();
import { registerUser , loginUser, logout, getUserProfile} from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';



router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/logout', logout);
router.get('/userDetails',authMiddleware, getUserProfile);

export default router;