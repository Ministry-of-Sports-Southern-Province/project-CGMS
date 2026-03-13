import { Router } from "express";
import pool from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/locations", authRequired, async (req, res) => {
  const [districts] = await pool.execute("SELECT id, name FROM districts ORDER BY name");
  const [dsOffices] = await pool.execute("SELECT id, district_id, name FROM ds_offices ORDER BY name");
  return res.json({ districts, ds_offices: dsOffices });
});

export default router;
