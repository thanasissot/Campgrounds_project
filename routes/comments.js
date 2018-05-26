const express    = require('express');
const router     = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Comment    = require('../models/comment');

// ====================================
//  COMMENTS ROUTES
// ====================================

// comments new
router.get('/comments/new', isLoggedIn, function (req, res) {
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

// comments create
router.post('/comments', isLoggedIn, function (req, res) {
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
            // add username and id to comments
              comment.author.id = req.user._id;
              comment.author.username = req.user.username;
            // save comments
              comment.save();
              campground.comments.push(comment);
              campground.save();
              res.redirect('/campgrounds/' + campground._id);
          }
        });
    }
  });
});

// MIDDLEWARE
function isLoggedIn (req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
