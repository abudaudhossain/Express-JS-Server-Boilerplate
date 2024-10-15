// Import required modules and configurations
import "dotenv/config"; // Load environment variables
import NotFoundError from "./src/exceptions/NotFoundError.js"; // Custom NotFoundError exception
import app from "./src/app.js"; // Express app instance
import handlers from "./src/exceptions/handlers.js"; // Error handling middleware

// Define the server port from environment variables or use default 5000
const port = process.env.PORT || 5000;

// Middleware to handle 404 Not Found errors
app.use((req, res, next) => {
  const error = new NotFoundError("API Endpoint Not Found");
  error.status = 404;
  next(error); // Pass the error to the next middleware
});

// Error handling middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500); // Set the response status code
  // Send error response using the custom handlers function
  handlers(
    {
      errorLog: {
        location: req.originalUrl.split("/").join("::"), // Log the error location
        details: `Error: ${error}`, // Log error details
      },
      message: error.message, // Error message
      success: false, // Indicate the failure
      error, // Error object
    },
    req,
    res
  );
});

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// Uncomment the following lines if you need to bind the server to a specific IP address
// app.listen(port, "172.16.10.224", () => {
//   console.log(`Listening on port ${port}`);
// });
