import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
  try {
    if (!req || !res) {
      return res.status(500).json({
        success: false,
        message: "Request object missing",
      });
    }

    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, login again",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;

    next(); // 🚨 REQUIRED
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default userAuth;
