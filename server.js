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

hbs.registerHelper('showButtons', function(user, campground) {
  if(this.author.id.equals(user)) {
    return new hbs.SafeString(
      `<a class="btn btn-sm btn-warning"
        href="/campgrounds/${campground._id}/comments/${this.id}/edit">Edit</a>
       <form class='d-inline' action="/campgrounds/${campground._id}/comments/${this.id}?_method=DELETE" method="POST">
        <button type="submit" class="btn btn-sm btn-danger">Delete</Delete>
      </form>`
    );
  }
  else return
});

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
server.use('/campgrounds/:id/comments', commentRoutes);
server.use('/campgrounds', campgroundRoutes);

server.listen(3000, () =>  console.log('Server started @port 3000'));
