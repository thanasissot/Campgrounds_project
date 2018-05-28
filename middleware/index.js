// all the middleware goes here
const Campground = require('../models/campground');
const Comment = require('../models/comment');

const middlewareObj = {
  isLoggedIn (req, res, next) {
      if(req.isAuthenticated()){
        return next();
      }
      res.redirect('/login');
    },

  checkCampgroundOwnership (req, res, next) {
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
  },

  checkCommentOwnership (req, res, next) {
    if(req.isAuthenticated()) {
      Comment.findById (req.params.comment_id, function (err, foundComment) {
        if (err) {
          res.redirect ('back');
        } else {
          // does user own the campground?
          // mongoose method
          if (foundComment.author.id.equals (req.user._id)) {
            next();
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

}

module.exports = middlewareObj
