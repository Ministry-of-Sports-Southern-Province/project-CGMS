import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
}

export function ownerOrAdmin(getOwnerId) {
  return async (req, res, next) => {
    try {
      if (req.user?.role === "admin") return next();
      const ownerId = await getOwnerId(req);
      if (ownerId !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      return next();
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  };
}
