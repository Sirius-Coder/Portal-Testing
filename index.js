const path =require('path')
const express=require('express')
const expressSession = require("express-session");
const passport = require("passport");
const auth0strategy= require("passport-auth0");

require("dotenv").config();// Loading the enviornment variables that you'll be storing in .env
const authRouter = require("./auth");
var app=express();
//*************
// session configuration
// //************
const session = {
  secret: "LoxodontaElephasMammuthusPalaeoloxodonPrimelephas",
  cookie: {},
  resave: false,
  saveUninitialized: false
};

if (app.get("env") === "production") {
  // Serve secure cookies, requires HTTPS || The server wont send cookies unless the connection is HTTP
  session.cookie.secure = true;
}

// /**********
// passport configuration
// /***************
const strategy = new auth0strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:
      process.env.AUTH0_CALLBACK_URL || "http://localhost:3000/callback"
  },
  function(accessToken, refreshToken, extraParams, profile, done) {
    /**
     * Access tokens are used to authorize users to an API
     * (resource server)
     * accessToken is the token to call the Auth0 API
     * or a secured third-party API
     * extraParams.id_token has the JSON Web Token
     * profile has all the information from the user
     */
    return done(null, profile);
  }
);
//Setting up the template engine || App configuration session
app.set("views",path.join(__dirname,"views"))
app.set("view engine","pug")
app.use(express.static(path.join(__dirname,"public")))
app.use(expressSession(session));

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
// Creating custom middleware with Express
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});
// Router mounting
app.use("/", authRouter);

app.get('/',(req,res)=>{
  res.render("index",{title:"Home"})
})

//user page after log-in
app.get('/user',(req,res)=>{
  res.render("user",{title:"Profile",userProfile:{nickname:"Auth0"}})
})

app.listen(8080,()=>{
  console.log(`Running Succesfully at Port 8080`);
})
