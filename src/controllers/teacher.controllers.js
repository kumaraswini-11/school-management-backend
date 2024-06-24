import Teacher from "../models/teacher.models.js";
import Class from "../models/class.models.js";
import Student from "../models/student.models.js";
import { validatePaginationParams } from "../utils/validatePagination.js";

const getAllTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (!validatePaginationParams(pageNum, limitNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters.",
      });
    }

    const skip = (pageNum - 1) * limitNum;

    const [teachers, totalTeachers] = await Promise.all([
      Teacher.find()
        .skip(skip)
        .limit(limitNum)
        .populate("assignedClass", "name")
        .exec(),
      Teacher.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: teachers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalTeachers / limitNum),
        totalTeachers,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching teachers.",
    });
  }
};

const getTeacherById = async (req, res) => {
  const { id } = req.params;

  try {
    const teacher = await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const createTeacher = async (req, res) => {
  try {
    const { name, gender, dob, email, phone, salary } = req.body;

    if (!name || !gender || !dob || !email || !phone || !salary) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const newTeacher = new Teacher({
      name,
      gender,
      dob: new Date(dob),
      contactDetails: { email, phone },
      salary,
    });

    const savedTeacher = await newTeacher.save();

    res.status(201).json({
      success: true,
      data: savedTeacher,
    });
  } catch (error) {
    console.error("Error creating teacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create teacher. Please try again.",
    });
  }
};

const updateTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    const { name, gender, dob, email, phone, salary } = req.body;

    if (!name || !gender || !dob || !email || !phone || !salary) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      id,
      {
        name,
        gender,
        dob: new Date(dob),
        contactDetails: { email, phone },
        salary,
      },
      { new: true }
    );

    if (!updatedTeacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found or could not be updated.",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTeacher,
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update teacher. Please try again.",
    });
  }
};

const deleteTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if teacher is assigned to any class
    const teacherAssigned = await Class.exists({ teacher: id });
    if (teacherAssigned) {
      return res.status(400).json({
        success: false,
        message:
          "Teacher cannot be deleted as they are assigned to one or more classes.",
      });
    }

    const deletedTeacher = await Teacher.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found or already deleted.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Teacher deleted successfully.",
      data: deletedTeacher,
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete teacher. Please try again.",
    });
  }
};

const getTeacherAnalytics = async (req, res) => {
  try {
    const { view, month, year } = req.query;

    if (!["monthly", "yearly"].includes(view)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid view parameter" });
    }

    if (view === "monthly" && (!month || !year)) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required for monthly view",
      });
    }

    if (view === "yearly" && !year) {
      return res
        .status(400)
        .json({ success: false, message: "Year is required for yearly view" });
    }

    const matchStage = {
      $match: {
        $expr: {
          $and: [
            { $eq: [{ $year: "$createdAt" }, parseInt(year)] },
            ...(view === "monthly"
              ? [{ $eq: [{ $month: "$createdAt" }, parseInt(month)] }]
              : []),
          ],
        },
      },
    };

    const totalTeacherExpenses = await Teacher.aggregate([
      matchStage,
      { $group: { _id: null, totalSalary: { $sum: "$salary" } } },
    ]);

    const totalStudentIncome = await Student.aggregate([
      matchStage,
      { $group: { _id: null, totalFeesPaid: { $sum: "$feesPaid" } } },
    ]);

    res.status(200).json({
      success: true,
      expenses: totalTeacherExpenses[0]?.totalSalary || 0,
      income: totalStudentIncome[0]?.totalFeesPaid || 0,
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching analytics data",
    });
  }
};

export {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherAnalytics,
};
