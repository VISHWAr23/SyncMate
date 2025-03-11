// models/user.model.js
import mongoose from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt.js";

/**
 * @typedef {Object} UserDocument
 * @property {string} name
 * @property {string} email
 * @property {string} [password]
 * @property {string} profilePicture
 * @property {boolean} isActive
 * @property {Date} lastLogin
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {mongoose.Types.ObjectId} [currentWorkspace]
 * @property {function(string): Promise<boolean>} comparePassword
 * @property {function(): Omit<UserDocument, "password">} omitPassword
 */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, select: true },
    profilePicture: {
      type: String,
      default: null,
    },
    currentWorkspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }
  next();
});

// Method to omit password from user object
userSchema.methods.omitPassword = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Method to compare passwords
userSchema.methods.comparePassword = async function (value) {
  return compareValue(value, this.password);
};

// Create and export the User model
const UserModel = mongoose.model("User", userSchema);
export default UserModel;