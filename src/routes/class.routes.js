import { Router } from "express";
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassGenderStatistics,
} from "../controllers/class.controllers.js";

const router = Router();
router.route("/").get(getAllClasses).post(createClass);
router.route("/:id").get(getClassById).put(updateClass).delete(deleteClass);
router.route("/:id/analytics").get(getClassGenderStatistics);

export default router;
