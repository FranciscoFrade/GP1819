const connectMongoDB = require("./src/model/db/mongoConfig.js").connectMongoDB;
const mongoDBConfig = require("./src/model/db/mongoConfig.js").mongoDBConfig;
const passport = require("passport");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require('cookie-parser');
const path = require("path");
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const exphbs = require('express-handlebars');
const helpers = require("./src/view/helpers/helpers.js");


connectMongoDB(() => {
    const User = mongoDBConfig.collections[0].model;
    
    require('./src/model/passport')(passport);
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    module.exports.connectMongoDB = connectMongoDB;
});

// HTTP Server
let app = express();

// Templates Engine
const hbs = exphbs.create({
    extname: 'handlebars',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/src/view/layouts/',
    // Specify helpers which are only registered on this instance.
    //helpers: {
        //isSelected: helpers.isSelected
        //isUserLogged: helpers.isUserLogged
    //}
});
app.set('views', path.join(__dirname, '/src/view/'));
app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'mybrainhurts',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// routes
require('./src/routes/api.js')(app, passport); // load our routes and pass in our app and fully configured passport
//app.use('/api', routes);


const server = app.listen(8080, function () {
    const host = server.address().address === "::"
        ? "localhost"
        : server.address().address;
    const port = server.address().port;

    console.log("App listening at http://%s:%s", host, port);
});

module.exports.app = app;