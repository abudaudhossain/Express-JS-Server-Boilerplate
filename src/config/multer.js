// Importing the necessary packages
import multer from "multer";
import path from "path";
import fs from "fs";

// Middleware for handling file uploads using multer
export const multerMiddleware = multer().any();

// file upload folder
// Define the path where uploaded files will be stored. Default to './storage' if the environment variable UPLOADS_FOLDER is not set
const uploadsFolder = process.env.UPLOADS_FOLDER || "./storages";

// define the multer storage configuration
const storage = multer.diskStorage({
  // Specify the destination directory where uploaded files will be stored
  destination: (req, file, cb) => {
    cb(null, uploadsFolder);
  },

  // Define the filename for the uploaded file
  filename: (req, file, cb) => {
    // Get the file extension from the original filename
    const fileExtension = path.extname(file.originalname);

    // Generate a unique filename using the current timestamp and the file extension
    const fileName =
      file.originalname.replace(fileExtension, "").split(" ").join("_") +
      "_" +
      Date.now();

    // call the callback function with the generated file name
    cb(null, fileName + fileExtension);
  },
});

// Another storage configuration for handling multiple file storing
const filesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${uploadsFolder}`);
  },
  filename: (req, file, cb) => {
    // Get the file extension
    const fileExt = path.extname(file.originalname);

    // Generate a unique file name starting with "file_", based on the original name, current time, and remove spaces
    let fileName =
      "file_" +
      file.originalname
        .replace(fileExt, "")
        .toLowerCase()
        .split(" ")
        .join("_") +
      "_" +
      Date.now();

    // Call the callback function with the generated file name
    cb(null, fileName + fileExt);
  },
});

// Prepare the final multer upload object with th defined storage and file size limit for single file upload
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10000000, // 10MB
  },
});

// Prepare the final multer upload object with the defined storage for multiple file upload
export const multipleFileUpload = multer({
  storage: filesStorage,
});

// {
//   fieldname: 'avatar',
//   originalname: '439b2b48e3bc55f6c2c0a4144d09029b.jpg',
//   encoding: '7bit',
//   mimetype: 'image/jpeg',
//   destination: './storages',
//   filename: '439b2b48e3bc55f6c2c0a4144d09029b_1727678886724.jpg',
//   path: 'storages\\439b2b48e3bc55f6c2c0a4144d09029b_1727678886724.jpg',
//   size: 27318
// }

export const multerCustomFileStorage = (req, res, next) => {
  try {
    let files = {};
    req.files.forEach((file) => {
      const fileExt = path.extname(file.originalname);

      // Generate a unique file name starting with "file_", based on the original name, current time, and remove spaces
      let fileName =
        "file_" +
        file.originalname
          .replace(fileExt, "")
          .toLowerCase()
          .split(" ")
          .join("_") +
        "_" +
        Date.now() +
        fileExt;

      const filePath = path.join(
        req.rootDir,
        process.env.UPLOADS_FOLDER || "storages",
        fileName
      );
      fs.writeFileSync(filePath, file.buffer);

      files[file.fieldname] = {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        destination: `./${process.env.UPLOADS_FOLDER || "storages"}`,
        filename: fileName,
        path: path.join(process.env.UPLOADS_FOLDER || "storages", fileName),
        size: file.size,
      };
    });

    req.nativeFiles = files;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
