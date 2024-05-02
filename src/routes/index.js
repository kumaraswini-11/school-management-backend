import { Router } from "express";
import studentRouters from "./student.routes.js";
import teacherRouters from "./teacher.routes.js";
import classRouters from "./class.routes.js";

const router = Router();
router.use(studentRouters);
router.use(teacherRouters);
router.use(classRouters);

export default router;
