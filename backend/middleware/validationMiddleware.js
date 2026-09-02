export const validateRegister = (req, res, next) => {
  const { name, email, password, college, department, registerNumber } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  if (!email || email.trim() === '') {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  }

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  if (!college || college.trim() === '') {
    return res.status(400).json({ success: false, message: 'College is required' });
  }

  if (!department || department.trim() === '') {
    return res.status(400).json({ success: false, message: 'Department is required' });
  }

  if (!registerNumber || registerNumber.trim() === '') {
    return res.status(400).json({ success: false, message: 'Register Number is required' });
  }

  // If all validation passes, proceed to the controller
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || email.trim() === '') {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  }

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  next();
};

export const validateMongoId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
  next();
};

export const validateStudentUpdate = (req, res, next) => {
  const { name, email, college, department, registerNumber } = req.body;

  if (name !== undefined && name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Name cannot be empty' });
  }

  if (email !== undefined) {
    if (email.trim() === '') {
      return res.status(400).json({ success: false, message: 'Email cannot be empty' });
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }
  }

  if (college !== undefined && college.trim() === '') {
    return res.status(400).json({ success: false, message: 'College cannot be empty' });
  }

  if (department !== undefined && department.trim() === '') {
    return res.status(400).json({ success: false, message: 'Department cannot be empty' });
  }

  if (registerNumber !== undefined && registerNumber.trim() === '') {
    return res.status(400).json({ success: false, message: 'Register Number cannot be empty' });
  }

  next();
};
