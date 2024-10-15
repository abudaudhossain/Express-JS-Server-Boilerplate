/**
 * Making filter
 *
 * @param {String []} fields - The fields contains filter item keys
 *
 * @returns {Object} - The filter object
 */

export const getFilter = (fields) => {
    let filter = {};
    if (typeof fields == "string") {
        fields = [fields];
    }
    if (fields?.length > 0) {
        fields?.forEach((item) => {
            filter[item] = 1;
        });
    }

    return filter;
};
