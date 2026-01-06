import { Router } from "express";
import { createFolder, getFiles } from "./files.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.post("/folders", createFolder);
router.get("/", getFiles);

export default router;