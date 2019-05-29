'use strict';
console.log("running mongo.animals.tests.js")

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();

module.exports = function (animalCollection) {
    describe("Mongo 'animals' collection", function () {
        this.timeout(20000);
        let newAnimal = null;
        let Animal = null;
        let testInsertAnimal = null;

        before(function () {
            Animal = animalCollection.model;
            newAnimal = new Animal();
            newAnimal.name = "AnimalTeste";
            newAnimal.birthday = new Date();
            newAnimal.gender = "Male";
            newAnimal.vaccinated = true;
            newAnimal.sterilized = true;
            newAnimal.photoLink = "data:image/jpeg;base64,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";
            newAnimal.dog = true;

            // Aux function
            testInsertAnimal = function (result, callback) {
                result.name.should.equal(newAnimal.name);
                result.birthday.should.equal(newAnimal.birthday);
                result.gender.should.equal(newAnimal.gender);
                result.vaccinated.should.equal(newAnimal.vaccinated);
                result.birthday.getUTCFullYear().should.equal(newAnimal.birthday.getUTCFullYear());
                result.birthday.getUTCMonth().should.equal(newAnimal.birthday.getUTCMonth());
                result.birthday.getUTCDate().should.equal(newAnimal.birthday.getUTCDate());
                result.sterilized.should.equal(newAnimal.sterilized);
                result.photoLink.should.equal(newAnimal.photoLink);
                result.dog.should.equal(newAnimal.dog);
                callback();
            }
            //done();
        });
        beforeEach(function (done) {
            newAnimal.save(function (err, doc) {
                if (err) {
                    done(err);
                } else {
                    newAnimal._id = doc._id;
                    done();
                }
            });
        });
        afterEach(function (done) {
            // delete user from db
            Animal.findByIdAndRemove(newAnimal._id, function (err, result) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
        });

        it('Insert animal in DB', function (done) {
            newAnimal.save((err, doc) => {
                if (err) {
                    //done(error);
                }
                testInsertAnimal(newAnimal, done);
                //done();
            });
        });
        it('Update animal in DB', function () {
            const newAnimalData = { _id: newAnimal._id, name: "testeAnimal2" }
            Animal.findOneAndUpdate({ _id: newAnimalData._id }, newAnimal, { new: true }, (err, doc) => {
                //if(err) done(error);
                //else{
                doc.name.should.equal(newAnimal.name);
                //    done();
                //}
            });
        });
        it('Delete animal from DB', function () {
            Animal.findByIdAndRemove(newAnimal._id, (err, doc) => {
                //if (!err) {
                //    done();
                //}
                //else { done(err); }
            });
        })
    });
}
