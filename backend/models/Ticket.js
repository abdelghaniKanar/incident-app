import { Schema, model } from "mongoose";

const ticketSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    request: { type: String, required: true },
    response: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "on review", "reviewed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default model("Ticket", ticketSchema);
