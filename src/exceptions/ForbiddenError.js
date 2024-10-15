/**
 * Custom error class for handing forbidden errors.
 * Extends the built-in Error class.
 * @extends Error
 */
export default class ForbiddenError extends Error {
    /**
     * Create an instance of ForbiddenError
     * @param {string} message 
     */
    constructor(message) {

        // Call the constructor of the parent class (Error) with the error message
        super(message);

        // Set the error name to 'ForbiddenError'
        this.name = "ForbiddenError";
    }
}