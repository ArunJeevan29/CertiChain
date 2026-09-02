import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user identity to req.user
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
      };

      next();
    } catch (error) {
      console.error(`[JWT Error] ${error.message}`);
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required' });
  }
};
