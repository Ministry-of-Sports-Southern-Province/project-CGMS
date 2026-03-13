import { Router } from "express";
import pool from "../db.js";
import { gradeValidator, gradeUpdateValidator, paginationValidator } from "../validators/index.js";
import { validate } from "../middleware/validate.js";
import { authRequired } from "../middleware/auth.js";
import { calculateGrade } from "../utils/grade.js";
import { logAction } from "../utils/audit.js";

const router = Router();

router.get("/", authRequired, paginationValidator, validate, async (req, res) => {
  const {
    district,
    ds_office,
    year,
    grade,
    user,
    search,
    sort_by = "created_at",
    sort_dir = "desc",
    page = 1,
    limit = 20
  } = req.query;

  const filters = [];
  const params = [];

  if (district) {
    filters.push("c.district_id = ?");
    params.push(district);
  }
  if (ds_office) {
    filters.push("c.ds_id = ?");
    params.push(ds_office);
  }
  if (year) {
    filters.push("g.year = ?");
    params.push(year);
  }
  if (grade) {
    filters.push("g.grade = ?");
    params.push(grade);
  }
  if (user) {
    filters.push("g.created_by = ?");
    params.push(user);
  }
  if (search) {
    filters.push("c.club_name LIKE ?");
    params.push(`%${search}%`);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const safeSortBy = ["created_at", "year", "score", "club_name"].includes(sort_by)
    ? sort_by
    : "created_at";
  const safeSortDir = sort_dir === "asc" ? "asc" : "desc";
  const offset = (Number(page) - 1) * Number(limit);

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM club_grades g
     JOIN clubs c ON g.club_id = c.id
     ${where}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT g.*, c.club_name, c.address, c.gn_division, c.district_id, c.ds_id,
            d.name AS district_name, ds.name AS ds_name, u.name AS created_by_name
     FROM club_grades g
     JOIN clubs c ON g.club_id = c.id
     JOIN districts d ON c.district_id = d.id
     JOIN ds_offices ds ON c.ds_id = ds.id
     JOIN users u ON g.created_by = u.id
     ${where}
     ORDER BY ${safeSortBy === "club_name" ? "c.club_name" : "g." + safeSortBy} ${safeSortDir}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );

  return res.json({
    total: countRows[0].total,
    page: Number(page),
    limit: Number(limit),
    data: rows
  });
});

router.post("/", authRequired, gradeValidator, validate, async (req, res) => {
  const { club_id, year, score } = req.body;
  const gradeInfo = calculateGrade(score);
  const [result] = await pool.execute(
    "INSERT INTO club_grades (club_id, year, score, grade, created_by, created_at) VALUES (?,?,?,?,?,NOW())",
    [club_id, year, score, gradeInfo.grade, req.user.id]
  );
  await logAction(req.user.id, "create", "entry", result.insertId);
  return res.status(201).json({ id: result.insertId, grade: gradeInfo.grade });
});

router.put("/:id", authRequired, gradeUpdateValidator, validate, async (req, res) => {
  const id = Number(req.params.id);
  const [rows] = await pool.execute("SELECT created_by, score, club_id FROM club_grades WHERE id = ?", [id]);
  const entry = rows[0];
  if (!entry) return res.status(404).json({ message: "Not found" });
  if (req.user.role !== "admin" && entry.created_by !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const year = req.body.year ?? undefined;
  const score = req.body.score ?? entry.score;
  const gradeInfo = calculateGrade(score);

  await pool.execute(
    "UPDATE club_grades SET year = COALESCE(?, year), score = ?, grade = ? WHERE id = ?",
    [year, score, gradeInfo.grade, id]
  );

  if (req.body.club_name || req.body.address || req.body.district_id || req.body.ds_id || req.body.gn_division) {
    await pool.execute(
      "UPDATE clubs SET club_name = COALESCE(?, club_name), address = COALESCE(?, address), district_id = COALESCE(?, district_id), ds_id = COALESCE(?, ds_id), gn_division = COALESCE(?, gn_division) WHERE id = ?",
      [req.body.club_name, req.body.address, req.body.district_id, req.body.ds_id, req.body.gn_division, entry.club_id]
    );
  }

  await logAction(req.user.id, "update", "entry", id);
  return res.json({ message: "Updated", grade: gradeInfo.grade });
});

router.delete("/:id", authRequired, async (req, res) => {
  const id = Number(req.params.id);
  const [rows] = await pool.execute("SELECT created_by, club_id FROM club_grades WHERE id = ?", [id]);
  const entry = rows[0];
  if (!entry) return res.status(404).json({ message: "Not found" });
  if (req.user.role !== "admin" && entry.created_by !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Delete the grade entry
  await pool.execute("DELETE FROM club_grades WHERE id = ?", [id]);

  // Delete the associated club
  await pool.execute("DELETE FROM clubs WHERE id = ?", [entry.club_id]);

  await logAction(req.user.id, "delete", "entry", id);
  return res.json({ message: "Deleted" });
});

export default router;
