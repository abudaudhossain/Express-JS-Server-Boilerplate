import bcrypt, { compareSync } from "bcrypt";
import fs from "fs";

import handlers from "../../../exceptions/handlers.js";
import UnauthorizedError from "../../../exceptions/UnauthorizedError.js";
import ValidationError from "../../../exceptions/ValidationError.js";
import { getAccessToken, getFileUrl, getOTP } from "../helpers/utility.js";
import { userDB } from "../services/db/userDB.js";
import validationHelper from "../validation/validationHelper.js";
import response from "../../../utils/native.js";
import userValidationHelper from "../validation/userValidationHelper.js";
import { roleDB } from "../services/db/roleDB.js";
import { organizationDB } from "../services/db/organizationDB.js";

const saltRounds = 10;

/**
 * @description Admin Auth Controllers
 *
 *
 *
 */

const authControllers = {
  loginHandler: async (req, res) => {
    let query = { status: true, existence: true, isActivated: true };

    try {
      req.body = { ...req.body };

      const { username, password, fcmToken } = req.body;
      validationHelper.ObjExists(["username", "password"], req.body);
      let identifier = username;
      query = {
        ...query,
        $or: [{ phone: identifier }, { email: identifier }],
      };

      console.log(query);
      // @validation part
      const user = await userDB.find(query);

      if (!user) throw new UnauthorizedError("Your credentials are incorrect");

      const { name, role, _id } = user;
      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedError("Your credentials are incorrect");
      }
      // create new session
      let logAt = new Date();
      const accessToken = getAccessToken({
        _id: _id,
        role: role._id,
        name,
        logAt,
      });

      await userDB.update(
        {
          _id: _id,
        },
        {
          $addToSet: {
            accessTokens: accessToken,
            fcmTokens: fcmToken,
          },
          lastLogAt: logAt,
        }
      );
      let responseData = {};
      responseData.accessToken = accessToken;
      responseData.user = {
        id: _id,
        name: user?.name ? user.name : null,
        phone: user?.phone ? user.phone : null,
        email: user?.email ? user.email : null,
        image: user?.avatar ? user.avatar : null,
        avatar: user?.avatar ? user.avatar : null,

        role: {
          id: user.role._id,
          name: user.role?.name ? user.role?.name : null,
          permissions: user.role.permissions,
        },
        isActivated: user?.isActivated,
        isApproved: user?.isApproved,
      };

      response(
        {
          success: true,
          message: "Login Successful",
          data: responseData,
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
  logoutHandler: async (req, res) => {
    try {
      let accessToken = req.nativeRequest.accessToken;

      const userId = req.nativeRequest.setUserId;

      let result = await userDB.update(
        { _id: userId },
        {
          $pull: {
            accessTokens: accessToken,
          },
        }
      );

      response(
        {
          success: true,
          message: "You have been logged out",
          data: null,

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
            //query: `Logout TO WEBSITE BLOCK`,
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
  signupHandler: async (req, res) => {
    let query = {
      existence: { $ne: false },
      isActivated: true,
    };

    try {
      req.body = { ...req.body };
      const { name, email, phone, password, role_id, organization_id } =
        req.body;
      //  @validation part
      validationHelper.ObjExists(
        ["name", "password", "email", "role_id", "organization_id"],
        req.body
      );

      if (req.file) {
        req.body.avatar = getFileUrl(req.file);
      }

      if (!email && !phone) {
        throw new ValidationError("Email or Phone number are required");
      }
      validationHelper.isEmpty(req.body);

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

      let role = await roleDB.find({ _id: role_id });
      if (!role) throw new ValidationError("Role not found");
      let organization = await organizationDB.find({ _id: organization_id });
      if (!organization) throw new ValidationError("Organization not found");

      // create user
      const saveUser = {
        ...req.body,
        name,
        email,
        phone,
        role: role_id,
        organization: organization_id,
      };
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(password, salt);
      saveUser.password = hash;

      const result = await userDB.create(saveUser);
      if (!result) {
        throw new ValidationError("User create failed");
      }

      let logAt = new Date();
      const accessToken = getAccessToken({
        _id: result._id,
        role: role_id,
        name,
        logAt,
      });

      const otp = getOTP();

      const expireDate = new Date();
      expireDate.setMinutes(
        expireDate.getMinutes() + parseInt(process.env.OTP_EXPIRE_TIME)
      );

      const userUpdateRes = await userDB.update(
        {
          _id: result._id,
        },
        {
          $addToSet: {
            accessTokens: accessToken,
          },
          lastLogAt: logAt,
          otp: otp,
          otpExpireTime: expireDate,
        }
      );

      let responseData = {};
      responseData.accessToken = accessToken;
      responseData.user = {
        id: userUpdateRes._id,
        name: userUpdateRes?.name ? userUpdateRes.name : null,
        phone: userUpdateRes?.phone ? userUpdateRes.phone : null,
        email: userUpdateRes?.email ? userUpdateRes.email : null,
        image: userUpdateRes?.avatar ? userUpdateRes.avatar : null,
        avatar: userUpdateRes?.avatar ? userUpdateRes.avatar : null,
        role: {
          id: role_id,
          name: role?.name ? role?.name : null,
          permissions: role.permissions,
        },
        isActivated: userUpdateRes?.isActivated,
        isApproved: userUpdateRes?.isApproved,
      };

      // sent activated link

      // let mailResult = await sendToMail({
      //   to: email,
      //   subject: "Account activation OTP",
      //   html: `<p>Hello ${name},</p>
      //        <p>Your OTP is: <b>${otp}</b></p>
      //   `,
      // });

      response(
        {
          success: true,
          message: "User signup completed successfully",
          data: responseData,
          meta: {
            otp,
            expireDate,
          },
          status: 200,
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
  accountActivatedHandler: async (req, res) => {
    const { setUser } = req.nativeRequest;
    try {
      const expireDate = new Date();
      const { otp } = req.body;
      let user = await userDB.find({
        _id: setUser,
      });
      if (!user) throw new ValidationError("Invalid Token");
      if (user.isActivated)
        throw new ValidationError("Account already activated");

      if (user.otpExpireTime < expireDate)
        throw new ValidationError(
          "The OTP you entered has expired. Please request a new one"
        );
      if (user.otp !== otp)
        throw new ValidationError(
          "The OTP you entered is incorrect. Please try again"
        );

      let result = await userDB.update(
        { _id: setUser._id },
        {
          isActivated: true,
          otp: null,
          otpExpireTime: null,
        }
      );
      if (!result) {
        throw new ValidationError("Account activated failed");
      }
      await userDB.deleteMany({
        email: result.email,
        _id: { $ne: result._id },
        isActivated: false,
      });

      response(
        {
          success: true,
          message: "Account Activated Successfully",
          data: {
            isActivated: true,
          },
          meta: {},
          status: 200,
        },
        req,
        res
      );
    } catch (error) {
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
  },
  resetOptHandler: async (req, res) => {
    const { setUser } = req.nativeRequest;
    try {
      let query = {
        status: true,
        existence: true,
        _id: setUser._id,
      };

      // @validation part
      const user = await userDB.find(query);
      if (!user)
        throw new NotFoundError(
          "The user does not exist. Please check your input and try again."
        );

      if (user?.otpExpireTime > new Date()) {
        throw new ValidationError(
          `You have already requested an OTP. Please wait for ${process.env.OTP_EXPIRE_TIME} minutes and try again`
        );
      }

      const otp = getOTP();

      const expireDate = new Date();
      expireDate.setMinutes(
        expireDate.getMinutes() + parseInt(process.env.OTP_EXPIRE_TIME)
      );

      await userDB.update(
        {
          _id: user._id,
        },
        {
          otp: otp,
          otpExpireTime: expireDate,
        }
      );

      // sent activated link
      // sendToMail({
      //   to: user.email,
      //   subject: "Account activation OTP",
      //   html: `<p>Hello ${userUpdateRes?.name},</p>
      //        <p>Your OTP is: <b>${otp}</b></p>
      //   `,
      // });

      response(
        {
          success: true,
          message: "The reset otp sent successfully",
          data: null,
          meta: {
            otp,
            otpExpireTime: expireDate,
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
  changePasswordHandler: async (req, res) => {
    try {
      req.body = { ...req.body };
      const userId = req.nativeRequest.setUserId;
      const { currentPassword, newPassword, isDeleteLogHistory } = req.body;

      //  @validation part
      validationHelper.ObjExists(["currentPassword", "newPassword"], req.body);

      const user = req.nativeRequest.setUser;

      if (!bcrypt.compareSync(currentPassword, user.password)) {
        throw new ValidationError("Your credentials are incorrect");
      }
      if (bcrypt.compareSync(newPassword, user.password)) {
        throw new ValidationError(
          "Please choose a different password from your previous one"
        );
      }

      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(newPassword, salt);

      let updateData = {
        password: hash,
      };
      if (isDeleteLogHistory == "true" || isDeleteLogHistory === true) {
        updateData.accessTokens = [];
      }

      await userDB.update({ _id: userId }, updateData);

      response(
        {
          success: true,
          message: "Your password has been changed",
          data: null,
          meta: {
            count: 0,
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
  forgotPasswordOtpHandler: async (req, res) => {
    try {
      const { identifier } = req.body;
      validationHelper.ObjExists(["identifier"], { ...req.body });
      let query = {
        status: true,
        existence: true,
        isActivated: true,
        $or: [{ phone: identifier }, { email: identifier }],
      };
      // console.log("query: ", query)
      // @validation part
      const user = await userDB.find(query);
      if (!user)
        throw new NotFoundError(
          "The user does not exist. Please check your input and try again."
        );

      if (user?.otpExpireTime > new Date()) {
        throw new ValidationError(
          `You have already requested an OTP. Please wait for ${process.env.OTP_EXPIRE_TIME} minutes and try again`
        );
      }

      const otp = getOTP();

      const expireDate = new Date();
      expireDate.setMinutes(
        expireDate.getMinutes() + parseInt(process.env.OTP_EXPIRE_TIME)
      );

      const userUpdateRes = await userDB.update(
        {
          _id: user._id,
        },
        {
          otp,
          otpExpireTime: expireDate,
        }
      );

      // sent activated link
      // sendToMail({
      //   to: user.email,
      //   subject: "Account activation OTP",
      //   html: `<p>Hello ${userUpdateRes?.name},</p>
      //        <p>Your OTP is: <b>${otp}</b></p>
      //   `,
      // });

      response(
        {
          success: true,
          message: "The reset otp sent successfully",
          data: null,
          meta: {
            otp,
            otpExpireTime: expireDate,
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
  resetNewPasswordHandler: async (req, res) => {
    try {
      const { identifier, otp, password } = req.body;
      validationHelper.ObjExists(["identifier", "otp", "password"], {
        ...req.body,
      });
      let query = {
        status: true,
        existence: true,
        isActivated: true,
        $or: [{ phone: identifier }, { email: identifier }],
      };
      // console.log("query: ", query)
      // @validation part
      const user = await userDB.find(query);

      if (!user)
        throw new NotFoundError(
          "The user does not exist. Please check your input and try again."
        );
      if (user?.otpExpireTime < new Date())
        throw new ValidationError("OTP Expire");
      if (user.otp !== otp) throw new ValidationError("Invalid OTP");

      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(password, salt);

      let result = await userDB.update(
        { _id: user._id },
        {
          otpExpireTime: null,
          otp: null,
          password: hash,
        }
      );

      if (!result) {
        throw new ValidationError("Reset password failed");
      }
      response(
        {
          success: true,
          message:
            "Your password has been successfully reset. You can now log in with your new credentials.",
          data: {},
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

export default authControllers;
