// Importing all necessary packages
import JWT from "jsonwebtoken";

// Importing custom exceptions and handlers
import handlers from "../../exceptions/handlers.js";
import UnauthorizedError from "../../exceptions/UnauthorizedError.js";
import AccessTokenError from "../../exceptions/AccessTokenError.js";
import { userDB } from "../app/services/db/userDB.js";
import { roleDB } from "../app/services/db/roleDB.js";
import ValidationError from "../../exceptions/ValidationError.js";
import ForbiddenError from "../../exceptions/ForbiddenError.js";

/**
 * Middleware to authenticate the user using JWT
 *
 * @param {Object} req - Express request object
 * @param {Object} req.cookies - Cookies attached to the request
 * @param {Object} req.headers - Headers attached to the request
 * @param {Object} req.nativeRequest - Custom object to attach user details and some important data
 * @param {Object} res = Express response object
 * @param {Function} next - Express next middleware function
 */

const userAuthMiddleware = async (req, res, next) => {
  try {
    const urlContent = req.originalUrl.slice(1).split("/");
    let accessToken = req.headers?.authorization?.split(" ")[1];

    // If neither accessToken nor refreshToken is present, throw UnauthorizedError and refreshToken present throw AccessTokenError
    if (!accessToken) {
      throw new UnauthorizedError("Invalid access token");
    }

    // Verify the accessToken and retrieve payload from JWT. If accessToken is not valid throw AccessToken Error
    let decoded = JWT.verify(
      accessToken,
      process.env.JWT_KEY,
      (err, decoded) => {
        if (err) {
          // console.error(err)
          throw new UnauthorizedError("Invalid JWT. Please log in again");
        }
        return decoded;
      }
    );

    let user = await userDB.find({ _id: decoded._id });

    if (!user)
      throw new UnauthorizedError(
        "User Not Found. Please create a new account."
      );

    if (!user.accessTokens.includes(accessToken))
      throw new UnauthorizedError(
        "Expired Authentication Token. Please log in again to obtain a new token"
      );

    if (
      !urlContent.includes("otp-verify") &&
      !urlContent.includes("reset-otp") &&
      !urlContent.includes("logout")
    ) {
      if (!user.isActivated)
        throw new ValidationError(
          "Account Verification Required. Please verify your account to continue"
        );
      if (!user.isApproved)
        throw new ValidationError("Account approval Required");
    }

    const role = user.role;
    if (!role) {
      throw new ForbiddenError("Role not found.");
    }

    // Attach user details to the request object for downstream middleware and
    req.nativeRequest.setUserId = user._id;
    req.nativeRequest.accessToken = accessToken;
    req.nativeRequest.decoded = decoded;
    req.nativeRequest.setUser = user;
    req.nativeRequest.permissions = role?.permissions;
    req.nativeRequest.role = role?.name;

    // Pass control to the next middleware function or route handler
    next();
  } catch (error) {
    console.error(error);
    // Log the error and respond with appropriate error handling
    handlers(
      {
        errorLog: {
          location: req.originalUrl.slice(1).split("/").join("::"),
          details: `Error: ${error}`,
          message: error.message,
        },
        error,
      },
      req,
      res
    );
  }
};

// Exporting the middleware
export default userAuthMiddleware;
