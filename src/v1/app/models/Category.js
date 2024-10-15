import mongoose, { Mongoose } from "mongoose";

const field = {
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },

  // common field
  status: {
    // true or false
    type: Boolean,
    default: true,
  },
  existence: {
    // true and false
    type: Boolean,
    default: true,
  },
  updatedBy: {
    // @relation
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdBy: {
    // @relation
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
};

const appBenefitsCategorySchema = mongoose.Schema(field, { timestamps: true });

const BenefitsCategory = mongoose.model(
  "BenefitsCategory",
  appBenefitsCategorySchema
);

export default BenefitsCategory;
