import Model from "../../models/User.js";

export const userDB = {
  // Create a new document
  create: async (data) => {
    const result = await Model.create(data);
    return result;
  },
  // Find a single document by query
  find: async (query, filter = {}) => {
    const result = await Model.findOne(query, filter)
      .populate({
        path: "role",
        match: { existence: true },
        select: ["name", "permissions"],
      })
      .populate({
        path: "organization",
        match: { existence: true },
        select: ["name", "country", "region"],
      });
    return result;
  },
  // Find multiple documents by query
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
        path: "role",
        match: { existence: true },
        select: ["name", "permissions"],
      })
      .populate({
        path: "organization",
        match: { existence: true },
        select: ["name", "country", "region"],
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
  // Update a single document by query
  update: async (query, updateData) => {
    const result = await Model.findOneAndUpdate(query, updateData, {
      new: true,
    });
    // console.log("update user: ", result);
    return result;
  },
  // Get detailed information of a single document
  details: async (query) => {
    const result = await Model.findOne(query);
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
};
