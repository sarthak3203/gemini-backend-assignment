const pool = require("../config/db.js")

async function addUserMessage(chatroom_id,text){
    const result = await pool.query(`INSERT INTO messages (chatroom_id,sender, message_text,status) VALUES ($1, $2, $3, $4) RETURNING *`,[chatroom_id,"USER",text,"pending"]);
    return result.rows[0]
}


async function addGeminiMessage(chatroom_id,text){
    const result = await pool.query(`INSERT INTO messages (chatroom_id,sender, message_text,status) VALUES ($1, $2, $3, $4) RETURNING *`,[chatroom_id,"GEMINI",text,"completed"]);
    return result.rows[0]
}

module.exports={
    addUserMessage,
    addGeminiMessage
}