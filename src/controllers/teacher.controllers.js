import Teacher from "../models/teacher.models.js";
import Student from "../models/student.models.js";
import { isValidDate } from "../utils/isValidDate.js";

// Controller function to get all teachers with pagination, filtering, and sorting
const getAllTeachers = async (req, res) => {
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

    // Fetch teachers with pagination, filtering, and sorting
    const [teachers, totalTeachers] = await Promise.all([
      Teacher.find(query)
        .sort(sortCriteria)
        .limit(limit)
        .skip(skip)
        .populate({
          path: "tassignedClass",
          select: "className",
        })
        .exec(),
      Teacher.countDocuments(query),
    ]);

    // Validate edge case: Empty result set
    if (totalTeachers === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No teachers found." });
    }

    res.status(200).json({
      totalTeachers,
      totalPages: Math.ceil(totalTeachers / limit),
      currentPage: page,
      teachers: teachers.map(
        ({
          _id,
          name,
          gender,
          dob,
          contactDetails,
          salary,
          tassignedClass,
        }) => ({
          _id,
          name,
          gender,
          dob,
          contactDetails,
          salary,
          tassignedClass: tassignedClass ? tassignedClass.className : null,
        })
      ),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching teachers.",
    });
  }
};

const getTeacherByID = async (req, res) => {
  const { id } = req.params;

  try {
    const teacher = await Teacher.findById(id).populate({
      path: "tassignedClass",
      select: "_id className",
    });

    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found." });
    }

    res.status(200).json({
      success: true,
      teacher,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Controller function to create a new teacher
const createTeacher = async (req, res) => {
  const {
    name,
    gender,
    dob,
    email: contactDetails,
    salary,
    class: tassignedClass,
  } = req.body;

  console.log(req.body);
  try {
    // Validate required fields
    if (
      [name, gender, dob, contactDetails, salary, tassignedClass].some(
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

    // Check if teacher already exists with the given contactDetails, dob, and gender
    const existedTeacher = await Teacher.findOne({
      contactDetails,
      dob,
      gender,
    });
    if (existedTeacher) {
      return res
        .status(400)
        .json({ success: false, message: "Teacher already exists." });
    }

    // Create new teacher
    const newTeacher = await Teacher.create({
      name,
      gender,
      dob,
      contactDetails,
      salary,
      tassignedClass,
    });
    res.status(201).json({ success: true, newTeacher });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the teacher.",
    });
  }
};

// Controller function to update a teacher
const updateTeacher = async (req, res) => {
  const teacherId = req.params.id;
  const {
    name,
    gender,
    dob,
    email: contactDetails,
    salary,
    class: tassignedClass,
  } = req.body;

  try {
    // Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found." });
    }

    // Validate required fields
    if (
      [name, gender, dob, contactDetails, salary, tassignedClass].some(
        (field) => !field || field.trim() === ""
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { $set: { name, gender, dob, contactDetails, salary, tassignedClass } },
      { new: true }
    );
    res.status(200).json({ success: true, updatedTeacher });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the teacher.",
    });
  }
};

// Controller function to delete a teacher
const deleteTeacher = async (req, res) => {
  const teacherId = req.params.id;

  try {
    // Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found." });
    }

    const deletedTeacher = await Teacher.deleteOne({ _id: teacher._id });

    res.json({ success: true, message: "Teacher deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the teacher.",
    });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const { view, month, year } = req.query;
    console.log(view, month, year);

    if (view !== "monthly" && view !== "yearly") {
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

    let matchQuery = {};
    if (view === "monthly") {
      matchQuery.createdAt = {
        $gte: new Date(`${year}-${month}-01T00:00:00.000Z`),
        $lte: new Date(`${year}-${month}-31T23:59:59.999Z`),
      };
    } else {
      // Yearly view
      matchQuery.createdAt = {
        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
        $lte: new Date(`${year}-12-31T23:59:59.999Z`),
      };
    }

    const totalTeacherExpenses = await Teacher.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, totalSalary: { $sum: "$salary" } } },
    ]);

    const totalStudentIncome = await Student.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, totalFeesPaid: { $sum: "$feesPaid" } } },
    ]);

    const analyticsData = {
      totalTeacherExpenses:
        totalTeacherExpenses.length > 0
          ? totalTeacherExpenses[0].totalSalary
          : 0,
      totalStudentIncome:
        totalStudentIncome.length > 0 ? totalStudentIncome[0].totalFeesPaid : 0,
    };

    res.status(200).json({
      success: true,
      expenses: analyticsData.totalTeacherExpenses,
      income: analyticsData.totalStudentIncome,
    });
  } catch (error) {
    // console.error("Error fetching analytics data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching analytics data",
    });
  }
};

const getAllTeachersName = async (req, res) => {
  try {
    const teachers = await Teacher.find({}, "_id name");

    res.status(200).json({
      success: true,
      teachers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export {
  getAllTeachers,
  getTeacherByID,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getAnalytics,
  getAllTeachersName,
};
