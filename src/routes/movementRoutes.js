const mongoDBConfig = require("../model/db/mongoConfig").mongoDBConfig;
const express = require('express');
var router = express.Router();
//var mongoose = require('mongoose');
let Movement;
setTimeout(function () {
    Movement = mongoDBConfig.collections[3].model;
}, 2000);
//mongoose.model('animals');

var Handlebars = require('handlebars');

const op_submenu = [
    { href: "/volunteers", name: "Voluntários", type: ["Administrador", "Funcionário"] }, //, "Funcionário"
    { href: "/workers", name: "Funcionários", type: ["Administrador"] },
    { href: "/users", name: "Utilizadores", type: ["Administrador"] },
    { href: "/intervencoesMedicas_sub", name: "Intervenções Médicas", type: ["Administrador", "Funcionário"] },
    { href: "/agenda_sub", name: "Agenda", type: ["Administrador", "Funcionário", "Voluntário"] },
    { href: "/animals", name: "Animais", type: ["Administrador", "Funcionário", "Voluntário"] },
    { href: "/adoptions", name: "Adopções", type: ["Administrador", "Funcionário"] },
    { href: "/apadrinhamentos_sub", name: "Apadrinhamentos", type: ["Administrador", "Funcionário"] },
    { href: "/entradaESaidaAnimais_sub", name: "Entrada e Saída de Animais", type: ["Administrador", "Funcionário"] }
]

let selectedMenu = {
    home: false,
    animals: false,
    volunteering: false,
    operations: false,
    about: false
}

Handlebars.registerHelper('ifBoolCond', function(param, options) {
    if(param === true) return options.fn(this);
      return options.inverse(this);
  });

  Handlebars.registerHelper('ifNullCond', function(param, options) {
    if(param === "") 
      return options.fn(this);

    return options.inverse(this);
  });


  router.get('/', isLoggedIn, function (req, res) {
    const User = mongoDBConfig.collections[0].model;
    const Animal = mongoDBConfig.collections[1].model;
    let movements = [];
    const route = "movements";
    const searchColumnRowspan = 12;
    const reqQuery = req.query;
    let movementQuery = {};
    let userPattern = null;
    let animalPattern = null;
    let isSearching = false;
    if (Object.getOwnPropertyNames(reqQuery).length !== 0) {
        for (let [key, value] of Object.entries(reqQuery)) {
            if (value !== "") {
                switch (key) {
                    case "date":
                        movementQuery[key] = { '$gte': value };
                        break;
                    case "user":
                        userPattern = new RegExp(value, "i");
                        break;
                    case "animal":
                        animalPattern = new RegExp(value, "i");
                        break;
                    default:
                        break;
                }
                isSearching = true;
            }
        }
    }

    Movement.getMovement(movementQuery, function (err, result) {
        if (err) console.error(err);
        result.forEach(element => {
            let user = null;
            let animal = null;
            User.getUser({ user_id: element.user_id }, function (err, result) {
                if (err) console.log(err);
                user = (result.length !== 0) ? result[0].username : "Utilizador eliminado";
                Animal.find({ _id: element.animal_id }, function (err, result) {
                    if (err) console.log(err);
                    animal = (result.length !== 0) ? result[0].name : "Animal eliminado";
                    movements.push({
                        movement_id: element.movement_id,
                        user: user,
                        animal: animal,
                        date: element.date.toISOString().slice(0, 10),
                        isIn: element.isIn,
                        isComplete: element.isComplete,
                        route: route,
                        showActions: true
                    });
                    if (isSearching &&
                        ((userPattern && !user.match(userPattern)) || (animalPattern && !animal.match(animalPattern)))) {
                        movements.pop();
                    }
                    movements.sort(function (a, b) {
                        if (a.movement_id < b.movement_id) {
                          return 1;
                        }
                        if (a.movement_id > b.movement_id) {
                          return -1;
                        }
                        return 0;
                      });
                });
            });
        });
        setTimeout(function () {
            while (movements.length < searchColumnRowspan) {
                movements.push({
                    movement_id: "",
                    user: "",
                    animal: "",
                    date: "",
                    isIn: "",
                    isComplete: "",
                    route: route,
                    showActions: false
                });
            }
            const firstLine = movements.shift();
            if (req.session.passport.user.profile === "administrador") {
                res.render('movement/movementsList', {
                    description: "Entradas e Saídas de Animais",
                    isUserLogged: isUserLogged(req, res),
                    op_submenu: setOpSubmenu(req, res),
                    firstLine: firstLine,
                    movements: movements,
                    searchColumnRowspan: searchColumnRowspan,
                    route: route,
                    selectedMenu: setPropertyTrue(selectedMenu, "operations")
                });
            } else {
                res.redirect('/');
            }
        }, 1000);
    });
});

router.get('/add', isLoggedIn, function (req, res) {
    const User = mongoDBConfig.collections[0].model;
    const Animal = mongoDBConfig.collections[1].model;
    let responsabels = [];
    let animals = [];

    User.getUser({}, function (err, usersArray) {
        Animal.find({}, function (err, animalsArray) {
            if (err) console.log(err);
            usersArray.forEach(elem => {
                let newUser = {
                    user: elem.username,
                    user_id: elem.user_id
                };
                responsabels.push(newUser);
            })
            animalsArray.forEach(elem => {
                if (elem.state === "Disponível") {
                    let newAnimal = {
                        animal: elem.name,
                        animal_id: elem.animal_id
                    };
                    animals.push(newAnimal);
                }
            });
            if (req.session.passport.user.profile === "administrador") {
                res.render('movement/createMovement', {
                    description: "Registar Saída",
                    isUserLogged: isUserLogged(req, res),
                    op_submenu: setOpSubmenu(req, res),
                    users: responsabels,
                    animals: animals,
                    selectedMenu: setPropertyTrue(selectedMenu, "operations")
                });
            } else {
                res.redirect('/');
            }
        });
    });
});

router.post('/add', isLoggedIn, function (req, res) {
    const Animal = mongoDBConfig.collections[1].model;
    const animal_id = req.body.animal.split("_")[0];
    const user_id = req.body.user.split("_")[0];
    Animal.find({ animal_id: animal_id }, function (err, animalsArray) {
        if (err) console.log(err);
        animalsArray[0].state = "Fora do albergue";
        Animal.findOneAndUpdate({ _id : animalsArray[0]._id }, animalsArray[0], {new: true}, (err, doc) => {
            if(!err){
                let newMovementData = {
                    user_id: user_id,
                    animal_id: doc._id,
                    date: new Date((new Date()).toString().substring(0,15)),
                    isIn: false,
                    isComplete: false
                };
                Movement.insertMovement(newMovementData, function (data) {
                    if (data !== null) {
                        res.status(400).send(true);
                    } else {
                        res.status(400).send(false);
                    }
                });
            }
        });
    })
});

router.get('/entry/:id', isLoggedIn, function (req, res) {
    const Animal = mongoDBConfig.collections[1].model;
    
    Movement.getMovement({ movement_id: req.params.id }, function (err, movementsArray) {
        if (err) console.log(err);
        movementsArray[0].isComplete = true;
        Movement.findOneAndUpdate({ _id : movementsArray[0]._id }, movementsArray[0], {new: true}, (err, docMovement) => {
            if(!err){
                Animal.find({ _id: docMovement.animal_id }, function (err, animalsArray) {
                    if (err) console.log(err);
                    animalsArray[0].state = "Disponível";
                    Animal.findOneAndUpdate({ _id : animalsArray[0]._id }, animalsArray[0], {new: true}, (err, doc) => {
                        if(!err){
                            let newMovementData = {
                                user_id: docMovement.user_id,
                                animal_id: doc._id,
                                date: new Date((new Date()).toString().substring(0,15)),
                                isIn: true,
                                isComplete: true
                            };
                            Movement.insertMovement(newMovementData, function (data) {
                                if (data !== null) {
                                    res.redirect('/movements');
                                } else {
                                    res.status(400).send(false);
                                }
                            });
                        }
                    });
                })
            }
        });
    });
});

router.get('/details/:id', function (req, res) {
    const User = mongoDBConfig.collections[0].model;
    const Animal = mongoDBConfig.collections[1].model;

    Movement.getMovement({ movement_id: req.params.id }, function (err, movementsArray) {
        if (err) console.log(err);
        let movementData = {
            movement_id: req.params.id,
            date: movementsArray[0].date.toISOString().slice(0, 10),
            user_id: movementsArray[0].user_id,
            user: null,
            animal_id: null,
            animal: null,
        };

        User.getUser({ user_id: movementData.user_id }, function (err, usersArray) {
            if (err) console.log(err);
            movementData.user = usersArray[0];
            Animal.find({ _id: movementsArray[0].animal_id }, function (err, animalArray) {
                if (err) console.log(err);
                movementData.animal_id = animalArray[0].animal_id;
                movementData.animal = animalArray[0];
                console.log("Estado: " + movementData.animal.state);
                if (req.session.passport.user.profile === "administrador") {
                    res.render("movement/details", {
                        description: "Visualizar adopção",
                        isUserLogged: isUserLogged(req, res),
                        op_submenu: setOpSubmenu(req, res),
                        movement: movementData,
                        isUserLogged: isUserLogged(req, res),
                        op_submenu: setOpSubmenu(req, res),
                        selectedMenu: setPropertyTrue(selectedMenu, "operations"),
                    });
                } else {
                    res.redirect('/');
                }
            });
        });
    });
});

function setPropertyTrue(object, prop) {
    for (let property in object) {
        if (object.hasOwnProperty(property)) {
            object[property] = (property === prop);
        }
    }
    return object;
}

function setOpSubmenu(req, res) {
    // If not logged in, return empty array
    if (req.session.passport === undefined || req.session.passport.user === undefined) {
        return [];
    }
    const userType = req.session.passport.user.profile;
    switch (userType) {
        case "administrador":
            return op_submenu;
        case "funcionário":
            return removeObjectFromArray(op_submenu, "Funcionário");
        case "voluntário":
            return removeObjectFromArray(op_submenu, "Voluntário");
        default:
            return removeObjectFromArray(op_submenu, "Utilizador");;
    }
}

function isUserLogged(req, res) {
    if (req.user) {
        const userType = req.user.profile[0].toUpperCase() + req.user.profile.slice(1);
        return {
            isLogged: true,
            username: req.user.username,
            profile: userType
        }
    }
    return { isLogged: false }
}

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

let removeObjectFromArray = function (originalArray, propertyToRemain) {
    //Deep Copy
    let newArray = JSON.parse(JSON.stringify(originalArray));

    for (let i = newArray.length - 1; i >= 0; i--) {
        if (newArray[i].type.indexOf(propertyToRemain) === -1) {
            newArray.splice(i, 1);
        }
    }
    return newArray;
}
module.exports = router;