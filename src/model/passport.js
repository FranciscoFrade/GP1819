const LocalStrategy = require('passport-local').Strategy;
const mongoDBConfig = require("./db/mongoConfig.js").mongoDBConfig;


module.exports = function (passport) {

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        const sessionUser = { _id: user._id, userid: user.user_id ,username: user.username, email: user.email, phone: user.phone, profile: user.profile };
        done(null, sessionUser);
    });
    // used to deserialize the user
    passport.deserializeUser(function (sessionUser, done) {
        const User = mongoDBConfig.collections[0].model;
        User.findById(sessionUser._id, function (err, user) {
            done(err, user);
        });
    });

    // User Register
    passport.use(
        'local-register',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
            function (req, email, password, done) {
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                const User = mongoDBConfig.collections[0].model;
                var today = new Date((new Date()).toString().substring(0,15));
                var date = new Date((new Date(req.body.birthDate)).toString().substring(0,15));

                User.getUserByEmail(email, function (err, result) {
                    if (err) {
                        return done(err);
                    } else if (result === -1) {
                        return done(null, false, req.flash('registerMessage', 'Lamentamos mas houve um problema com o site. Por favor, tente mais tarde.'));
                    } else if (result !== null){
                        return done(null, false, req.flash('registerMessage', 'Este endereço email já está registado.'));
                    } else if(date > today){
                        return done(null, false, req.flash('addDateMessage', 'Data inválida.'));
                    } else if(("" + req.body.phoneNumber).length !== 9){
                        return done(null, false, req.flash('phoneNumberMessage', 'Número de telemóvel inválido.'));
                    }else {
                        // if the user doesn't already exist in the db
                        User.insertUser(req.body.userName, email, password, req.body.phoneNumber, req.body.birthDate, function (result) {                           
                            return done(null, result);
                        })
                    }
                });
            })
    );

    // User Login
    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        }, function (req, email, password, done) { // callback with email and password from our form
            const User = mongoDBConfig.collections[0].model;
            User.getUserByEmail(email, function (err, result) {
                if (err) {
                    return done(err);
                }
                if (result === null || result === -1) {
                    return done(null, false, req.flash('loginMessage', 'O utilizador não está registado.')); // req.flash is the way to set flashdata using connect-flash
                }
                // if the user is found but the password is wrong
                if (!User.validatePassword(password, result.password)) {
                    return done(null, false, req.flash('loginMessage', 'Password inválida.')); // create the loginMessage and save it to session as flashdata
                }
                // all is well, return successful user
                return done(null, result);
            });
        })
    );
};