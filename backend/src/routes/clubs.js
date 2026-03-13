import { Router } from "express";
import pool from "../db.js";
import { clubValidator } from "../validators/index.js";
import { validate } from "../middleware/validate.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT c.*, d.name AS district_name, ds.name AS ds_name FROM clubs c JOIN districts d ON c.district_id = d.id JOIN ds_offices ds ON c.ds_id = ds.id"
  );
  return res.json(rows);
});

router.post("/", authRequired, clubValidator, validate, async (req, res) => {
  const { club_name, address, district_id, ds_id, gn_division } = req.body;
  const [result] = await pool.execute(
    "INSERT INTO clubs (club_name, address, district_id, ds_id, gn_division) VALUES (?,?,?,?,?)",
    [club_name, address, district_id, ds_id, gn_division]
  );
  return res.status(201).json({ id: result.insertId });
});

router.put("/:id", authRequired, clubValidator, validate, async (req, res) => {
  const { club_name, address, district_id, ds_id, gn_division } = req.body;
  await pool.execute(
    "UPDATE clubs SET club_name = ?, address = ?, district_id = ?, ds_id = ?, gn_division = ? WHERE id = ?",
    [club_name, address, district_id, ds_id, gn_division, req.params.id]
  );
  return res.json({ message: "Updated" });
});

router.delete("/:id", authRequired, async (req, res) => {
  await pool.execute("DELETE FROM clubs WHERE id = ?", [req.params.id]);
  return res.json({ message: "Deleted" });
});

export default router;
