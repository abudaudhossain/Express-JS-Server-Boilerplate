// Importing the necessary modules and custom error classes
import response from "../utils/native.js";
import AccessTokenError from "./AccessTokenError.js";
import DeviceInfoError from "./DeviceInfoError.js";
import NotFoundError from "./NotFoundError.js";
import ForbiddenError from "./ForbiddenError.js";
import UnauthorizedError from "./UnauthorizedError.js";
import ValidationError from "./ValidationError.js";

/**
 *
 * @param {Object} v - Object containing error, errorLog,
 * @param {Object} v.error - The error object contain that was thrown
 * @param {Object} v.errorLog - Detailed information about the error for logging purposes.
 * @param {String} v.message - Custom error message to be sent in the response
 * @param {Boolean} v.success - Indicates success status , usually false in error handling
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handlers = (v, req, res) => {
    // Handles specific type or error by checking if 'v.error' is an instance of a specific custom error class and calls the 'response' function with the appropriate status code , message, and other details base on the error type.
    if (v.error instanceof NotFoundError) {
        response(
            {
                errorLog: v.errorLog,
                status: 404,
                message: v.message,
                success: v.success,
            },
            req,
            res
        );
    } else if (v.error instanceof DeviceInfoError) {
        response(
            {
                errorLog: v.errorLog,
                status: 404,
                message: v.message,
                success: v.success,
            },
            req,
            res
        );
    } else if (v.error instanceof AccessTokenError) {
        response(
            {
                errorLog: v.errorLog,
                status: 407,
                message: v.message,
                success: v.success,
            },
            req,
            res
        );
    } else if (v.error instanceof UnauthorizedError) {
        response(
            {
                errorLog: v.errorLog,
                status: 401,
                message: v.message,
                success: v.success,
            },
            req,
            res
        );
    } else if (v.error instanceof ForbiddenError) {
        response(
            {
                errorLog: v.errorLog,
                status: 403,
                message: v.message,
                success: v.success,
            },
            req,
            res
        );
    } else if (v.error instanceof ValidationError) {
        response(
            {
                responseCode: "TRY_AGAIN",
                errorLog: v.errorLog,
                status: 422,
                message: v.message,
                success: v.success,
            },
            req,
            res
        );
    } else {
        response(
            {
                responseCode: "TRY_AGAIN",
                errorLog: v.errorLog,
                status: 500,
                message: v.message,
                success: v.success,
            },
            req,
            res
        );
    }
};

export default handlers;
