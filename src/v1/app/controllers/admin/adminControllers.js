import bcrypt from "bcrypt";

import handlers from "../../../../exceptions/handlers.js";
import ValidationError from "../../../../exceptions/ValidationError.js";
import { permissions } from "../../../../utils/data/superAdminRole.js";
import response from "../../../../utils/native.js";
import { roleDB } from "../../services/db/roleDB.js";
import { userDB } from "../../services/db/userDB.js";
import userValidationHelper from "../../validation/userValidationHelper.js";
import validationHelper from "../../validation/validationHelper.js";

const saltRounds = 10;

const adminControllers = {
  welcome: async (req, res) => {
    try {
      console.log("req", req.nativeRequest);

      response(
        {
          success: true,
          message: "Data loaded Successful",
          data: "welcome to admin",
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
  insertSuperAdminHandler: async (req, res) => {
    let query = {
      existence: { $ne: false },
      isActivated: true,
    };

    try {
      req.body = { ...req.body };
      const { name, email, phone, password } = req.body;

      //  @validation part
      validationHelper.ObjExists(
        ["name", "password", "email", "phone"],
        req.body
      );
      if (!email && !phone) {
        throw new ValidationError("Email or Phone number are required");
      }
      validationHelper.isEmpty(req.body);

      let role = await roleDB.find({ name: "super_admin" });

      if (!role) {
        role = await roleDB.create({
          name: "super_admin",
          permissions: permissions,
        });
      }

      const superAdmin = await userDB.find({ role: role._id });
      if (superAdmin) throw new ValidationError("Super admin Exists");

      // Exist user validation
      if (phone) {
        if (validationHelper.phoneValidation(phone))
          throw new ValidationError("Invalid phone number");
        query.phone = phone;
      }
      if (email) {
        if (validationHelper.validateEmail(email))
          throw new ValidationError("Invalid email");
        query.email = email;
      }
      if (email && phone) {
        query = {
          existence: true,
          isActivated: true,
          $or: [{ phone: phone }, { email: email }],
        };
      }
      // console.log("query: ", query)

      const users = await userDB.finds(query);
      // console.log("users: ", users)
      let validationResult = userValidationHelper.duplicateUserValidation(
        users,
        null,
        phone,
        email
      );
      if (validationResult.isInvalid) {
        throw new ValidationError(validationResult.message);
      }

      // create user
      const saveUser = {
        name,
        email,
        phone,
        role: role?._id,
        isActivated: true,
        isApproved: true,
      };
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(password, salt);
      saveUser.password = hash;

      const result = await userDB.create(saveUser);
      if (!result) {
        throw new ValidationError("Admin create failed");
      }

      response(
        {
          success: true,
          message: "Admin signup completed successfully",
          data: {
            name,
            email,
            role: {
              id: role._id,
              name: role.name,
              permissions: role.permissions,
            },
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

export default adminControllers;
