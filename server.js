const passport = require('passport');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const Auth0Strategy = require('passport-auth0');

const app = express();

app.set('view engine', 'pug');

app.use(session({
  secret: "-- ENTER CUSTOM SESSION SECRET --",
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'assets')));
app.use(bodyParser.urlencoded({extended: false}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(new Auth0Strategy({
  domain: 'gson007.auth0.com',
  clientID: 'hEaTPoVz7pP-kfcbIwcCM5hLWcSRn4hS',
  clientSecret: 'NqC8IL_NMjk2CqJWztV8trVi3kv_QJ2U4FueFTT-rojztIJPqhNw1RiXwc89yxI1',
  callbackURL: 'http://localhost:3000/callback'
}, (accessToken, refreshToken, extraParams, profile, done) => {
  return done(null, profile);
}));

function loggedIn(req, res, next) {
  req.session.user ? next() : res.redirect('/login');
}

app.get('/login',
  passport.authenticate('auth0', {
    clientID: 'hEaTPoVz7pP-kfcbIwcCM5hLWcSRn4hS',
    domain: 'gson007.auth0.com',
    redirectUri: 'http://localhost:3000/callback',
    audience: 'https://gson007.auth0.com/userinfo',
    responseType: 'code',
    scope: 'openid profile'
  })
);

app.get('/callback', passport.authenticate('auth0'), (req, res) => {
  req.session.user = req.user;
  res.redirect('/')
});

app.get('/', loggedIn, (req, res) => {
  res.render('index', {user: req.session.user})
});

app.get('/note/:slug', loggedIn, (req, res) => {
  res.render('editor', {user: req.session.user})
});

app.post('/note', loggedIn, (req, res) => {
  const slug = req.body.slug;
  res.redirect(`/note/${slug}`);
});

app.listen(3000, () => {
  console.log('Server listening on port 3000.');
});
