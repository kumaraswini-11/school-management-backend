import Student from "../models/student.models.js";
import Class from "../models/class.models.js";
import { validatePaginationParams } from "../utils/validatePagination.js";

const getAllStudents = async (req, res) => {
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

    const [students, totalStudents] = await Promise.all([
      Student.find()
        .skip(skip)
        .limit(limitNum)
        .populate("class", "name")
        .exec(),
      Student.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalStudents / limitNum),
        totalStudents,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching students.",
    });
  }
};

const getStudentById = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const createStudent = async (req, res) => {
  try {
    const {
      name,
      gender,
      dob,
      email,
      phone,
      feesPaid,
      class: classId,
    } = req.body;

    if (!name || !gender || !dob || !email || !phone || !feesPaid || !classId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const newStudent = new Student({
      name,
      gender,
      dob: new Date(dob),
      contactDetails: { email, phone },
      feesPaid,
      class: classId,
    });

    const savedStudent = await newStudent.save();

    res.status(201).json({
      success: true,
      data: savedStudent,
    });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create student. Please try again.",
    });
  }
};

const updateStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      name,
      gender,
      dob,
      email,
      phone,
      feesPaid,
      class: classId,
    } = req.body;

    if (!name || !gender || !dob || !email || !phone || !feesPaid || !classId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        name,
        gender,
        dob: new Date(dob),
        contactDetails: { email, phone },
        feesPaid,
        class: classId,
      },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found or could not be updated.",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update student. Please try again.",
    });
  }
};

const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found or already deleted.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully.",
      data: deletedStudent,
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete student. Please try again.",
    });
  }
};

const getStudentGenderStats = async (req, res) => {
  const classId = req.params.classId;

  try {
    const classExists = await Class.exists({ _id: classId });
    if (!classExists) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found." });
    }

    const maleCount = await Student.find({
      class: classId,
      gender: "Male",
    }).countDocuments();
    const femaleCount = await Student.find({
      class: classId,
      gender: "Female",
    }).countDocuments();

    res.status(200).json({ maleCount, femaleCount });
  } catch (error) {
    console.error("Error fetching class gender stats:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching class gender stats.",
    });
  }
};

export {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentGenderStats,
};
