const express  = require('express');
const router   = express.Router();
const passport = require('passport');
const User     = require('../models/user');

// ROOT ROUTE
router.get("/", function(req,res){
    res.render("landing");
});

// register
router.get('/register', function (req, res) {
  res.render('register');
});

// handle sign up
router.post('/register', function (req, res) {
  let newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      return res.render ('register');
    }

    passport.authenticate('local')(req, res, function () {
      res.redirect ('/campgrounds');
    });

  });
});

// show login form
router.get('/login', function (req, res) {
  res.render('login');
});

//handling login logic + //Middleware
router.post('/login', passport.authenticate('local', {
  successRedirect: '/campgrounds',
  failureRedirect: '/login'
}), function (req, res) {
});

// logout route
router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/campgrounds');
});


// MIDDLEWARE
function isLoggedIn (req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
