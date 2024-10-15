// Importing the mongoose library for mongoDB connection
import mongoose from "mongoose";

// Retrieve the database URL from the environment variables
let dbURL = `${process.env.DB_URL}`;
console.log(dbURL);

/**
 * Function to connect to the MongoDB database  using Mongoose
 */
export default () => {
    console.log("connecting to DB...");
    console.log(dbURL);

    // Connect to the mongoDB database using the URL from the environment variables
    mongoose.set("strictQuery", true);
    mongoose.connect(dbURL, {
        // Additional options can be passed here, such as authentication credentials
    });

    // Get the Mongoose connection instance
    const db = mongoose.connection;

    // Event listeners for the Mongoose connection
    db.on("error", (error) => console.log(error));

    // Event listener for the Mongoose connection "open" event
    db.once("open", () => console.log("Mong DB connect success"));
};
