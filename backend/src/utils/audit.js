import pool from "../db.js";

export async function logAction(userId, action, entity, entityId) {
  await pool.execute(
    "INSERT INTO audit_logs (user_id, action, entity, entity_id, timestamp) VALUES (?,?,?,?,NOW())",
    [userId, action, entity, entityId]
  );
}
