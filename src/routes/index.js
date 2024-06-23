import { Router } from "express";
import classRoutes from "./class.routes.js";
import studentRoutes from "./student.routes.js";
import teacherRoutes from "./teacher.routes.js";

const router = Router();
router.use("/classes", classRoutes);
router.use("/students", studentRoutes);
router.use("/teachers", teacherRoutes);

export default router;
