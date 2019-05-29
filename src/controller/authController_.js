'use strict';

const mongoose = require("mongoose");
const passport = require("passport");
const User = require("../model/db/mongoConfig").mongoDBConfig.collections[0].model;

let userController = {};

// Restrict access to root page
userController.home = function (req, res) {
    res.render('index', { user: req.user });
};

// Go to registration page
userController.register = function (req, res) {
    res.render('register');
};

// Post registration
userController.doRegister = function (req, res) {
    User.register(new User({ username: req.body.username, name: req.body.name }), req.body.password, function (err, user) {
        if (err) {
            return res.render('register', { user: user });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
};

// Go to login page
userController.login = function (req, res) {
    res.render('login');
};

// Post login *------- https://www.djamware.com/post/58bd823080aca7585c808ebf/nodejs-expressjs-mongoosejs-and-passportjs-authentication
// --------- http://www.passportjs.org/docs/authenticate/
userController.doLogin = function (req, res) {
    //Correcto:
    //console.log("userController.doLogin: req.body.email: " + req.body.email);

    // não entra:
    passport.authenticate('local')(req, res, function () {
        
        
        console.log("userController.doLogin: req.body.password: " + req.body.password);

        res.redirect('/');
    });
};

// logout
userController.logout = function (req, res) {
    req.logout();
    res.redirect('/');
};

//
module.exports = userController;