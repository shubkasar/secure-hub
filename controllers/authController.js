const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/User');
require('dotenv').config();

exports.register = async (req, res) => {
    const { email, password, username, fullName } = req.body;
    try{
        const existingUser = await findUserByEmail(email);
        if(existingUser){
            return res.status(400).json({message: 'Email already exists.'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser(email, hashedPassword, username, fullName);
        res.status(201).json({message: 'User registered successfully!', user});
    } catch(err) {
        res.status(500).json({error: err.message});
    }
};