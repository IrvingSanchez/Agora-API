import { Router } from "express";
import CommitController from "../controllers/commit.controller.js";

const router = Router();

router.post("/start", CommitController.registerCommit);
router.post("/grant/finalize", CommitController.finalizeCommit);

export default router;
