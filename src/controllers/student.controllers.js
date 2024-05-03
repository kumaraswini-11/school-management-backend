import Student from "../models/student.models.js";
import Class from "../models/class.models.js";
import { isValidDate } from "../utils/isValidDate.js";

const getAllStudents = async (req, res) => {
  const { page = 1, limit = 10, sortBy, sortOrder = "asc" } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const query = {};
    const sortCriteria = sortBy
      ? { [sortBy]: sortOrder === "asc" ? 1 : -1 }
      : {};

    // Fetch students with pagination, filtering, and sorting
    const students = await Student.find(query)
      .populate({
        path: "sassignedClass",
        select: "_id className",
      })
      .sort(sortCriteria)
      .limit(parseInt(limit))
      .skip(skip)
      .lean()
      .exec();

    const totalStudents = await Student.countDocuments(query);

    if (students.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No students found." });
    }

    res.status(200).json({
      totalStudents,
      totalPages: Math.ceil(totalStudents / limit),
      currentPage: parseInt(page),
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching students.",
    });
  }
};

const getStudentByID = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id).populate({
      path: "sassignedClass",
      select: "_id className",
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found." });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const createStudent = async (req, res) => {
  const {
    studentName: name,
    gender,
    dob,
    email: contactDetails,
    paid: feesPaid,
    class: sassignedClass,
  } = req.body;

  try {
    // Validate required fields
    const requiredFields = [name, gender, dob, contactDetails, feesPaid];
    if (requiredFields.some((field) => !field || field === "")) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    // Validate date of birth format
    if (!isValidDate(dob)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date of birth format. Please provide a valid date.",
      });
    }

    // Check if student already exists
    const existedStudent = await Student.findOne({
      contactDetails,
      dob,
      gender,
    });
    if (existedStudent) {
      return res
        .status(400)
        .json({ success: false, message: "Student already exists." });
    }

    // Create new student
    const newStudent = await Student.create({
      name,
      gender,
      dob,
      contactDetails,
      feesPaid,
      sassignedClass,
    });
    res.status(201).json({ success: true, newStudent });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the student.",
    });
  }
};

const updateStudent = async (req, res) => {
  const studentId = req.params.id;
  const {
    studentName: name,
    gender,
    dob,
    email: contactDetails,
    paid: feesPaid,
    class: sassignedClass,
  } = req.body;

  try {
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found." });
    }

    // Validate required fields
    const requiredFields = [name, gender, dob, contactDetails, feesPaid];
    if (requiredFields.some((field) => !field || field === "")) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        $set: { name, gender, dob, contactDetails, feesPaid, sassignedClass },
      },
      { new: true }
    );

    res.status(200).json({ success: true, updatedStudent });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the student.",
    });
  }
};

const deleteStudent = async (req, res) => {
  const studentId = req.params.id;

  try {
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found." });
    }

    await Student.deleteOne({ _id: studentId });

    res.json({ success: true, message: "Student deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the student.",
    });
  }
};

const getClassGenderStats = async (req, res) => {
  const classId = req.params.classId;

  try {
    const classExists = await Class.exists({ _id: classId });
    if (!classExists) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found." });
    }

    const maleCount = await Student.countDocuments({
      assignedClass: classId,
      gender: "male",
    });
    const femaleCount = await Student.countDocuments({
      assignedClass: classId,
      gender: "female",
    });

    res.status(200).json({ maleCount, femaleCount });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching class gender stats.",
    });
  }
};

const getAllStudentNames = async (req, res) => {
  try {
    const students = await Student.find({}, "_id name");

    res.status(200).json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export {
  getAllStudents,
  getStudentByID,
  createStudent,
  updateStudent,
  deleteStudent,
  getClassGenderStats,
  getAllStudentNames,
};
