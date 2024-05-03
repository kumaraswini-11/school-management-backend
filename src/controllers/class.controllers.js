import mongoose from "mongoose";
import Class from "../models/class.models.js";

// Constants for sortOrder
const SORT_ORDERS = {
  ASC: "asc",
  DESC: "desc",
};

const getAllClasses = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      sortBy,
      sortOrder = SORT_ORDERS.ASC,
    } = req.query;

    // Validate pagination parameters
    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid pagination parameters." });
    }

    const skip = (page - 1) * limit;

    // Build sorting criteria
    const sortCriteria = {};
    if (sortBy) sortCriteria[sortBy] = sortOrder === SORT_ORDERS.ASC ? 1 : -1;

    // Fetch classes with pagination, filtering, and sorting
    const [classes, totalClasses] = await Promise.all([
      Class.find().sort(sortCriteria).limit(limit).skip(skip).exec(),
      Class.countDocuments(),
    ]);

    // Validate edge case: Empty result set
    if (totalClasses === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No classes found." });
    }

    res.status(200).json({
      totalClasses,
      totalPages: Math.ceil(totalClasses / limit),
      currentPage: page,
      classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching classes.",
    });
  }
};

const getClassByID = async (req, res) => {
  const { id } = req.params;

  try {
    const classes = await Class.findById(id).populate([
      {
        path: "teacher",
        select: "_id name",
      },
      {
        path: "students",
        select: "_id name",
      },
    ]);

    if (!classes) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found." });
    }

    res.status(200).json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const createClass = async (req, res) => {
  const {
    className,
    classFee: studentFees,
    maxLimit: limitStudents,
    teacherAssigned: teacher,
    students,
  } = req.body;

  try {
    // Validate required fields
    if (
      [className, studentFees, limitStudents, teacher].some(
        (field) => !field || field === ""
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    // Create new class
    const newClass = await Class.create({
      className,
      studentFees,
      limitStudents,
      teacher,
      students,
    });

    res.status(201).json({ success: true, newClass });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the class.",
    });
  }
};

const updateClass = async (req, res) => {
  const classId = req.params.id;
  const {
    className,
    teacherAssigned: teacher,
    classFee: studentFees,
    students,
    maxLimit: limitStudents,
  } = req.body;

  try {
    // Check if class exists
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found." });
    }

    // Validate required fields
    if (
      [className, teacher, studentFees, limitStudents].some(
        (field) => !field || field === ""
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    // Update class
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      {
        $set: {
          className,
          teacher,
          studentFees,
          limitStudents,
          students,
        },
      },
      { new: true }
    );

    res.status(200).json({ success: true, updatedClass });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the class.",
    });
  }
};

const deleteClass = async (req, res) => {
  const classId = req.params.id;

  try {
    // Check if class exists
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found." });
    }

    await Class.deleteOne({ _id: classId });

    res.json({ success: true, message: "Class deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the class.",
    });
  }
};

const getAllClassesGenderCountsStatistics = async (req, res) => {
  try {
    const classData = await Class.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "students",
          foreignField: "_id",
          as: "studentsInfo",
        },
      },
      {
        $project: {
          _id: 1,
          className: 1,
          maleCount: {
            $size: {
              $filter: {
                input: "$studentsInfo",
                as: "student",
                cond: { $eq: ["$$student.gender", "Male"] },
              },
            },
          },
          femaleCount: {
            $size: {
              $filter: {
                input: "$studentsInfo",
                as: "student",
                cond: { $eq: ["$$student.gender", "Female"] },
              },
            },
          },
        },
      },
    ]);

    res.status(200).json(classData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "An error occurred while fetching gender counts for all classes.",
    });
  }
};

const getClassGenderCountsStatistics = async (req, res) => {
  const classId = req.params.id;

  try {
    const classData = await Class.findById(classId).populate({
      path: "students",
      select: "gender",
    });

    if (!classData) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found." });
    }

    const maleCount = classData.students.filter(
      (student) => student.gender === "Male"
    ).length;
    const femaleCount = classData.students.filter(
      (student) => student.gender === "Female"
    ).length;

    res.status(200).json({
      _id: classData._id,
      className: classData.className,
      maleCount,
      femaleCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching gender counts for the class.",
    });
  }
};

const getAllClassNames = async (req, res) => {
  try {
    const classes = await Class.find({}, "_id className");

    res.status(200).json({
      success: true,
      classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export {
  getAllClasses,
  getClassByID,
  createClass,
  updateClass,
  deleteClass,
  getAllClassesGenderCountsStatistics,
  getClassGenderCountsStatistics,
  getAllClassNames,
};
