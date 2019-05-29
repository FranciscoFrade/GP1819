'use strict';
console.log("running http.js")

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();

const url = "http://localhost:8080";

describe("HTTP server", function () {
    this.timeout(10000);
    it('Main page status 200: OK', function (done) {
        chai
            .request(url)
            .get("/")
            .end(function (error, response, body) {
                if (error) {
                    done(error);
                } else {
                    chai.expect(response.statusCode).to.equal(200);
                    done();
                }
            });
    });
    it('Login page status 200: OK', function (done) {
        chai
            .request(url)
            .get("/login")
            .end(function (error, response, body) {
                if (error) {
                    done(error);
                } else {
                    chai.expect(response.statusCode).to.equal(200);
                    done();
                }
            });
    });
    it('Register page status 200: OK', function (done) {
        chai
            .request(url)
            .get("/register")
            .end(function (error, response, body) {
                if (error) {
                    done(error);
                } else {
                    chai.expect(response.statusCode).to.equal(200);
                    done();
                }
            });
    });
    it('Animals list page status 200: OK', function (done) {
        chai
            .request(url)
            .get("/animals")
            .end(function (error, response, body) {
                if (error) {
                    done(error);
                } else {
                    chai.expect(response.statusCode).to.equal(200);
                    done();
                }
            });
    });
    it('Non-existing page status 404: Not Found', function (done) {
        chai
            .request(url)
            .get("/non-existing-page")
            .end(function (error, response, body) {
                if (error) {
                    done(error);
                } else {
                    chai.expect(response.statusCode).to.equal(404);
                    done();
                }
            });
    });
});