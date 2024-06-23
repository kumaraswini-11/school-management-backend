import mongoose from "mongoose";
import { GENDER } from "../constants.js";

const { Schema } = mongoose;

const studentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    feesPaid: { type: Number, required: true, min: 0 },
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose
            .model("Class")
            .findById(v)
            .then((cls) => cls.students.length < cls.studentLimit);
        },
        message: "Class is full",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
