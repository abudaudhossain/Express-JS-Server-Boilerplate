import express from "express";

import { multerMiddleware, upload } from "../../config/multer.js";
import userAuthMiddleware from "../middleware/userAuth.js";
import categoryController from "../app/controllers/newsCategoryController.js";


const router = express.Router();

router.post(
  "/",
  upload.single("image"),
  categoryController.insertCategoryHandler
);
router.get("/", categoryController.getCategoriesHandler);
router.get("/:_id", categoryController.getCategoryHandler);
router.delete("/:_id", categoryController.deleteCategoryHandler);
router.put(
  "/:_id",
  userAuthMiddleware,
  upload.single("image"),
  categoryController.updateCategoryHandler
);

export default router;
