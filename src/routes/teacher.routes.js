import { Router } from "express";
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherAnalytics,
  // getAllTeacherNames,
} from "../controllers/teacher.controllers.js";

const router = Router();
router.route("/").get(getAllTeachers).post(createTeacher);
router
  .route("/:id")
  .put(updateTeacher)
  .delete(deleteTeacher)
  .get(getTeacherById);
router.route("/analytics").get(getTeacherAnalytics);
// router.route("/all-teachers-name").get(getAllTeacherNames);

export default router;
