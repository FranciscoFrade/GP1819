'use strict';
console.log("running mongo.users.tests.js")

//const mongoDBConfig = require("../../src/model/db/mongoConfig").mongoDBConfig;
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();

module.exports = function (userCollection) {
    describe("Mongo 'users' collection", function () {
        this.timeout(10000);
        let newUser = null;
        let userModel = null;
        let testInsertUser = null;

        before(function (done) {
            userModel = userCollection.model;
            newUser = {
                name: "Xana Xanax",
                email: "x@x",
                password: "a",
                phone: "1234654651",
                birthDate: new Date()
            };
            // Aux function
            testInsertUser = function (result, callback) {
                result.username.should.equal(newUser.name);
                result.email.should.equal(newUser.email);
                result.password.should.be.a("string");
                result.phone.should.equal(newUser.phone);
                result.birthDate.getUTCFullYear().should.equal(newUser.birthDate.getUTCFullYear());
                result.birthDate.getUTCMonth().should.equal(newUser.birthDate.getUTCMonth());
                result.birthDate.getUTCDate().should.equal(newUser.birthDate.getUTCDate());
                result.profile.should.equal("utilizador");
                callback();
            };
            done();
        });
        beforeEach(function (done) {
            userModel.insertUser(newUser.name, newUser.email, newUser.password, newUser.phone, newUser.birthDate, function (err, result) {
                if (err) done(err);
                done();
            });
        });
        afterEach(function (done) {
            userModel.findOneAndDelete({ email: newUser.email }, function (err, result) {
                if (err) done(err);
                done();
            });
        });

        it('Insert user in DB', function (done) {
            userModel.getUserByEmail(newUser.email, function (err, result) {
                if (err) {
                    done(err);
                }
                testInsertUser(result, done);
            })
        })
        it('Update user in DB', function (done) {
            userModel.getUserByEmail(newUser.email, function (err, result) {
                if (err) {
                    done(err);
                }
                const newUserData = { _id: result._id, username: "Ana" };
                userModel.updateUser(newUserData, function (err, res) {
                    if (err) done(err);
                    res.username.should.equal(newUserData.username);
                    done();
                });
            });
        });
        it('Delete user from DB', function (done) {
            let newUserEmail = "belmira@b";
            userModel.insertUser("Belmira", newUserEmail, "123", "123456789", new Date(), function (err, result) {
                if (err) done(err);
                userModel.deleteUser(result.user_id, function (data) {
                    userModel.getUserByEmail(newUserEmail, function (err, result) {
                        if(err) done(err);
                        should.not.exist(err);
                        should.not.exist(result);
                        done();
                    });
                });
            });
        });
    })
}
