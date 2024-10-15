import express from "express";
import fs from "fs";
const router = express.Router();

import superAdmin from "../v1/routes/superAdmin.js"; // Import super routes
import roleRoute from "../v1/routes/roleRoutes.js";
import authRoutes from "../v1/routes/authRoutes.js";
import profileRoutes from "../v1/routes/profileRoutes.js";


import authControllers from "./app/controllers/authController.js";

// // Middleware
import { multerMiddleware, upload } from "../config/multer.js";
import userAuthMiddleware from "./middleware/userAuth.js";
import NotFoundError from "../exceptions/NotFoundError.js";
import handlers from "../exceptions/handlers.js";

// Authentication routes (e.g., login, register)
router.post(
  "/auth/register",
  upload.single("avatar"),
  authControllers.signupHandler
);
router.post("/auth/login", multerMiddleware, authControllers.loginHandler);
router.post(
  "/auth/forgot-password",
  multerMiddleware,
  authControllers.forgotPasswordOtpHandler
);
router.post(
  "/auth/reset-password",
  multerMiddleware,
  authControllers.resetNewPasswordHandler
);

router.use("/auth", userAuthMiddleware, authRoutes);
router.use("/super-admin", superAdmin);
router.use("/roles", roleRoute);
router.use("/profile", userAuthMiddleware, profileRoutes);


router.get("/show/:storage/:fileName", (req, res) => {
  try {
    let filePath =
      req.rootDir + `/${req.params.storage}/` + req.params.fileName;
    console.log(filePath, req.rootDir);
    if (fs.existsSync(filePath)) {
      res.sendFile(
        req.rootDir + `/${req.params.storage}/` + req.params.fileName
      );
    } else {
      throw new NotFoundError("File does not exist");
    }
    return;
  } catch (error) {
    console.log(error);
    console.log(error.message);
    handlers(
      {
        errorLog: {
          location: req.originalUrl.split("/").join("::"),
          details: `Error: ${error}`,
        },
        message: error.message,
        success: false,
        error,
      },
      req,
      res
    );
  }
});

export default router;
