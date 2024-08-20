const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
// const { session } = require('passport');
// const passport = require('passport');
const passport = require('./config/passport');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./config/db')
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

//session mgmt
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'express_sessions'
    }),
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 60000
    }
}));

app.use((req, res, next) => {
    console.log('Session data:', req.session);
    next();
});

//init passport and restore session state
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log('Session after passport:', req.session);
    console.log('User after passport:', req.user);
    next();
});

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    // res.send('Welcome to the home page!');
    console.log("req: "+req);
    
    console.log("req.user: "+req.user);
    
    if(req.isAuthenticated() && req.user){
        // console.log('User is authenticated');
        // console.log('User session data:', req.session.passport);
        // console.log('User data:', req.user);

        const fullName = req.user.fullName;
        res.send(`Welcome ${fullName}!`)

    } else {
        console.log('User is not authenticated');
        res.send('Not Authenticated!');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
