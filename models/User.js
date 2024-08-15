const pool = require('../config/db');
// const bcrypt = require('bcryptjs');

const createUser = async (email, hashedPassword, username, fullName) => {
    // const hashedPassword = await bcrypt.hash()
    // console.log('Creating user with:', { email, hashedPassword, username, fullName });

    const client = await pool.connect();
    try{
        const result = await client.query(
            'INSERT INTO users (email_id, password_hash, username, full_name) VALUES ($1, $2, $3, $4) RETURNING *', [email, hashedPassword, username, fullName]
        );
        return result.rows[0];
        
    } finally {
        client.release();
    }
};

const findUserByEmail = async (email) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE email_id = $1',
        [email]
    );
    return result.rows[0];
};

module.exports = { createUser, findUserByEmail };