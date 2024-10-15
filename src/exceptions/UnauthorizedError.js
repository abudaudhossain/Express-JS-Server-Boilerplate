/**
 * Custom error class for handing unauthorized errors.
 * Extends the build in Error class.
 * @extends Error
 */
export default class UnauthorizedError extends Error {
    /**
   * Create an instance of UnauthorizedError.
   * @param {String} message - The error message
   */
    constructor(message) {
    // Call the constructor of the parent class (Error) with the error message
        super(message);
        // Set the name of the error to UnauthorizedError
        this.name = "UnauthorizedError";
    }
}
