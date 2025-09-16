const pool = require("../config/db");


async function createOtp(mobile, otp, purpose, expiresAt) {
  const result = await pool.query(
    `INSERT INTO otps (mobile, otp_code, purpose, expires_at) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [mobile, otp, purpose, expiresAt]
  );
  return result.rows[0];
}

async function findLatestOtpByMobile(mobile) {
  const result = await pool.query(
    `SELECT * FROM otps 
     WHERE mobile = $1 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [mobile]
  );
  return result.rows[0];
}

async function markOtpAsUsed(id) {
  await pool.query(
    `UPDATE otps SET is_used = true WHERE id = $1`,
    [id]
  );
}

module.exports = {
  createOtp,
  findLatestOtpByMobile,
  markOtpAsUsed
};