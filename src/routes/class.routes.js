import { Router } from "express";
import {
  getAllClasses,
  getClassByID,
  createClass,
  updateClass,
  deleteClass,
  getAllClassesGenderCountsStatistics,
  getClassGenderCountsStatistics,
  getAllClassNames,
} from "../controllers/class.controllers.js";

const router = Router();
router.route("/classes").get(getAllClasses);
router.route("/classes/:id").get(getClassByID);
router.route("/classes").post(createClass);
router.route("/classes/:id").put(updateClass);
router.route("/classes/:id").delete(deleteClass);
// router.route("/classes/graph").get(getAllClassesGenderCountsStatistics);
router.route("/classes/graph/:id").get(getClassGenderCountsStatistics);
router.route("/all-classes-name").get(getAllClassNames);

export default router;
