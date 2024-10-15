import express from "express";
import { multerMiddleware, upload } from "../../config/multer.js";
import profileController from "../app/controllers/profileController.js";

const router = express.Router();

router.get("/", profileController.getProfileHandler);
router.put(
  "/",
  upload.single("avatar"),
  profileController.updateProfileHandler
);


export default router;
