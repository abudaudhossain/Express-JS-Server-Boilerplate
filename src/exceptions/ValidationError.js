/**
 * Custom error class for handing Validation errors.
 * Extends the  built to Error class
 * @extends Error - built in Error class
 */
export default class ValidationError extends Error {
    /**
   * Create an instance of the ValidationError class
   * @param {String} message - The error message
   */
    constructor(message) {
    // Call the constructor of the parent class (Error) with the error message
        super(message);
        // Set the name of the error to 'ValidationError'
        this.name = "ValidationError";
    }
}
