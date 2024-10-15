// Importing custom error  class
import NotFoundError from "../exceptions/NotFoundError.js";

/**
 *
 * @param {String[]} keys - Array of keys to check in the object.
 * @param {Object} obj - The object to check for the presence of keys.
 * @param {String} flag - Optional flag to add to the error message.
 * @returns {boolean} - True if the object contains all the keys,
 * @throws {NotFoundError} - Throws a NotFoundError if any key is massing from the object.
 */
export const ObjExists = (keys, obj, flag = "") => {
    // Initialize an empty array to store the error messages
    let message = [];

    // Iterate over the keys array and check if the object contains the key
    for (let key of keys) {
        // Check if the object contains the key
    
        if (!Object.hasOwn(obj, key)) {
            // Add a message for each missing key
            message.push(`${key} field is required${flag}.`);
        }
    }

    // If there are any error messages, throw a NotFoundError with the collected error messages
    if (message.length > 0) {
        throw new NotFoundError(message);
    } else {
        // If there are no error messages, return true
        return true;
    }
};
