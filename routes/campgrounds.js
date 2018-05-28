const express    = require('express');
const router     = express.Router();
const Campground = require('../models/campground');
const Comment    = require('../models/comment');
const User       = require('../models/user');

// INDEX -Show all campgrounds
router.get("/", function(req,res){
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
router.post("/", isLoggedIn, function(req, res){
    let name = req.body.name;
    let image = req.body.image;
    let description = req.body.description;
    let author = {
      id: req.user._id,
      username: req.user.username
    }
    let newCampground = {name, image, description, author};

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
router.get("/new", isLoggedIn, function(req,res){
    res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function(req,res){
    // find the campground with provided ID
    Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground){
      if(err){
        console.log(err);
      }else{
        let bool = res.locals.currentUser && foundCampground.author.id.equals(res.locals.currentUser._id);
        res.render("campgrounds/show", {campground: foundCampground, bool});
      }
    });
     // render show template with that campground
  });

// EDIT ROUTE
router.get('/:id/edit', checkCampgroundOwnership, function (req, res) {
  Campground.findById(req.params.id, function (err, foundCampground) {
    if (err) {
      console.log(err);
    } else  {
      res.render ('campgrounds/edit', {campground : foundCampground});
    }
  });
});

// UPDATE ROUTE
router.put('/:id', checkCampgroundOwnership, function (req, res) {
  //find and update the correct campground
  Campground.findByIdAndUpdate (req.params.id, req.body.campground, function (err, updatedCampground) {
    if (err) {
      console.log(err);
    } else {   //redirect to the campground show page
      res.redirect ('/campgrounds/' + req.params.id);
    }
  });
});

// DESTROY Campground ROUTE
router.delete ('/:id', checkCampgroundOwnership, function (req, res) {
  Campground.findByIdAndRemove (req.params.id, function (err) {
    if (err) {
      console.log(err);
    }
    res.redirect('/campgrounds');
  })
});

// MIDDLEWARES
function isLoggedIn (req, res, next) {
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect('/login');
  }

function checkCampgroundOwnership (req, res, next) {
  if(req.isAuthenticated()) {
    Campground.findById (req.params.id, function (err, foundCampground) {
      if (err) {
        res.redirect ('back');
      } else {
        // does user own the campground?
        // mongoose method
        if (foundCampground.author.id.equals (req.user._id)) {
          next()
        } else {
          res.redirect ('back');
        }
      }
    });
  } else {
      // if not, redirect
    res.redirect ('back');
  }
}

module.exports = router;
