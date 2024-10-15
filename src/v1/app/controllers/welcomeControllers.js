import handlers from "../../../exceptions/handlers.js";
import response from "../../../utils/native.js";

const welcomeControllers = {
    welcomeHandler: async (req, res) => {
        try {
            console.log("req", req.nativeRequest);

            response(
                {
                    success: true,
                    message: "Data loaded Successful",
                    data: "welcome to api",
                    status: 200,
                },
                req,
                res
            );
        } catch (error) {
            console.log(error);
            handlers(
                {
                    errorLog: {
                        location: req.originalUrl.split("/").join("::"),
                        details: `Error: ${error}`,
                    },
                    message: error.message,
                    success: false,
                    error,
                },
                req,
                res
            );
        }
    },
};

export default welcomeControllers;
