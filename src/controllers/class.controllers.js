import Class from "../models/class.models.js";
import { validatePaginationParams } from "../utils/validatePagination.js";

const getAllClasses = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (!validatePaginationParams(page, limit)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters.",
      });
    }

    const skip = (pageNum - 1) * limitNum;

    const [classes, totalClasses] = await Promise.all([
      Class.find()
        .skip(skip)
        .limit(limitNum)
        .populate("teacher", "name")
        .populate("students", "name")
        .exec(),
      Class.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: classes,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalClasses / limitNum),
        totalClasses,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching classes.",
    });
  }
};

const getClassById = async (req, res) => {
  const { id } = req.params;

  try {
    const foundClass = await Class.findById(id)
      .populate("teacher", "name")
      .populate("students", "name");

    if (!foundClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: foundClass,
    });
  } catch (error) {
    console.error("Error fetching class:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const createClass = async (req, res) => {
  try {
    const { name, year, teacher, studentFees, students, studentLimit } =
      req.body;

    if (!name || !studentFees || !studentLimit) {
      return res.status(400).json({
        success: false,
        message: "Please provide required fields.",
      });
    }

    const newClass = new Class({
      name,
      year,
      teacher,
      studentFees,
      students,
      studentLimit,
    });

    const savedClass = await newClass.save();

    res.status(201).json({
      success: true,
      data: savedClass,
    });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create class. Please try again.",
    });
  }
};

const updateClass = async (req, res) => {
  const { id } = req.params;

  try {
    const { name, year, studentFees, studentLimit } = req.body;

    if (!name || !year || !studentFees || !studentLimit) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { name, year, studentFees, studentLimit },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found or could not be updated.",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedClass,
    });
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update class. Please try again.",
    });
  }
};

const deleteClass = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedClass = await Class.findByIdAndDelete(id);

    if (!deletedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found or already deleted.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Class deleted successfully.",
      data: deletedClass,
    });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete class. Please try again.",
    });
  }
};

const getClassGenderStatistics = async (req, res) => {
  const classId = req.params.id;

  try {
    const classData = await Class.findById(classId).populate({
      path: "students",
      select: "gender",
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    const maleCount = classData.students.filter(
      (student) => student.gender === "Male"
    ).length;
    const femaleCount = classData.students.filter(
      (student) => student.gender === "Female"
    ).length;

    res.status(200).json({
      _id: classData._id,
      className: classData.name,
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

export {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassGenderStatistics,
};
