import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import { loginValidator } from "../validators/index.js";
import { validate } from "../middleware/validate.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

function buildCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

router.post("/login", loginValidator, validate, async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  res.cookie("token", token, buildCookieOptions());
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    language_preference: user.language_preference,
    theme_mode: user.theme_mode,
    theme_color: user.theme_color
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain: process.env.COOKIE_DOMAIN || undefined
  });
  return res.json({ message: "Logged out" });
});

router.get("/me", authRequired, async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT id, name, email, role, avatar, language_preference, theme_mode, theme_color FROM users WHERE id = ?",
    [req.user.id]
  );
  return res.json(rows[0]);
});

export default router;
