import { Router } from "express";
import CommitController from "../controllers/commit.controller.js";

const router = Router();

router.post("/start", CommitController.registerCommit);
router.get("/grant/callback", CommitController.callbackCommit);
router.post("/grant/finalize", CommitController.finalizeCommit);

export default router;
