const express               = require('express');
const server                = express();
const hbs                   = require('hbs');
const mongoose              = require('mongoose');
const bodyParser            = require('body-parser');
const methodOverride        = require('method-override');
const passport              = require('passport');
const LocalStrategy         = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const Campground            = require('./models/campground');
const Comment               = require('./models/comment');
const User                  = require('./models/user');
const seedDB                = require('./seeds');



const commentRoutes         = require('./routes/comments');
const campgroundRoutes      = require('./routes/campgrounds');
const indexRoutes           = require('./routes/index');
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
// seed the DataBase
// seedDB();
// hbs.localsAsTemplateData(server);
// server.locals.foo = 'Hello from hbs'
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
// the use of routes
server.use(indexRoutes);
server.use('/campgrounds/:id', commentRoutes);
server.use('/campgrounds', campgroundRoutes);





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
