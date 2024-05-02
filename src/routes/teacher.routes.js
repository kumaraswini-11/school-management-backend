import { Router } from "express";
import {
  getAllTeachers,
  getTeacherByID,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getAnalytics,
  getAllTeachersName,
} from "../controllers/teacher.controllers.js";

const router = Router();
router.route("/teachers").get(getAllTeachers);
router.route("/teachers/:id").get(getTeacherByID);
router.route("/teachers").post(createTeacher);
router.route("/teachers/:id").put(updateTeacher);
router.route("/teachers/:id").delete(deleteTeacher);
router.route("/teachers/analytics").get(getAnalytics);
router.route("/all-teachers-name").get(getAllTeachersName);

export default router;
