const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const pool = require('./db');
require('dotenv').config();

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at: ', promise, 'reason: ', reason);
})

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try{
            const googleId = profile.id;
            const email = profile.emails[0].value;
            const fullName = profile.displayName;
            const username = profile.name.givenName;

            // console.log("Info captured from google acc: ");
            // console.log("googleID: "+ googleId);
            // console.log("email"+ email);
            // console.log("fullName"+ fullName);
            // console.log("username"+ username);

            const authProviderResult = await pool.query('SELECT * FROM auth_providers WHERE provider_name = $1 AND provider_uid = $2', ['google', googleId]);

            if(authProviderResult.rows.length === 0){

                const randomPassword = Math.random().toString(36).slice(-8);
                const hashedPassword = await bcrypt.hash(randomPassword, 10);

                const newUserResult = await pool.query('INSERT INTO users (email_id, password_hash, username, full_name) VALUES ($1, $2, $3, $4) RETURNING *', [email, hashedPassword, username, fullName]);
                const newUser = newUserResult.rows[0];
                
                console.log("\n\n");
                
                console.log('New User:', newUser);
                console.log('Inserting into auth_providers with user_id:', newUser.user_id);

                await pool.query('INSERT INTO auth_providers (user_id, provider_name, provider_uid, created_at ) VALUES ($1, $2, $3, NOW())', [newUser.user_id, 'google', googleId]);
                return done(null, newUser);
            } else {
                const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1',[authProviderResult.rows[0].user_id]);
                return done(null, userResult.rows[0]);
            }
        } catch (err) {
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done) => {
    // done(null, user.user_id);

    console.log('Serializing user:', user);
    done(null, { user_id: user.user_id, fullName: user.full_name});
})

passport.deserializeUser( async (user, done) => {
    console.log('deserializeUser called with:', user);
    try{
        const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [user.user_id]);
        // const updatedUser = userResult.rows[0];
        // // done(null, userResult.rows[0]);
        // done(null, {user_id: updatedUser.user_id, fullName: updatedUser.full_name})
        if(userResult.rows.length > 0){
            const updatedUser = userResult.rows[0];
            console.log('User found and deserialized:',updatedUser);
            done(null, {user_id: updatedUser.user_id, fullName: updatedUser.full_name});
        } else {
            console.log('User not found');
            done(new Error('User not found'), null);
        }
    } catch(err) {
        console.log('Error in deserialization:', err);
        done(err, null);
    }
});

module.exports = passport;