'use strict';
console.log("running mongo.adoptions.tests.js")

const { ObjectId } = require('mongodb');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();

module.exports = function (userCollection, animalCollection, adoptionCollection) {
    describe("Mongo 'adoptions' collection", function () {
        this.timeout(20000);
        let newUser = null;
        let newAnimal = null;
        let newAdoption = null;
        let newUserId = null;
        let newAnimalId = null;
        let newAdoptionId = null;

        let userModel = null;
        let Animal = null;
        let adoptionModel = null;
        let testInsertAdoption = null;

        before(function (done) {
            userModel = userCollection.model;
            Animal = animalCollection.model;
            adoptionModel = adoptionCollection.model;

            newAdoption = {
                user_id: newUserId,
                animal_id: newAnimalId,
                adoptionDate: new Date()
            };

            newUser = {
                name: "Xana Xanax",
                email: "xyz@x",
                password: "a",
                phone: "1234654651",
                birthDate: new Date()
            };
            newAnimal = new Animal();
            newAnimal.photoLink = "https://2.bp.blogspot.com/_LDF9z4ZzZHo/TQAJ32ILP7I/AAAAAAAAAJI/_izkqRoi0bQ/s1600/1600DOG_11019.jpg";
            newAnimal.name = "tigre";
            newAnimal.birthday = new Date();
            newAnimal.gender = "Male";
            newAnimal.vaccinated = false;
            newAnimal.dog = true;
            newAnimal.sterilized = false;

            userModel.insertUser(newUser.name, newUser.email, newUser.password, newUser.phone, newUser.birthDate, function (err, result) {
                if (err) done(err);
                newUserId = result.user_id;
                newAdoption.user_id = newUserId;
                newAnimal.save(function (err, res) {
                    if (err) done(err);
                    newAnimalId = res._id;
                    newAdoption.animal_id = newAnimalId;
                    done()
                });
            });

            // Aux function
            testInsertAdoption = function (result, callback) {
                result.user_id.should.equal(newUserId);
                result.animal_id.toString().should.equal(newAnimalId.toString());
                result.adoptionDate.getUTCFullYear().should.equal(newUser.birthDate.getUTCFullYear());
                result.adoptionDate.getUTCMonth().should.equal(newUser.birthDate.getUTCMonth());
                result.adoptionDate.getUTCDate().should.equal(newUser.birthDate.getUTCDate());
                callback();
            };
        });
        after(function (done) {
            adoptionModel.getAdoption({ user_id: newUserId }, function (err, result) {
                newAdoptionId = result[0].adoption_id;
                adoptionModel.deleteAdoption(newAdoptionId, function (data) {
                    userModel.findOneAndDelete({ user_id: newUserId }, function (err, result) {
                    });
                    Animal.findByIdAndRemove(newAnimal._id, function (err, doc) { });
                    done();
                })
            })
        });

        it('Insert adoption in DB', function (done) {
            adoptionModel.insertAdoption(newAdoption, function (result) {
                testInsertAdoption(result, done);
            });
        });

        it('Update adoption in DB', function (done) {

            adoptionModel.getAdoption({ user_id: newUserId }, function (err, result) {
                if (err) {
                    done(err);
                }
                newAdoptionId = result[0]._id;
                const newAdoptionData = { _id: newAdoptionId, animal_id: 42 };
                adoptionModel.updateAdoption(newAdoptionData, function (err, res) {
                    if (err) done(err);
                    res.animal_id.should.equal(newAdoptionData.animal_id.toString());
                    done();
                });
            });
        });
        it('Delete adoption from DB', function (done) {
            let newAdoption = {
                user_id: 1,
                animal_id: 1,
                adoptionDate: new Date()
            }
            adoptionModel.insertAdoption(newAdoption, function (result) {
                adoptionModel.getAdoption({ user_id: 1 }, function (err, result) {
                    newAdoptionId = result[0].adoption_id;
                    adoptionModel.deleteAdoption(newAdoptionId, function (data) {
                        done();
                    })
                })
            });
        })
    });
}
