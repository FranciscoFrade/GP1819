'use strict';
console.log("running 00_entry.point.js");

require("../app.js");
let mongoDBConfig = require("../src/model/db/mongoConfig").mongoDBConfig;

describe("", function () {
    this.timeout(10000);
    before(function (done) {
        setTimeout(function () {
            let userCollection = mongoDBConfig.collections[0];
            let animalCollection = mongoDBConfig.collections[1];
            let adoptionCollection = mongoDBConfig.collections[2];

            let httpTests = require("./tests/http.tests");
            let mongoUserTests = require("./tests/mongo.users.tests")(userCollection);
            let mongoAnimalsTests = require("./tests/mongo.animals.tests")(animalCollection);
            let mongoAdoptionsTests = require("./tests/mongo.adoptions.tests")(userCollection, animalCollection, adoptionCollection);
            done();
        }, 2000);
    });
    it('', function (done) {
        done();
    });
});