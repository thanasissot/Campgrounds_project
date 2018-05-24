const express = require('express');
const server = express();
const hbs = require('hbs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
hbs.localsAsTemplateData(server);
//==
server.locals.foo = 'Hello from hbs'
// const campgrounds = require('./project/app/models/campgroundsSchema.js');
// campgrounds.Campground;
//==
hbs.registerPartials(__dirname + '/views/partials');
mongoose.connect('mongodb://localhost/yelp_camp');
server.set('view engine', 'hbs');
// server.use(express.static(__dirname + 'project'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));
server.use(methodOverride('_method'));


// SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});
var Campground = mongoose.model("Campground", campgroundSchema);

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
    res.render("index",{campgrounds: allCampgrounds});
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
    res.render("new");
});

// SHOW - shows more info about one campground
server.get("/campgrounds/:id", function(req,res){
    // find the campground with provided ID
    Campground.findById(req.params.id, function(err,foundCampground){
        if(err){
            console.log(err);
        }else{
            res.render("show", {campground: foundCampground});
        }
    });
     // render show template with that campground
  });


server.listen(3003, () =>  console.log('Server started @port 3003'));
