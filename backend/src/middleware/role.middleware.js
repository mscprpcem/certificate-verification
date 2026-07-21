module.exports = (role) => {
  return (req, res, next) => {
    if (!req.session || !req.session.userId || req.session.role !== role) {
      return res.status(403).json({ error: `Access denied. ${role}s only.` });
    }
    next();
  };
};
