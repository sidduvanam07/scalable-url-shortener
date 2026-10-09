
import { Router } from "express";
import { redirectUrl } from "../controllers/redirect.controller.js";

const router = Router();

router.get("/:code", redirectUrl);

export default router;
