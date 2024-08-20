const express = require('express');
const {register, login} = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');
const passport = require('passport');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
});

router.get('/google', passport.authenticate('google',{ scope: ['profile', 'email']}));

router.get('/google/callback',
    passport.authenticate('google', {failureRedirect: '/auth/login'}),
    (req, res) => {
        req.login(req.user, function(err){
            if(err){
                console.error("Session creation failed: ", err);
                return res.redirect('/auth/login');
            }
        })
        // console.log('User authenticated: ', req.user);
        // console.log('Session: ', req.session);
        res.redirect('/');
});

module.exports = router;