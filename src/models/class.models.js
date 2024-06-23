import mongoose from "mongoose";

const { Schema } = mongoose;

const classSchema = new Schema(
  {
    name: {
      // Not mention whether classes are categorized by grade level (e.g., 1st grade, 2nd grade) or by subject (e.g., Math, English). Therefore, i choosed to go with subject for simplicity.
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      default: new Date().getFullYear(),
    },
    teacher: {
      // Teacher and Class relationship can be 1:1, 1:N, N:N. Again for simplicity, i m going with 1:1.
      // Each class has one teacher.
      // Each teacher is assigned to one class, but this field can be null initially (until a teacher is assigned).
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
    studentFees: {
      type: Number,
      required: true,
    },
    students: [
      // Class and Student - 1:N.
      // Each class can have many students (up to a specified limit).
      // Each student belongs to one class.
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    studentLimit: {
      type: Number,
      default: 30,
      min: 1,
    },
  },
  { timestamps: true }
);

// Cascade delete students when a class is deleted
classSchema.pre("remove", async function (next) {
  try {
    await this.model("Student").deleteMany({ class: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("Class", classSchema);
