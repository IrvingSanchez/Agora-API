import { Router } from 'express';
import userRouter  from './user.routes.js';
import commitRouter  from './commit.route.js';

const router = Router();

router.use('/users', userRouter);
router.use('/commit', commitRouter);

export default router;

