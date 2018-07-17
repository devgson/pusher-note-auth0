const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

passport.use( new Auth0Strategy({
    domain: 'AUTHO DOMAIN NAME',
    clientID: 'AUTHO CLIENT ID',
    clientSecret: 'AUTHO CLIENT SECRET',
    callbackURL: 'http://localhost:3000/callback'
  }, (accessToken, refreshToken, extraParams, profile, done) => {
    return done(null, profile);
}))