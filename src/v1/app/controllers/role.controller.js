import ForbiddenError from "../../../exceptions/ForbiddenError.js";
import handlers from "../../../exceptions/handlers.js";
import NotFoundError from "../../../exceptions/NotFoundError.js";
import ValidationError from "../../../exceptions/ValidationError.js";
import { permissions } from "../../../utils/data/superAdminRole.js";
import response from "../../../utils/native.js";
import { roleDB } from "../services/db/roleDB.js";
import validationHelper from "../validation/validationHelper.js";

const roleController = {
  insertRoleHandler: async (req, res) => {
    try {
      const { setUserId, permissions } = req.nativeRequest;
      if (!permissions?.create_role) {
        throw new ForbiddenError(
          "You do not have permission to create the role"
        );
      }
      req.body.permissions = {
        read_role: true,
        read_organization: true,
        ...req.body.permissions,
      };
      const result = await roleDB.create({ ...req.body, createdBy: setUserId });

      response(
        {
          success: true,
          message: "Role inserted successfully",
          data: result,
          status: 201,
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
  getRolesHandler: async (req, res) => {
    let query = {
      status: true,
      existence: true,
      name: { $ne: "super_admin" },
    };
    // Initialize start index variable for pagination
    let startIndex = null;

    // Destructure the necessary fields from request query parameters
    let { status, page, limit, search, sort } = req.query;
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
          $or: [{ name: { $regex: search, $options: "i" } }],
        };
      }
      const totalCount = await roleDB.totalCount(query);
      const result = await roleDB.finds(
        query,
        { name: 1, permissions: 1 },
        startIndex,
        limit,
        {}
      );
      const roles = result.map((item) => ({
        id: item._id,
        name: item.name,
        permissions: item.permissions,
      }));
      response(
        {
          success: true,
          message: "Role loaded successfully",
          data: roles,
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
  getAllPermissionsHandler: async (req, res) => {
    try {
      response(
        {
          success: true,
          message: "Role loaded successfully",
          data: Object.keys(permissions),
          meta: {
            // count: result.length,
            // totalCount,
            // page: page + 1,
            // limit: limit,
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
  updateRoleHandler: async (req, res) => {
    const { _id } = req.params;
    try {
      const { setUserId, permissions } = req.nativeRequest;

      if (req.body.existence) {
        if (!permissions?.delete_role) {
          throw new ForbiddenError(
            "You do not have permission to delete the role"
          );
        }
      }

      if (!permissions?.update_role && !req.body.permissions) {
        throw new ForbiddenError(
          "You do not have permission to update the role"
        );
      }
      if (req.body.permissions) {
        if (!permissions?.update_role_permissions) {
          throw new ForbiddenError(
            "You do not have permission to update the role permissions"
          );
        }
      }

      const result = await roleDB.update(
        {
          _id: _id,
          name: { $ne: "super_admin" },
        },
        { ...req.body, updatedBy: setUserId }
      );
      if (!result) throw new ValidationError("Role not found");

      response(
        {
          success: true,
          message: "Role updated successfully",
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
  getRoleHandler: async (req, res) => {
    const { _id } = req.params;
    try {
      if (!validationHelper.isValidMongoDBObjectId(_id)) {
        throw new ValidationError("Invalid Id");
      }
      const result = await roleDB.find(
        { _id: _id },
        { name: 1, permissions: 1 }
      );
      if (!result) throw new NotFoundError("Role not found");

      response(
        {
          success: true,
          message: "Role loaded successfully",
          data: {
            id: result._id,
            name: result.name,
            permissions: result.permissions,
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
};

export default roleController;
