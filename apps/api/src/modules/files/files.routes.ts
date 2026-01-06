import { Router } from "express";
import { createFolder, getFiles, createFile, getFile } from "./files.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.post("/folders", createFolder);
router.get("/", getFiles);
router.post("/", createFile);
router.get("/:id", getFile);

export default router;
