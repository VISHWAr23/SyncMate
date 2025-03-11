import mongoose, { Schema, Document } from "mongoose";
import {
  Permissions,
  Roles,
} from "../enums/role.enum.js";
import { RolePermissions } from "../utils/role-permission.js";

// export interface RoleDocument extends Document {
//   name: RoleType;
//   permissions: Array<PermissionType>;
// }

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: Object.values(Roles),
      required: true,
      unique: true,
    },
    permissions: {
      type: [String],
      enum: Object.values(Permissions),
      required: true,
      default: function () {
        return RolePermissions[this.name];
      },
    },
  },
  {
    timestamps: true,
  }
);

const RoleModel = mongoose.model("Role", roleSchema);
export default RoleModel;
