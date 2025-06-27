const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if token is provided
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.admin = decoded; // Attach decoded info to request
    next();
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

module.exports = authenticate;
