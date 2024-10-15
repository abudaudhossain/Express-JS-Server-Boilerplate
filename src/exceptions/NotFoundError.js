/**
 * Custom error class for handing notfound errors.
 * Extends the built in Error class.
 * @extends Error
 */
export default class NotFoundError extends Error {
    /**
   * Create an instance of NotFoundError.
   * @param {String} message - The error message.
   */
    constructor(message) {
    // Call the constructor of the parent class (Error) with the error message
        super(message);
        // Set the name of the error to 'NotfoundError'
        this.name = "NotfoundError";
    }
}
