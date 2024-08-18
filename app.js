const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
// const { session } = require('passport');
// const passport = require('passport');
const passport = require('./config/passport');
const session = require('express-session');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

//session mgmt
app.use(session({
    secret: 'shubham1',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

//init passport and restore session state
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
