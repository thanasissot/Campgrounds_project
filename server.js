const express = require('express');
const server = express();
const hbs = require('hbs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Comment = require('./models/comment');
const seedDB = require('./seeds');

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


server.get("/", function(req,res){
    res.render("landing");
});


// INDEX -Show all campgrounds
server.get("/campgrounds", function(req,res){
    Campground.find({},function(err, allCampgrounds){
        if(err){
            console.log(err);
        }
        else{
    res.render("campgrounds/index", {campgrounds: allCampgrounds});
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

server.get('/campgrounds/:id/comments/new', function (req, res) {
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

server.post('/campgrounds/:id/comments',function (req, res) {
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
