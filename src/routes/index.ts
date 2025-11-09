import { Router } from 'express';
import userRouter  from './user.routes.js';
import projectRouter from './project.routes.js';

const router = Router();

router.use('/users', userRouter);
router.use('/projects', projectRouter);

export default router;

