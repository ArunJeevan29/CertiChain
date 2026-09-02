import * as studentService from '../services/studentService.js';

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin,Staff
export const getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    
    // Prevent unreasonable limits
    if (limit > 100) limit = 100;

    const query = {};

    // Search query
    if (req.query.q) {
      const searchRegex = new RegExp(req.query.q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { studentId: searchRegex },
        { registerNumber: searchRegex },
        { department: searchRegex }
      ];
    }

    // Optional Filtering
    if (req.query.department) {
      query.department = req.query.department;
    }

    const data = await studentService.getAllStudents(query, page, limit);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student profile for logged-in student
// @route   GET /api/students/me
// @access  Private/Student
export const getMyProfile = async (req, res, next) => {
  try {
    const data = await studentService.getStudentById(req.user.userId);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student by MongoDB ID
// @route   GET /api/students/:id
// @access  Private/Admin,Staff (or Student accessing their own ID)
export const getStudentById = async (req, res, next) => {
  try {
    // If user is STUDENT, they can only request their own ID
    if (req.user.role === 'STUDENT' && req.user.userId !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view your own profile.' });
    }

    const data = await studentService.getStudentById(req.params.id);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student by unique Student ID
// @route   GET /api/students/student-id/:studentId
// @access  Private/Admin,Staff (or Student accessing their own studentId)
export const getStudentByStudentId = async (req, res, next) => {
  try {
    const data = await studentService.getStudentByStudentId(req.params.studentId);
    
    // If user is STUDENT, they can only request their own studentId
    if (req.user.role === 'STUDENT' && req.user.userId !== data._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view your own profile.' });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin,Staff (or Student updating their own allowed fields)
export const updateStudent = async (req, res, next) => {
  try {
    // If user is STUDENT, they can only update their own profile
    if (req.user.role === 'STUDENT' && req.user.userId !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only update your own profile.' });
    }

    // Role and studentId are stripped out by the service layer whitelist anyway,
    // but we ensure we don't accidentally pass them.
    const data = await studentService.updateStudent(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin,Staff
export const deleteStudent = async (req, res, next) => {
  try {
    // STUDENT role is blocked at the route level via authorizeRoles('ADMIN', 'STAFF')
    await studentService.deleteStudent(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
