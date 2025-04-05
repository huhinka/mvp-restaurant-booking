import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["guest", "staff"],
      default: "guest",
    },
    phone: {
      type: String,
      match: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
      sparse: true,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

userSchema.methods.isStaff = function () {
  return this.role === "staff";
};

export const User = mongoose.model("User", userSchema);
