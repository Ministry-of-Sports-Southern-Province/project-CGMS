import { Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import pool from "../db.js";
import { userCreateValidator } from "../validators/index.js";
import { validate } from "../middleware/validate.js";
import { adminOnly, authRequired } from "../middleware/auth.js";
import { logAction } from "../utils/audit.js";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), "uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }
});

router.get("/", authRequired, adminOnly, async (req, res) => {
  const status = req.query.status;
  const filters = [];
  const params = [];
  if (status) {
    filters.push("status = ?");
    params.push(status);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const [rows] = await pool.execute(
    `SELECT id, name, email, role, status, avatar, language_preference, theme_mode, theme_color, created_at FROM users ${where}`,
    params
  );
  return res.json(rows);
});

router.post("/", authRequired, adminOnly, userCreateValidator, validate, async (req, res) => {
  const { name, email, password, role, status = "active" } = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password_hash, role, status, created_at) VALUES (?,?,?,?,?,NOW())",
    [name, email, password_hash, role, status]
  );
  await logAction(req.user.id, "create", "user", result.insertId);
  return res.status(201).json({ id: result.insertId });
});

router.put("/me", authRequired, async (req, res) => {
  const { name, email, language_preference, theme_mode, theme_color } = req.body;
  await pool.execute(
    "UPDATE users SET name = ?, email = ?, language_preference = ?, theme_mode = ?, theme_color = ? WHERE id = ?",
    [name, email, language_preference, theme_mode, theme_color, req.user.id]
  );
  const [rows] = await pool.execute(
    "SELECT id, name, email, role, status, avatar, language_preference, theme_mode, theme_color FROM users WHERE id = ?",
    [req.user.id]
  );
  return res.json(rows[0]);
});

router.put("/me/password", authRequired, async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ message: "Password fields required" });
  }
  const [rows] = await pool.execute("SELECT password_hash FROM users WHERE id = ?", [req.user.id]);
  const user = rows[0];
  const ok = await bcrypt.compare(current_password, user.password_hash);
  if (!ok) return res.status(400).json({ message: "Current password incorrect" });
  const password_hash = await bcrypt.hash(new_password, 10);
  await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [password_hash, req.user.id]);
  return res.json({ message: "Password updated" });
});

router.post("/me/avatar", authRequired, upload.single("avatar"), async (req, res) => {
  const filePath = `/uploads/${req.file.filename}`;
  await pool.execute("UPDATE users SET avatar = ? WHERE id = ?", [filePath, req.user.id]);
  const [rows] = await pool.execute(
    "SELECT id, name, email, role, status, avatar, language_preference, theme_mode, theme_color FROM users WHERE id = ?",
    [req.user.id]
  );
  return res.json(rows[0]);
});

router.put("/:id", authRequired, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  const [rows] = await pool.execute("SELECT name, email, role, status FROM users WHERE id = ?", [id]);
  const existing = rows[0];
  if (!existing) return res.status(404).json({ message: "Not found" });

  const name = req.body.name ?? existing.name;
  const email = req.body.email ?? existing.email;
  const role = req.body.role ?? existing.role;
  const status = req.body.status ?? existing.status;

  await pool.execute(
    "UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ?",
    [name, email, role, status, id]
  );
  return res.json({ message: "Updated" });
});

router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  if (req.user.id === id) return res.status(400).json({ message: "Cannot delete self" });
  await pool.execute("DELETE FROM users WHERE id = ?", [id]);
  await logAction(req.user.id, "delete", "user", id);
  return res.json({ message: "Deleted" });
});

export default router;
