const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/User');
const { JsonWebTokenError } = require('jsonwebtoken');
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

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try{
        const user = await findUserByEmail(email);
        if(!user){
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if(!isValid){
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = await jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: "5m" });
        res.json({ token, user });
        // console.log("Hi "+user.username);
        
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};