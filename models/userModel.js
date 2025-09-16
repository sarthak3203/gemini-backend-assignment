const pool = require("../config/db.js");

async function findUserByMobile(mobile) {
  const result = await pool.query("SELECT * FROM users WHERE mobile = $1", [mobile]);
  return result.rows[0] || null;
}

async function createUser({ mobile, name }) {
  const result = await pool.query(
    "INSERT INTO users (mobile, name) VALUES ($1, $2) RETURNING *",
    [mobile, name || null]
  );
  return result.rows[0];
}

async function updatePassword(mobile,password_hash){
  const normalizedMobile = mobile.toString().trim();
  const result = await pool.query("UPDATE users SET password_hash = $1 where mobile =$2 RETURNING *",[password_hash,normalizedMobile]);
  console.log(result)
  return result.rows[0];
  
}

async function updateStripeCustomerId(userId, stripeCustomerId) {
  const result = await pool.query(
    "UPDATE users SET stripe_customer_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    [stripeCustomerId, userId]
  );
  return result.rows[0];
}

async function updateSubscriptionStatus(userId, status) {
  const result = await pool.query(
    "UPDATE users SET subscription = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    [status, userId]
  );
  return result.rows[0];
}

async function findByStripeCustomerId(stripeCustomerId) {
  const result = await pool.query(
    "SELECT * FROM users WHERE stripe_customer_id = $1",
    [stripeCustomerId]
  );
  return result.rows[0] || null;
}

async function checkUserStatus(id) {
  const result = await pool.query("SELECT subscription FROM users WHERE id=$1",[id]);
  return result.rows[0];
  
}

module.exports = { findUserByMobile, createUser, updatePassword, updateStripeCustomerId, updateSubscriptionStatus, findByStripeCustomerId,checkUserStatus };
