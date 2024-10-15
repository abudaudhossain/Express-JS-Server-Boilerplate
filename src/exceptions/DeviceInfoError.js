/**
 * Custom error class for handing device info errors.
 * Extends the built-in Error class.
 * @extends Error
 */

export default class DeviceInfoError extends Error {
    /**
   * Create an instance of  DeviceInfoError
   * @param {string} message - The error message
   */
    constructor(message) {

        // Call the constructor of the parent class (Error) with the error message
        super(message);
    
        // Set the error name to 'DeviceInfoError'
        this.name = "DeviceInfoError";
    }
}
