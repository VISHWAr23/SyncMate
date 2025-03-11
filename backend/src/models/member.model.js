import mongoose, { Document, Schema } from "mongoose";

// export interface MemberDocument extends Document {
//   userId: mongoose.Types.ObjectId;
//   workspaceId: mongoose.Types.ObjectId;
//   role: RoleDocument;
//   joinedAt: Date;
// }

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MemberModel = mongoose.model("Member", memberSchema);
export default MemberModel;
