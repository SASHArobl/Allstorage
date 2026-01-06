import { Router } from "express";
import {
  createFolder,
  getFiles,
  createFile,
  deleteFile,
  getDownloadLink,
} from "./files.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

// папки
router.post("/folder", createFolder);

// файлы
router.post("/file", createFile);
router.get("/", getFiles);
router.get("/:id/download", getDownloadLink);
router.delete("/:id", deleteFile);

export default router;