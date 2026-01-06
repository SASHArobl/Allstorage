import { Router } from "express";
import { createFolder, getFiles, createFile, getFile, encryptFile, getEncryptedContents } from "./files.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.post("/folders", createFolder);
router.get("/", getFiles);
router.post("/", createFile);
router.get("/:id", getFile);
router.post("/:id/encrypt", encryptFile);
router.get("/:id/contents", getEncryptedContents);

export default router;
