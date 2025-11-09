import { Router } from 'express';
import userRouter  from './user.routes.js';
import commitRouter  from './commit.route.js';
import projectRouter from './project.routes.js';

const router = Router();

router.use('/users', userRouter);
router.use('/commit', commitRouter);
router.use('/projects', projectRouter);

export default router;

