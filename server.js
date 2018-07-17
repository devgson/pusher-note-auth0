const passport = require('passport');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();

app.set('view engine','pug');

app.use(session({
  secret: "-- ENTER CUSTOM SESSION SECRET --",
  resave:true,
  saveUninitialized:true
}));
app.use(express.static(path.join(__dirname,'assets')))
app.use(bodyParser.urlencoded({ extended : false }));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

require('./auth.js');

function loggedIn(req, res, next){
  req.session.user ? next() : res.redirect('/login');
}

app.get('/login', 
  passport.authenticate('auth0', {
    clientID: 'AUTHO CLIENT ID',
    domain: 'AUTHO DOMAIN NAME',
    redirectUri: 'http://localhost:3000/callback',
    audience: 'AUTHO AUDIENCE',
    responseType: 'code',
    scope: 'openid profile'
  })
)

app.get('/callback', passport.authenticate('auth0'), (req, res) => {
    req.session.user = req.user;
    res.redirect('/')
})

app.get('/', loggedIn, (req, res) => {
  res.render('index', { user : req.session.user })
})

app.get('/note/:slug', loggedIn, (req, res) => {
  res.render('editor', { user : req.session.user })
})

app.post('/note', loggedIn, (req, res) => {
  const slug = req.body.slug;
  res.redirect(`/note/${slug}`);
})


app.listen(3000);