import mongoose from "mongoose";

const { Schema } = mongoose;

const classSchema = new Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      default: new Date().getFullYear(),
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    studentFees: {
      type: Number,
      default: 500,
      required: true,
    },
    limitStudents: {
      type: Number,
      default: 100,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Class", classSchema);
