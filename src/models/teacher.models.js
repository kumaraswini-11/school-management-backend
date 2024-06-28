import mongoose from "mongoose";
import { GENDER } from "../constants.js";

const { Schema } = mongoose;

const teacherSchema = new Schema(
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
      email: { type: String, required: true, trim: true, unique: true },
      phone: { type: String, required: true, trim: true, unique: true },
    },
    salary: {
      // salary can be ['monthly', 'yearly']. I m considering monthly.
      type: Number,
      required: true,
      min: 0,
    },
    assignedClass: {
      type: Schema.Types.ObjectId,
      ref: "Class",
    },
  },
  { timestamps: true }
);

// Update assignedClass field in Teacher model when Class is updated
// teacherSchema.pre("findOneAndUpdate", async function (next) {
//   const docToUpdate = await this.model.findOne(this.getFilter());
//   const update = this.getUpdate();

//   // Check if `assignedClass` field is updated
//   if (
//     update.assignedClass &&
//     docToUpdate.assignedClass !== update.assignedClass
//   ) {
//     // Update associated Class's teacher field
//     await this.model("Class").findByIdAndUpdate(update.assignedClass, {
//       teacher: this._id,
//     });
//   }

// next();
// });

export default mongoose.model("Teacher", teacherSchema);
