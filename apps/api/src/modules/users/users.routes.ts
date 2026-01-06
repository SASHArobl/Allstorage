import { Router } from "express";
import { setUserKeys } from "./users.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.post("/keys", setUserKeys);

export default router;
