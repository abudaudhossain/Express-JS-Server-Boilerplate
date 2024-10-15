import express from "express";
import { multerMiddleware } from "../../config/multer.js";
import authControllers from "../app/controllers/authController.js";
import welcomeControllers from "../app/controllers/welcomeControllers.js";

const router = express.Router();

router.get("/", welcomeControllers.welcomeHandler);
// Authentication routes (e.g., login, register)
router.get("/logout", authControllers.logoutHandler);
router.post(
  "/otp-verify",
  multerMiddleware,
  authControllers.accountActivatedHandler
);
router.get("/reset-otp", authControllers.resetOptHandler);
router.put(
  "/change-password",
  multerMiddleware,
  authControllers.changePasswordHandler
);

export default router;
