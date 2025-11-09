import { Router } from "express";
import UserController from "../controllers/user.controller.js";

const router = Router();

router.post("/register", UserController.registerUser);
router.post("/", UserController.getUsers);
router.post('/:userId/wallet', UserController.updateWallet);

export default router;
