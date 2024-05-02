import { Router } from "express";
import {
  getAllStudents,
  getStudentByID,
  createStudent,
  updateStudent,
  deleteStudent,
  getClassGenderStats,
  getAllStudentNames,
} from "../controllers/student.controllers.js";

const router = Router();
router.route("/students").get(getAllStudents);
router.route("/students/:id").get(getStudentByID);
router.route("/students").post(createStudent);
router.route("/students/:id").put(updateStudent);
router.route("/students/:id").delete(deleteStudent);
router.route("/students/class/:classId/gender-stats").get(getClassGenderStats);
router.route("/all-student-name").get(getAllStudentNames);

export default router;
