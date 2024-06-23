import { Router } from "express";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentGenderStats,
} from "../controllers/student.controllers.js";

const router = Router();
router.route("/").get(getAllStudents).post(createStudent);
router
  .route("/:id")
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);
router.route("/:id/analytics").get(getStudentGenderStats);

export default router;
