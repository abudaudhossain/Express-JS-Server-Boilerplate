/**
 * Custom error class for handling access token errors.
 * Extends the built-in Error class.
 * @extends Error
 */
export default class AccessTokenError extends Error {
    /**
   * Creates an instance of AccessTokenError.
   * @param {string} message - The error message.
   */
    constructor(message) {

        // Call the constructor of the parent class (Error) with the error message
        super(message);
    
        // Set the error name to 'AccessTokenError'
        this.name = "AccessTokenError";
    }
}
