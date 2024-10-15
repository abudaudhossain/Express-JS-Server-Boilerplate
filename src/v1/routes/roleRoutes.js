import express from "express";
import roleController from "../app/controllers/role.controller.js";
import { multerMiddleware } from "../../config/multer.js";
import userAuthMiddleware from "../middleware/userAuth.js";

const router = express.Router();

router.post(
  "/",
  userAuthMiddleware,
  multerMiddleware,
  roleController.insertRoleHandler
);
router.get("/", roleController.getRolesHandler);
router.get("/permissions", roleController.getAllPermissionsHandler);
router.put(
  "/:_id",
  userAuthMiddleware,
  multerMiddleware,
  roleController.updateRoleHandler
);
router.get("/:_id", userAuthMiddleware, roleController.getRoleHandler);

export default router;
