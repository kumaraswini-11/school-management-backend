import mongoose from "mongoose";
import { GENDER } from "../constants.js";

const { Schema } = mongoose;

const studentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Minimum length of the name should be 2 characters."],
    },
    gender: {
      type: String,
      enum: GENDER,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    contactDetails: {
      index: true,
      type: String,
      required: true,
      trim: true,
    },
    feesPaid: {
      type: Number,
      required: true,
    },
    sassignedClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
