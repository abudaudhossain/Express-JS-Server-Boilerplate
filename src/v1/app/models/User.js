import mongoose from "mongoose";

// Define the schema fields
const field = {
  name: {
    type: String,
    default: null, // Default value if not provided
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: null, // Default value if not provided
  },
  password: {
    type: String,
    required: true, // This field is required
  },
  avatar: {
    type: String,
    default: null, // Default value if not provided
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },

  fcmTokens: [String],
  accessTokens: [String],
  lastLogAt: {
    type: Date,
  },
  otp: {
    type: String,
  },
  otpExpireTime: {
    type: Date,
  },

  permissions: {
    type: Object,
  },
  isActivated: {
    type: Boolean,
    default: false, // Default value if not provided
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  status: {
    type: Boolean,
    default: true, // Default value if not provided
  },
  existence: {
    type: Boolean,
    default: true, // Default value if not provided
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
  },
};

// Create a new schema using the defined fields
const appUserSchema = mongoose.Schema(field, { timestamps: true });

// Create a model using the schema
const User = mongoose.model("User", appUserSchema);

// Export the model
export default User;
