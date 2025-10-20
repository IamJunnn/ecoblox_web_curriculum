// ===========================
// PERMISSION MIDDLEWARE
// Role-based access control
// ===========================

// Middleware to check if user has required role
function requireRole(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource'
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

// Middleware to extract and verify user from session
// In a real app, this would verify JWT token
// For now, we'll use a simple session ID approach
function authenticateUser(req, res, next) {
  // For this simplified version, we expect the client to send user_id and role in headers
  // In production, you'd use JWT tokens instead
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  if (!userId || !userRole) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  // Attach user to request
  req.user = {
    id: parseInt(userId),
    role: userRole
  };

  next();
}

// Convenience functions for common role checks
const requireAdmin = requireRole(['admin']);
const requireTeacher = requireRole(['teacher', 'admin']);
const requireStudent = requireRole(['student', 'teacher', 'admin']);

module.exports = {
  authenticateUser,
  requireRole,
  requireAdmin,
  requireTeacher,
  requireStudent
};
