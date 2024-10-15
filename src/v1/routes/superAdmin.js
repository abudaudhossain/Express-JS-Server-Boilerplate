import express from "express";
import adminControllers from "../app/controllers/admin/adminControllers.js";
import { multerMiddleware } from "../../config/multer.js";
const router = express.Router();

// Authentication routes (e.g., login, register)
router.post("/", multerMiddleware, adminControllers.insertSuperAdminHandler);

export default router;
