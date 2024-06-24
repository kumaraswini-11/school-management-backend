import { Router } from "express";
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherAnalytics,
} from "../controllers/teacher.controllers.js";

const router = Router();
router.route("/finance-analytics").get(getTeacherAnalytics);

router.route("/").get(getAllTeachers).post(createTeacher);
router
  .route("/:id")
  .put(updateTeacher)
  .delete(deleteTeacher)
  .get(getTeacherById);

export default router;
