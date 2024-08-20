const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.sendStatus(401);
    }

    // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    //     if(err){

    //         return res.status(403).json({ message: 'Token expired or invalid '});
    //     }

    //     req.user = user;
    //     next();
    // })

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err){
            return res.status(403).json({message: 'Token expired or invalid'});
        }

        const session = req.session;
        if(!session || !session.passport || !session.passport.user){
            return res.status(403).json({message: 'Session expired'});
        }

        const currentTime = new Date().getTime();
        const expiryTime = new Date(session.cookie.expires).getTime();

        if(currentTime > expiryTime){
            req.session.destroy((err) => {
                if(err){
                    return next(err);
                }
                res.clearCookie('connect.sid');
                return res.status(401).json({ message: 'Session expired' });
            });
        } else {
            req.user = user;
            next();
        }
    });
};

module.exports = authenticateToken;