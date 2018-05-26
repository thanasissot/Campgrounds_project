const express = require('express');
const server = express();
const hbs = require('hbs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const passport              = require('passport');
const LocalStrategy         = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const Campground = require('./models/campground');
const Comment = require('./models/comment');
const User = require('./models/user');
const seedDB = require('./seeds');

// PASSPORT CONFIGURATION
server.use(require('express-session')({
  secret: 'This secret can be any string we want',
  resave: false,
  saveUninitialized: false
}));
server.use(passport.initialize());
server.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

seedDB();
hbs.localsAsTemplateData(server);
server.locals.foo = 'Hello from hbs'
hbs.registerPartials(__dirname + '/views/partials');
mongoose.connect('mongodb://localhost/yelp_camp');
server.set('view engine', 'hbs');
server.use(express.static(__dirname + '/public'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));
server.use(methodOverride('_method'));

// this is a MIDDLEWARE that will run for all ROUTES
// its setting the currentUser object to check is there is a user loggen in
server.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});


// ================
//  ROUTES
// ================

server.get("/", function(req,res){
    res.render("landing");
});


// INDEX -Show all campgrounds
server.get("/campgrounds", function(req,res){
   //get all campgrounds from DB
    Campground.find({},function(err, allCampgrounds){
        if(err){
            console.log(err);
        }
        else{
    res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user});
        }
    });
    // res.render("campgrounds",{campgrounds: campgrounds});
});

// CREATE- post, add new campground to DB
server.post("/campgrounds", function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCampground = {name, image, description};
    // create new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated) {
        if(err){
            console.log(err);
        }else{
            res.redirect("/campgrounds");
        }
        // body...
    });

});
// NEW - show form to create new campmground
server.get("/campgrounds/new", function(req,res){
    res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
server.get("/campgrounds/:id", function(req,res){
    // find the campground with provided ID
    Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
     // render show template with that campground
  });
// ====================================
//  COMMENTS ROUTES
// ====================================

server.get('/campgrounds/:id/comments/new', isLoggedIn, function (req, res) {
  //find campground by id and sent it through
  Campground.findById (req.params.id, function (err, campground) {
    if (err) {
      console.log(err);
    } else {
      // or campground : campground but this below is new ES6 syntax
        res.render('comments/new', {campground});
    }
  });
});

server.post('/campgrounds/:id/comments', isLoggedIn, function (req, res) {
  // lookup campground using ID
  // create new comment
  // connect new comment to campground
  // redirect to campground show page
  Campground.findById (req.params.id, function (err, campground) {
    if (err) {
      console.log(err);
      res.redirect('/campgrounds');
    } else {
        Comment.create (req.body.comment, function (err, comment) {
          if (err) {
            console.log(err);
          } else {
              campground.comments.push(comment);
              campground.save();
              res.redirect('/campgrounds/' + campground._id);
          }
        });
    }
  });
});

// =========================
//  AUTH ROUTES
// =========================

server.get('/register', function (req, res) {
  res.render('register');
});

server.post('/register', function (req, res) {
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
server.get('/login', function (req, res) {
  res.render('login');
});
//handling login logic + //Middleware
server.post('/login', passport.authenticate('local', {
  successRedirect: '/campgrounds',
  failureRedirect: '/login'
}), function (req, res) {
});

// logout route
server.get('/logout', function (req, res) {
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



server.listen(3000, () =>  console.log('Server started @port 3000'));





// // SCHEMA SETUP
// var campgroundSchema = new mongoose.Schema({
//     name: String,
//     image: String,
//     description: String
// });
// var Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create(
//     {name: "Salmon Creek",
//     image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRjjLDPiGRQoyw7Dj_Sk5W7uVa0HKVELkI_pmX843Kg4zrVGtG",
//     description: "This is not a campground but a random picture"
//     },
//     function(err,campground){
//         if(err){
//             console.log(err);
//         }else {console.log(campground);
//         }
//     });
