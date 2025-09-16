const pool = require("../config/db.js");

async function createChatroom(title, user_name, user_id) {
  const result = await pool.query(
    `INSERT INTO chatroom (title, user_id, created_by) VALUES ($1, $2, $3) RETURNING *`,
    [title, user_id, user_name]
  );
  return result.rows[0];
}

async function getChatroomsByUser(user_id) {
  const result = await pool.query(
    "SELECT * FROM chatroom WHERE user_id = $1 ORDER BY created_at DESC",
    [user_id]
  );
  return result.rows;
}

async function findChatroomById(id) {
  const result = await pool.query(`SELECT * FROM chatroom WHERE id = $1`, [id]);
  return result.rows[0];
}

// Fetch messages for a chatroom (only id, message_text, sender_id)
async function findMessagesByChatroomId(chatroomId) {
  const result = await pool.query(
    `SELECT id, sender, message_text
     FROM messages
     WHERE chatroom_id = $1
     ORDER BY created_at ASC`,
    [chatroomId]
  );
  return result.rows;
}

module.exports = {
  createChatroom,
  getChatroomsByUser,
  findChatroomById,
  findMessagesByChatroomId,
};
