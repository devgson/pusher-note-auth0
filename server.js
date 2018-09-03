const path = require("path");
const passport = require("passport");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const Auth0Strategy = require("passport-auth0");
const TextSync = require("textsync-server-node");
require("dotenv").config({
  path: "variables.env"
});

const app = express();

app.set("view engine", "pug");

app.use(
  session({
    secret: "--ENTER CUSTOM SESSION SECRET--",
    resave: false,
    saveUninitialized: false
  })
);

const textSync = new TextSync({
  instanceLocator: process.env.INSTANCE_LOCATOR,
  key: process.env.KEY
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.static(path.join(__dirname, "assets")));
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(
  new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/callback"
    },
    (accessToken, refreshToken, extraParams, profile, done) => {
      return done(null, profile);
    }
  )
);

function loggedIn(req, res, next) {
  req.session.user ? next() : res.redirect("/login");
}

app.post("/textsync/tokens", (req, res) => {
  //Certain Users can be restricted to either READ or WRITE access on the document
  //to keep this demo simple, all users are granted READ and WRITE access to the document
  const permissionsFn = () => {
    return Promise.resolve([
      TextSync.Permissions.READ,
      TextSync.Permissions.WRITE
    ]);
  };

  //Set authentication token to expire in 20 minutes
  const options = {
    tokenExpiry: 60 * 20
  };

  textSync.authorizeDocument(req.body, permissionsFn, options).then(token => {
    res.json(token);
  });
});

app.get(
  "/login",
  passport.authenticate("auth0", {
    scope: "openid profile"
  })
);

app.get("/callback", passport.authenticate("auth0"), (req, res) => {
  req.session.user = req.user;
  res.redirect("/");
});

app.get("/", loggedIn, (req, res) => {
  res.render("index", {
    user: req.session.user
  });
});

app.get("/note/:slug", loggedIn, (req, res) => {
  res.render("editor", {
    user: req.session.user
  });
});

app.post("/note", loggedIn, (req, res) => {
  const slug = req.body.slug;
  res.redirect(`/note/${slug}`);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server listening on port 3000.");
});
