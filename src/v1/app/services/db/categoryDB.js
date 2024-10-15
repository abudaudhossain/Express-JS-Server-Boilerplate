import ValidationError from "../../../../exceptions/ValidationError.js";
import Model from "../../models/Category.js";

export const categoryDB = {
  // Create a new document
  create: async (data) => {
    try {
      const result = await Model.create(data);
      return result;
    } catch (error) {
      console.log(error);
      if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
        // Custom error message for duplicate document name
        throw new ValidationError(
          `Document with the name '${error.keyValue.name}' already exists. Please use a different name.`
        );
      } else {
        let err = error?.errors[Object.keys(error?.errors)[0]];
        if (
          err?.name === "CastError" &&
          (err?.kind === "ObjectId" || err.kind == "[ObjectId]") &&
          err
        ) {
          throw new ValidationError(
            "Invalid Id format. Please provide a valid ObjectId for the " +
              err.path +
              " field."
          );
        } else if (err.name === "CastError" && err.kind === "date") {
          throw new ValidationError(
            "Invalid date format. Please provide a valid date for " + err.path
          );
        }

        throw new ValidationError(error.message);
      }
    }
  },
  // Find a single document by query
  find: async (query, filter = {}) => {
    const result = await Model.findOne(query, filter).populate({
      path: "createdBy",
      match: { existence: true },
      select: ["name", "avatar"],
    });

    return result;
  },

  // Update a single document by query
  update: async (query, updateData) => {
    try {
      const result = await Model.findOneAndUpdate(query, updateData, {
        new: true,
      });

      return result;
    } catch (error) {
      if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
        // Custom error message for duplicate document name
        throw new ValidationError(
          `Document with the name '${error.keyValue.name}' already exists. Please use a different name.`
        );
      } else if (error.name === "CastError" && error.kind === "date") {
        let field = error.path.split(".")[1]
          ? error.path.split(".")[1]
          : error.path.split(".")[0];
        throw new ValidationError(
          "Invalid date format. Please provide a valid date for " + field
        );
      } else if (
        error?.name === "CastError" &&
        (error?.kind === "ObjectId" || error.kind == "[ObjectId]") &&
        error
      ) {
        throw new ValidationError(
          "Invalid Id format. Please provide a valid ObjectId for the " +
            error.path +
            " field."
        );
      } else {
        throw new ValidationError(error.message);
      }
    }
  },
  finds: async (
    query,
    filter = {},
    startIndex = null,
    limit = null,
    sort = {}
  ) => {
    console.log(query);
    const result = await Model.find(query, filter)
      .populate({
        path: "createdBy",
        match: { existence: true },
        select: ["name", "avatar"],
      })
      .skip(startIndex)
      .limit(limit)
      .sort(sort);
    return result;
  },
  // Count the total number of documents matching the query
  totalCount: async (query) => {
    const result = await Model.countDocuments(query);
    return result;
  },

  // Delete a single document by query
  deleteOne: async (query) => {
    const result = await Model.deleteOne(query);
    return result;
  },
  // Delete multiple documents by query
  deleteMany: async (query) => {
    const result = await Model.deleteMany(query);
    console.log("Deleted items:", result);
    return result;
  },

  findOne: async (query, filter = {}) => {
    const result = await Model.findOne(query, filter);
    return result;
  },
};
