import Student from "../models/student.models.js";
import Class from "../models/class.models.js";
import { isValidDate } from "../utils/isValidDate.js";

// Controller function to get all students with pagination, filtering, and sorting
const getAllStudents = async (req, res) => {
  try {
    let { page = 1, limit = 10, sortBy, sortOrder = "asc" } = req.query;

    // Parse pagination parameters
    page = parseInt(page);
    limit = parseInt(limit);

    // Validate pagination parameters
    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid pagination parameters." });
    }

    const skip = (page - 1) * limit;

    // Build query conditions
    const query = {};
    // if (name) query.name = { $regex: new RegExp(name, "i") };
    // if (gender) query.gender = gender;

    // Build sorting criteria
    const sortCriteria = {};
    if (sortBy) sortCriteria[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Fetch students with pagination, filtering, and sorting
    const [students, totalStudents] = await Promise.all([
      Student.find(query).sort(sortCriteria).limit(limit).skip(skip).exec(),
      Student.countDocuments(query),
    ]);

    // Validate edge case: Empty result set
    if (totalStudents === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No students found." });
    }

    res.status(200).json({
      totalStudents,
      totalPages: Math.ceil(totalStudents / limit),
      currentPage: page,
      students,
    });
  } catch (error) {
    console.log(error);
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
      path: "class",
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
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Controller function to create a new student
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
    if (
      [name, gender, dob, contactDetails, feesPaid].some(
        (field) => !field || field === ""
      )
    ) {
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

    // Check if student already exists with the given contactDetails, dob, and gender
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
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the student.",
    });
  }
};

// Controller function to update a student
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
    if (
      [name, gender, dob, contactDetails, feesPaid].some(
        (field) => !field || field === ""
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $set: { name, gender, dob, contactDetails, feesPaid, sassignedClass } },
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

// Controller function to delete a student
const deleteStudent = async (req, res) => {
  const studentId = req.params;
  console.log(req.params);

  try {
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found." });
    }

    const deletedStudent = await Student.deleteOne({ _id: student.studentId });

    res.json({ success: true, message: "Student deleted successfully." });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the student.",
    });
  }
};

// Controller function to get the count of male and female students in a class
const getClassGenderStats = async (req, res) => {
  const classId = req.params.classId;

  try {
    // Check if the class exists
    const classExists = await Class.exists({ _id: classId });
    if (!classExists) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found." });
    }

    const maleCount = await Student.countDocuments({
      sassignedClass: classId,
      gender: "male",
    });
    const femaleCount = await Student.countDocuments({
      sassignedClass: classId,
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

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
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
