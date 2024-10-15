import fs from "fs";
import ForbiddenError from "../../../exceptions/ForbiddenError.js";
import handlers from "../../../exceptions/handlers.js";
import ValidationError from "../../../exceptions/ValidationError.js";
import response from "../../../utils/native.js";
import NotFoundError from "../../../exceptions/NotFoundError.js";
import validationHelper from "../validation/validationHelper.js";
import { getFileUrl } from "../helpers/utility.js";
import { benefitsCategoryDB } from "../services/db/benefitsCategoryDB.js";

const categoryController = {
  insertCategoryHandler: async (req, res) => {
    const { setUserId, permissions, setUser } = req.nativeRequest;
    try {
      if (!permissions?.create_benefits_category) {
        throw new ForbiddenError(
          "You do not have permission to create the category"
        );
      }

      if (req.file) {
        req.body.image = getFileUrl(req.file);
      }
      const result = await benefitsCategoryDB.create({
        ...req.body,
        createdBy: setUserId,
      });

      response(
        {
          success: true,
          message: "benefits category inserted successfully",
          data: result,
          status: 201,
        },
        req,
        res
      );
    } catch (error) {
      try {
        if (req.file) {
          let fileUrl = req.file.path.split("\\").join("/");
          let imagePath = req.rootDir + "/" + fileUrl;
          console.log(imagePath);
          fs.unlinkSync(imagePath);
        }
      } catch (error) {
        console.log(error);
      } finally {
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
    }
  },
  getCategoriesHandler: async (req, res) => {
    let query = {
      status: true,
      existence: true,
    };
    // Initialize start index variable for pagination
    let startIndex = null;

    // Destructure the necessary fields from request query parameters
    let { status, page, limit, search } = req.query;
    try {
      // If limit is provided , parse it to an integer; otherwise set to null
      if (limit) {
        limit = parseInt(limit);
      } else limit = null;

      // If page is provided, parse it to an integer, adjust for zero-based index and calculate the start index
      if (page) {
        page = parseInt(page);
        page = page - 1;
        startIndex = page * limit;
      }

      // If status is provided , add it to the query object
      if (status) {
        query.status = status;
      }

      // If search is provided, modify to include a search condition for name adn description fields
      if (search) {
        query = {
          ...query,
          $or: [{ title: { $regex: search, $options: "i" } }],
        };
      }
      const totalCount = await benefitsCategoryDB.totalCount(query);
      const result = await benefitsCategoryDB.finds(
        query,
        {},
        startIndex,
        limit,
        {}
      );
      const categories = result.map((item) => ({
        id: item._id,
        title: item.title,
        image: item.image,
        description: item.description,
        status: item.status,
        existence: item.existence,
      }));
      response(
        {
          success: true,
          message: "benefits Category loaded successfully",
          data: categories,
          meta: {
            count: result.length,
            totalCount,
            page: page + 1,
            limit: limit,
          },
          status: 200,
        },
        req,
        res
      );
    } catch (error) {
      console.log(error);
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
  },
  getCategoryHandler: async (req, res) => {
    const { _id } = req.params;
    try {
      if (!validationHelper.isValidMongoDBObjectId(_id))
        throw new ValidationError("Invalid id");
      const item = await benefitsCategoryDB.find({ _id: _id }, {});
      if (!item) throw new NotFoundError("category not found");

      response(
        {
          success: true,
          message: "category  loaded successfully",
          data: {
            id: item._id,
            title: item.title,
            image: item.image,
            description: item.description,
            status: item.status,
            existence: item.existence,
          },
          meta: {
            count: 1,
          },
          status: 200,
        },
        req,
        res
      );
    } catch (error) {
      console.log(error);
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
  },
  updateCategoryHandler: async (req, res) => {
    const { _id } = req.params;
    try {
      req.body = { ...req.body };
      const { setUserId, permissions } = req.nativeRequest;

      if (!permissions?.update_benefits_category) {
        throw new ForbiddenError(
          "You do not have permission to update the category"
        );
      }

      if (req.file) {
        req.body.logo = getFileUrl(req.file);
      }

      if (!validationHelper.isValidMongoDBObjectId(_id))
        throw new ValidationError("Invalid id");

      const result = await benefitsCategoryDB.update(
        {
          _id: _id,
        },
        { ...req.body, updatedBy: setUserId }
      );
      if (!result) throw new ValidationError("category not found");

      response(
        {
          success: true,
          message: "You have successfully updated category",
          data: result,
          status: 200,
        },
        req,
        res
      );
    } catch (error) {
      console.log(error);
      try {
        if (req.file) {
          let fileUrl = req.file.path.split("\\").join("/");
          let imagePath = req.rootDir + "/" + fileUrl;
          console.log(imagePath);
          fs.unlinkSync(imagePath);
        }
      } catch (error) {
        console.log(error);
      } finally {
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
    }
  },
  deleteCategoryHandler: async (req, res) => {
    const { _id } = req.params;
    try {
      req.body = { ...req.body };
      const { setUserId, permissions } = req.nativeRequest;

      if (!permissions?.delete_benefits_category) {
        throw new ForbiddenError(
          "You do not have permission to delete the category"
        );
      }

      const result = await benefitsCategoryDB.update(
        {
          _id: _id,
          existence: true,
        },
        { existence: false }
      );
      if (!result) throw new ValidationError("category not found");

      response(
        {
          success: true,
          message: "You have successfully delete category",
          data: result,
          status: 200,
        },
        req,
        res
      );
    } catch (error) {
      console.log(error);
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
  },
};

export default categoryController;
