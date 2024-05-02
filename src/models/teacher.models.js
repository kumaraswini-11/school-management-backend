import mongoose from "mongoose";
import { GENDER } from "../constants.js";

const { Schema } = mongoose;

const teacherSchema = new Schema(
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
      type: String,
      required: true,
      trim: true,
    },
    salary: {
      // consider - this is teacher's annual salary
      type: Number,
      required: true,
    },
    tassignedClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Teacher", teacherSchema);
