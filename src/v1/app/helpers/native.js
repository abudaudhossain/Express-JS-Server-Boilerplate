/**
 * Sends a standardized response to the client
 *
 * @param {Object} v - Object containing the response data or details
 * @param {Object} v.errorLog - Error log details for debugging
 * @param {Object} v.data - Data to be sent to the response
 * @param {Object} v.meta - Meta data to be sent to the response
 * @param {String} v.message - Message to be sent to the response
 * @param {Boolean} v.success - Success status of the response
 * @param {Number} v.status - HTTP status code to be sent to the response
 *
 * @param {Object} req - Express request object.
 * @param {Object} res  - Express response Object.
 */

const response = async (v, req, res) => {
    // Log the request api endpoint and the response time
    console.log(
        "request api endpoint: ",
        req.originalUrl,
        " ==> response time ",
        new Date().toLocaleString()
    );

    try {
        // Call the response helper function to send the response
        responseHelper(
            {
                errorLog: v.errorLog,
                data: v.data,
                meta: v.meta,
                message: v.message,
                success: v.success,
            },
            v?.status,
            res
        );
    } catch (error) {
        // Log any errors and send a response using the response helper function
        console.log(error);
        responseHelper(
            {
                errorLog: v.errorLog,
                data: v.data,
                meta: v.meta,
                message: v.message,
                success: v.success,
            },
            v?.status,
            res
        );
    }
};

/**
 *
 * @param {Object} v - Object containing the response data or details.
 * @param {Object} v.errorLog - Error log details for debugging.
 * @param {Object} v.data - Data to be sent to the response.
 * @param {Object} v.meta - Meta data to be sent to the response.
 * @param {String} v.message - Message to be sent to the response.
 * @param {Boolean} v.success - Success status of the response.
 * @param {Number} v.status - HTTP status code to be sent to the response.
 *
 * @param {*} res - Express response object.
 */

const responseHelper = (v, status, res) => {
    // Construct the response object
    let response = {
        resState: status,
        success: v.success,
        message: v.message,
    };
    // If errorLog is present, set it as the errorLog property , otherwise include data and meta in the response object
    if (v?.errorLog?.location) {
        response.errorLog = v.errorLog;
    } else {
        response.data = v.data;
        response.meta = v.meta;
    }

    // Send the response with the appropriate status code
    res.status(status).json(response);
};

export default response;
