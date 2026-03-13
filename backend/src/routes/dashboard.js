import { Router } from "express";
import pool from "../db.js";
import { authRequired, adminOnly } from "../middleware/auth.js";

const router = Router();

router.get("/stats", authRequired, adminOnly, async (req, res) => {
  const currentYear = new Date().getFullYear();

  // Count only clubs that have grades (active clubs)
  const [[totalClubs]] = await pool.execute(
    "SELECT COUNT(DISTINCT club_id) AS value FROM club_grades"
  );
  const [[totalThisYear]] = await pool.execute("SELECT COUNT(*) AS value FROM club_grades WHERE year = ?", [currentYear]);
  const [gradeCounts] = await pool.execute("SELECT grade, COUNT(*) AS value FROM club_grades GROUP BY grade");
  const [districtCounts] = await pool.execute(
    `SELECT d.name AS district, COUNT(*) AS value
     FROM club_grades g
     JOIN clubs c ON g.club_id = c.id
     JOIN districts d ON c.district_id = d.id
     GROUP BY d.name`
  );
  const [entriesByYear] = await pool.execute(
    "SELECT year, COUNT(*) AS value FROM club_grades GROUP BY year ORDER BY year"
  );
  const [entriesByUser] = await pool.execute(
    `SELECT u.name AS user, COUNT(*) AS value
     FROM club_grades g
     JOIN users u ON g.created_by = u.id
     GROUP BY u.name`
  );

  return res.json({
    cards: {
      total_clubs: totalClubs.value,
      total_entries_this_year: totalThisYear.value,
      grade_counts: gradeCounts
    },
    charts: {
      grade_distribution: gradeCounts,
      district_distribution: districtCounts,
      entries_per_year: entriesByYear,
      entries_per_user: entriesByUser
    }
  });
});

export default router;
