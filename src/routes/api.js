'use strict';

const mongoDBConfig = require("../model/db/mongoConfig").mongoDBConfig;

module.exports = function (app, passport) {

    let animalAPI = require('./animalRoutes.js');
    let movementAPI = require('./movementRoutes.js');

    // Submenu of "Operações"
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

    //kubernetes index
    app.get('/healthz', function (req, res) {
        res.send('ok');
    });

    /////////// Handlebar
    app.get('/', function (req, res) {
        res.render('home', { description: "Home page", isUserLogged: isUserLogged(req, res), op_submenu: setOpSubmenu(req, res), selectedMenu: setPropertyTrue(selectedMenu, "home") });
    });
    app.get('/login', function (req, res) {
        let flashMessage = { show: false, msg: req.flash('loginMessage')[0] }
        if (flashMessage.msg) {
            flashMessage.show = true;
        }
        res.render('login', { description: "Login", isUserLogged: isUserLogged(req, res), flashMessage: flashMessage, op_submenu: setOpSubmenu(req, res), selectedMenu: setPropertyTrue(selectedMenu, "home") });
    });
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
    app.get('/register', function (req, res) {
        let flashMessage = { show: false, msg: req.flash('registerMessage')[0] }
        let flashMessage1 = { show: false, msg: req.flash('addDateMessage')[0] }
        let flashMessage2 = { show: false, msg: req.flash('phoneNumberMessage')[0] }
        if (flashMessage.msg) {
            flashMessage.show = true;
        }
        if (flashMessage1.msg) {
            flashMessage1.show = true;
        }
        if (flashMessage2.msg) {
            flashMessage2.show = true;
        }
        res.render('register', { description: "Registo", isUserLogged: isUserLogged(req, res), flashMessage: flashMessage, flashMessage1: flashMessage1, flashMessage2: flashMessage2, op_submenu: setOpSubmenu(req, res), selectedMenu: setPropertyTrue(selectedMenu, "home") });
    });

    // GET: View worker's data
    app.get('/workers/:id', isLoggedIn, function (req, res) {
        const User = mongoDBConfig.collections[0].model;
        User.getUser({ user_id: req.params.id }, function (err, result) {
            if (err) console.log(err);
            const user = result[0];
            const userData = {
                user_id: req.params.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                birthDate: user.birthDate.toISOString().slice(0, 10),
                profile: user.profile
            }
            let selected = {
                administrator: false,
                worker: false,
                volunteer: false
            }
            switch (userData.profile) {
                case "administrador":
                    selected.administrator = true;
                    break;
                case "funcionário":
                    selected.worker = true;
                    break;
                case "voluntário":
                    selected.volunteer = true;
                    break;
                default:
                    break;
            }
            if (req.session.passport.user.profile === "administrador") {
                res.render('updateWorker', {
                    description: "Actualizar funcionário",
                    isUserLogged: isUserLogged(req, res),
                    op_submenu: setOpSubmenu(req, res),
                    user: userData,
                    selected: selected,
                    selectedMenu: setPropertyTrue(selectedMenu, "operations")
                });
            } else {
                res.redirect('/');
            }

        });
    });

    // GET: View volunteer's data
    app.get('/volunteers/:id', isLoggedIn, function (req, res) {
        const User = mongoDBConfig.collections[0].model;
        User.getUser({ user_id: req.params.id }, function (err, result) {
            if (err) console.log(err);
            const user = result[0];
            const userData = {
                user_id: req.params.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                birthDate: user.birthDate.toISOString().slice(0, 10),
                profile: user.profile
            }
            let selected = {
                administrator: false,
                worker: false,
                volunteer: false
            }
            switch (userData.profile) {
                case "administrador":
                    selected.administrator = true;
                    break;
                case "funcionário":
                    selected.worker = true;
                    break;
                case "voluntário":
                    selected.volunteer = true;
                    break;
                default:
                    break;
            }
            if (req.session.passport.user.profile === "administrador" ||
                req.session.passport.user.profile === "funcionário") {
                res.render('updateVolunteer', {
                    description: "Actualizar voluntário",
                    isUserLogged: isUserLogged(req, res),
                    op_submenu: setOpSubmenu(req, res),
                    user: userData,
                    selected: selected,
                    selectedMenu: setPropertyTrue(selectedMenu, "operations")
                });
            } else {
                res.redirect('/');
            }
        });
    });

    // GET: View User's data
    app.get('/users/:id', isLoggedIn, function (req, res) {
        const User = mongoDBConfig.collections[0].model;
        User.getUser({ user_id: req.params.id }, function (err, result) {
            if (err) console.log(err);
            const user = result[0];
            const userData = {
                user_id: req.params.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                birthDate: user.birthDate.toISOString().slice(0, 10),
                profile: user.profile
            }
            let selected = {
                administrator: false,
                worker: false,
                volunteer: false,
                user: false
            }
            switch (userData.profile) {
                case "administrador":
                    selected.administrator = true;
                    break;
                case "funcionário":
                    selected.worker = true;
                    break;
                case "voluntário":
                    selected.volunteer = true;
                    break;
                default:
                    selected.user = true;
            }
            if (req.session.passport.user.profile === "administrador") {
                res.render('updateUser', {
                    description: "Actualizar utilizador",
                    isUserLogged: isUserLogged(req, res),
                    op_submenu: setOpSubmenu(req, res),
                    user: userData,
                    selected: selected,
                    selectedMenu: setPropertyTrue(selectedMenu, "operations")
                });
            } else {
                res.redirect('/');
            }
        });
    });


    // GET: Page to create adoption
    app.get('/adoptions/add/', isLoggedIn, function (req, res) {
        const User = mongoDBConfig.collections[0].model;
        const Animal = mongoDBConfig.collections[1].model;
        const Adoption = mongoDBConfig.collections[2].model;
        let adopters = [];
        let animals = [];

        User.getUser({}, function (err, usersArray) {
            Adoption.getAdoption({}, function (err, adoptionsArray) {
                Animal.find({}, function (err, animalsArray) {
                    if (err) console.log(err);
                    let animalsAdoptedIds = [];
                    adoptionsArray.forEach(elem => {
                        animalsAdoptedIds.push(elem.animal_id);
                    })
                    usersArray.forEach(elem => {
                        let newUser = {
                            adopter: elem.username,
                            adopter_id: elem.user_id
                        };
                        adopters.push(newUser);
                    })
                    animalsArray.forEach(elem => {
                        if (animalsAdoptedIds.indexOf((elem.id).toString()) === -1) {
                            let newAnimal = {
                                animal: elem.name,
                                animal_id: elem.animal_id
                            };
                            animals.push(newAnimal);
                        }
                    });
                    if (req.session.passport.user.profile === "administrador") {
                        res.render('createAdoption', {
                            description: "Registar adopção",
                            isUserLogged: isUserLogged(req, res),
                            op_submenu: setOpSubmenu(req, res),
                            adopters: adopters,
                            animals: animals,
                            selectedMenu: setPropertyTrue(selectedMenu, "operations")
                        });
                    } else {
                        res.redirect('/');
                    }
                });
            });
        });
    });


    // POST: Create adoption
    app.post('/adoptions/add/', isLoggedIn, function (req, res) {
        const Animal = mongoDBConfig.collections[1].model;
        const Adoption = mongoDBConfig.collections[2].model;
        const animal_id = req.body.animal.split("_")[0];
        const adopter_id = req.body.adopter.split("_")[0];
        Animal.find({ animal_id: animal_id }, function (err, animalsArray) {
            if (err) console.log(err);
            animalsArray[0].state = "Adotado";
            let newAdoptionData = {
                user_id: adopter_id,
                animal_id: animalsArray[0]._id,
                adoptionDate: req.body.adoptionDate
            };
            Adoption.insertAdoption(newAdoptionData, function (data) {
                if (data !== null) {
                    res.status(400).send(true);
                } else {
                    res.status(400).send(false);
                }
            });
        })
    });

    app.get('/adoptions/details/:id', function (req, res) {

        const User = mongoDBConfig.collections[0].model;
        const Animal = mongoDBConfig.collections[1].model;
        const Adoption = mongoDBConfig.collections[2].model;

        Adoption.getAdoption({ adoption_id: req.params.id }, function (err, adoptionsArray) {
            if (err) console.log(err);
            let adoptionData = {
                adoption_id: req.params.id,
                adoptionDate: adoptionsArray[0].adoptionDate.toISOString().slice(0, 10),
                adopter_id: adoptionsArray[0].user_id,
                adopter: null,
                animal_id: null,
                animal: null,
                animal_photo: null,
                animal_gender: null
            };

            User.getUser({ user_id: adoptionData.adopter_id }, function (err, usersArray) {
                if (err) console.log(err);
                adoptionData.adopter = usersArray[0].username;
                Animal.find({ _id: adoptionsArray[0].animal_id }, function (err, animalArray) {
                    if (err) console.log(err);
                    adoptionData.animal_id = animalArray[0].animal_id;
                    adoptionData.animal = animalArray[0].name;
                    adoptionData.animal_photo = animalArray[0].photoLink;
                    adoptionData.animal_gender = animalArray[0].gender;
                    if (req.session.passport.user.profile === "administrador") {
                        res.render("detailsAdoption", {
                            description: "Visualizar adopção",
                            isUserLogged: isUserLogged(req, res),
                            op_submenu: setOpSubmenu(req, res),
                            adoption: adoptionData,
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

    // GET: Update adoption data
    app.get('/adoptions/update/:id', isLoggedIn, function (req, res) {
        const User = mongoDBConfig.collections[0].model;
        const Animal = mongoDBConfig.collections[1].model;
        const Adoption = mongoDBConfig.collections[2].model;

        Adoption.getAdoption({ adoption_id: req.params.id }, function (err, adoptionsArray) {
            let adopters = [];
            let animals = [];
            let adoptionObj = {
                adoption_id: req.params.id,
                adoptionDate: adoptionsArray[0].adoptionDate.toISOString().slice(0, 10)
            };
            User.getUser({}, function (err, usersArray) {
                Animal.find({}, function (err, animalsArray) {
                    if (err) console.log(err);
                    usersArray.forEach(elem => {
                        let newUser = {
                            adopter: elem.username,
                            adopter_id: elem.user_id
                        };
                        if (elem.user_id !== adoptionsArray[0].user_id) {
                            adopters.push(newUser);
                        } else {
                            adopters.unshift(newUser);
                        }
                    })
                    animalsArray.forEach(elem => {
                        let newAnimal = {
                            animal: elem.name,
                            animal_id: elem.animal_id
                        };
                        if (elem._id.toString() !== adoptionsArray[0].animal_id) {
                            animals.push(newAnimal);
                        } else {
                            animals.unshift(newAnimal);
                        }
                    });
                    if (req.session.passport.user.profile === "administrador") {
                        res.render('updateAdoption', {
                            description: "Alterar adopção",
                            isUserLogged: isUserLogged(req, res),
                            op_submenu: setOpSubmenu(req, res),
                            adoption: adoptionObj,
                            adopters: adopters,
                            animals: animals,
                            selectedMenu: setPropertyTrue(selectedMenu, "operations")
                        });
                    } else {
                        res.redirect('/');
                    }
                });
            });
        });
    });


    // PUT: Update user's data
    app.put('/users/:id', isLoggedIn, function (req, res) {
        const User = mongoDBConfig.collections[0].model;
        const newUserData = {
            username: req.body.username,
            email: req.body.email,
            phone: req.body.phone,
            birthDate: req.body.birthDate,
            profile: req.body.profile
        };
        User.updateUser(newUserData, function (data) {
            if (data !== null) {
                res.status(400).send(true);
            } else {
                res.status(400).send(false);
            }
        });
    });

    // PUT: Update worker's data
    app.put('/workers/:id', isLoggedIn, function (req, res) {
        const User = mongoDBConfig.collections[0].model;
        const newUserData = {
            username: req.body.username,
            email: req.body.email,
            phone: req.body.phone,
            birthDate: req.body.birthDate,
            profile: req.body.profile
        };
        User.updateUser(newUserData, function (data) {
            if (data !== null) {
                res.status(400).send(true);
            } else {
                res.status(400).send(false);
            }
        });
    });

    // PUT: Update volunteer's data
    app.put('/volunteers/:id', isLoggedIn, function (req, res) {
        if (req.session.passport.user.profile === "administrador" ||
            req.session.passport.user.profile === "funcionário") {
            const User = mongoDBConfig.collections[0].model;
            const newUserData = {
                username: req.body.username,
                email: req.body.email,
                phone: req.body.phone,
                birthDate: req.body.birthDate,
                profile: req.body.profile
            };
            User.updateUser(newUserData, function (data) {
                if (data !== null) {
                    res.status(400).send(true);
                } else {
                    res.status(400).send(false);
                }
            });
        } else {
            res.redirect('/');
        }
    });


    // PUT: Update adoption data
    app.put('/adoptions/:id', isLoggedIn, function (req, res) {
        const Animal = mongoDBConfig.collections[1].model;
        const Adoption = mongoDBConfig.collections[2].model;
        Adoption.getAdoption({ adoption_id: req.params.id }, function (err, adoptionRes) {

            let underscoreIndex = req.body.adopter.indexOf("_");
            const adopter_id = req.body.adopter.slice(0, underscoreIndex);
            let newAdoptionData = {
                _id: adoptionRes[0]._id,
                adoption_id: req.params.id,
                adoptionDate: req.body.adoptionDate,
                user_id: adopter_id,
            };
            underscoreIndex = req.body.animal.indexOf("_");
            const animalId = req.body.animal.slice(0, underscoreIndex);

            Animal.find({ animal_id: animalId }, function (err, animalRes) {
                if (err || animalRes === null) {
                    res.status(400).send(false);
                } else {
                    newAdoptionData.animal_id = animalRes[0]._id.toString();
                    Adoption.updateAdoption(newAdoptionData, function (err, data) {
                        if (err || data === null) {
                            res.status(400).send(false);
                        } else {
                            res.status(400).send(true);
                        }
                    });
                }
            });

        });
    });


    // Login
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        successFlash: true,
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }),
        //callback se tiver sucesso:
        function (req, res) {
            console.log("login teve sucesso") // alterar
        }
    );


    // User Register
    app.post('/register', passport.authenticate('local-register', {
        successRedirect: '/',
        successFlash: true,
        //successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect: '/register', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }),
        //callback se tiver sucesso:
        function (req, res) {
            console.log("register teve sucesso") // alterar
        }
    );


    // Adoptions' List
    app.get('/adoptions', isLoggedIn, function (req, res) {
        const User = mongoDBConfig.collections[0].model;
        const Animal = mongoDBConfig.collections[1].model;
        const Adoption = mongoDBConfig.collections[2].model;
        let adoptions = [];
        const route = "adoptions";
        const searchColumnRowspan = 12;
        const reqQuery = req.query;
        let adoptionQuery = {};
        let userPattern = null;
        let animalPattern = null;
        let isSearching = false;
        if (Object.getOwnPropertyNames(reqQuery).length !== 0) {
            for (let [key, value] of Object.entries(reqQuery)) {
                if (value !== "") {
                    switch (key) {
                        case "adoptionDate":
                            adoptionQuery[key] = { '$gte': value };
                            break;
                        case "adopter":
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

        Adoption.getAdoption(adoptionQuery, function (err, result) {
            if (err) console.error(err);
            result.forEach(element => {
                let adopter = null;
                let animal = null;
                User.getUser({ user_id: element.user_id }, function (err, result) {
                    if (err) console.log(err);
                    adopter = (result.length !== 0) ? result[0].username : "Utilizador eliminado";
                    Animal.find({ _id: element.animal_id }, function (err, result) {
                        if (err) console.log(err);
                        animal = (result.length !== 0) ? result[0].name : "Animal eliminado";
                        adoptions.push({
                            adoption_id: element.adoption_id,
                            adopter: adopter,
                            animal: animal,
                            adoptionDate: element.adoptionDate.toISOString().slice(0, 10),
                            route: route,
                            showActions: true
                        });
                        if (isSearching &&
                            ((userPattern && !adopter.match(userPattern)) || (animalPattern && !animal.match(animalPattern)))) {
                            adoptions.pop();
                        }
                    });
                });
            });
            setTimeout(function () {
                while (adoptions.length < searchColumnRowspan) {
                    adoptions.push({
                        adoption_id: "",
                        adopter: "",
                        animal: "",
                        adoptionDate: "",
                        route: route,
                        showActions: false
                    });
                }
                const firstLine = adoptions.shift();
                if (req.session.passport.user.profile === "administrador") {
                    res.render('adoptionsList', {
                        description: "Adopções",
                        isUserLogged: isUserLogged(req, res),
                        op_submenu: setOpSubmenu(req, res),
                        firstLine: firstLine,
                        adoptions: adoptions,
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


    // Workers' List
    app.get('/workers', isLoggedIn, function (req, res) {
        const User = mongoDBConfig.collections[0].model;
        let users = [];
        const route = "workers";
        const profile = "funcionário";

        const reqQuery = req.query;
        let query = { profile: profile };
        if (Object.getOwnPropertyNames(reqQuery).length !== 0) {
            for (let [key, value] of Object.entries(reqQuery)) {
                if (value !== "") {
                    query[key] = (key === "birthDate")
                        ? { '$gte': value }
                        : { '$regex': value, '$options': 'i' }
                }
            }
        }
        User.getUser(query, function (err, result) {
            result.forEach(element => {
                users.push({
                    user_id: element.user_id,
                    username: element.username,
                    email: element.email,
                    phone: element.phone,
                    birthDate: element.birthDate.toISOString().slice(0, 10),
                    route: route,
                    showActions: true
                });
            });

            const searchColumnRowspan = 12;
            while (users.length < searchColumnRowspan) {
                users.push({
                    user_id: "",
                    username: "",
                    email: "",
                    phone: "",
                    birthDate: "",
                    route: route,
                    showActions: false
                });
            }
            const firstLine = users.shift();
            if (req.session.passport.user.profile === "administrador") {
                res.render('workersList', {
                    description: "Funcionários",
                    isUserLogged: isUserLogged(req, res),
                    op_submenu: setOpSubmenu(req, res),
                    firstLine: firstLine,
                    users: users,
                    searchColumnRowspan: searchColumnRowspan,
                    route: route,
                    selectedMenu: setPropertyTrue(selectedMenu, "operations")
                });
            } else {
                res.redirect('/');
            }
        });
    });


    // Volunteers' List
    app.get('/volunteers', isLoggedIn, function (req, res) {
        const User = mongoDBConfig.collections[0].model;
        let users = [];
        const route = "volunteers";
        const profile = "voluntário";

        const reqQuery = req.query;
        let query = { profile: profile };
        if (Object.getOwnPropertyNames(reqQuery).length !== 0) {
            for (let [key, value] of Object.entries(reqQuery)) {
                if (value !== "") {
                    query[key] = (key === "birthDate")
                        ? { '$gte': value }
                        : { '$regex': value, '$options': 'i' }
                }
            }
        }
        User.getUser(query, function (err, result) {
            result.forEach(element => {
                users.push({
                    user_id: element.user_id,
                    username: element.username,
                    email: element.email,
                    phone: element.phone,
                    birthDate: element.birthDate.toISOString().slice(0, 10),
                    route: route,
                    showActions: true
                });
            });
            const searchColumnRowspan = 12;
            while (users.length < searchColumnRowspan) {
                users.push({
                    user_id: "",
                    username: "",
                    email: "",
                    phone: "",
                    birthDate: "",
                    route: route,
                    showActions: false
                });
            }
            const firstLine = users.shift();
            if (req.session.passport.user.profile === "administrador" ||
                req.session.passport.user.profile === "funcionário") {
                res.render('volunteersList', {
                    description: "Voluntários",
                    isUserLogged: isUserLogged(req, res),
                    op_submenu: setOpSubmenu(req, res),
                    firstLine: firstLine,
                    users: users,
                    searchColumnRowspan: searchColumnRowspan,
                    route: route,
                    selectedMenu: setPropertyTrue(selectedMenu, "operations")
                });
            } else {
                res.redirect('/');
            }
        });
    });

    // Users' List
    app.get('/users', isLoggedIn, function (req, res) {
        const User = mongoDBConfig.collections[0].model;
        let users = [];
        const route = "users";
        const profile = "utilizador";

        const reqQuery = req.query;
        let query = { profile: profile };
        if (Object.getOwnPropertyNames(reqQuery).length !== 0) {
            for (let [key, value] of Object.entries(reqQuery)) {
                if (value !== "") {
                    query[key] = (key === "birthDate")
                        ? { '$gte': value }
                        : { '$regex': value, '$options': 'i' }
                }
            }
        }
        User.getUser(query, function (err, result) {
            result.forEach(element => {
                users.push({
                    user_id: element.user_id,
                    username: element.username,
                    email: element.email,
                    phone: element.phone,
                    birthDate: element.birthDate.toISOString().slice(0, 10),
                    route: route,
                    showActions: true
                });
            });
            const searchColumnRowspan = 12;
            while (users.length < searchColumnRowspan) {
                users.push({
                    user_id: "",
                    username: "",
                    email: "",
                    phone: "",
                    birthDate: "",
                    route: route,
                    showActions: false
                });
            }
            const firstLine = users.shift();
            if (req.session.passport.user.profile === "administrador") {
                res.render('usersList', {
                    description: "Utilizadores",
                    isUserLogged: isUserLogged(req, res),
                    op_submenu: setOpSubmenu(req, res),
                    firstLine: firstLine,
                    users: users,
                    searchColumnRowspan: searchColumnRowspan,
                    route: route,
                    selectedMenu: setPropertyTrue(selectedMenu, "operations")
                });
            } else {
                res.redirect('/');
            }
        });
    });

    // DELETE: delete user
    app.delete('/users/:id', isLoggedIn, function (req, res) {
        if (req.session.passport.user.profile === "administrador") {
            const User = mongoDBConfig.collections[0].model;
            User.deleteUser(req.params.id, function (result) {
                res.redirect('/users');
            });
        } else {
            res.redirect('/');
        }
    });

    // DELETE: delete worker
    app.delete('/workers/:id', isLoggedIn, function (req, res) {
        if (req.session.passport.user.profile === "administrador") {
            const User = mongoDBConfig.collections[0].model;
            User.deleteUser(req.params.id, function (result) {
                res.redirect('/workers');
            });
        } else {
            res.redirect('/');
        }
    });


    // DELETE: delete volunteer
    app.delete('/volunteers/:id', isLoggedIn, function (req, res) {
        if (req.session.passport.user.profile === "administrador" ||
            req.session.passport.user.profile === "funcionário") {
            const User = mongoDBConfig.collections[0].model;
            User.deleteUser(req.params.id, function (result) {
                res.redirect('/volunteers');
            });
        } else {
            res.redirect('/');
        }
    });


    // DELETE: delete adoptions
    app.delete('/adoptions/:id', isLoggedIn, function (req, res) {
        if (req.session.passport.user.profile === "administrador") {
            const Adoption = mongoDBConfig.collections[2].model;
            Adoption.deleteAdoption(req.params.id, function (result) {
                res.redirect('/adoptions');
            });
        } else {
            res.redirect('/');
        }
    });


    app.use('/animals', animalAPI);
    app.use('/movements', movementAPI);

    // Must be last route
    app.get('*', function (req, res) {
        res.status(404).render('404', {
            layout: false,
            description: "404 - Page not found"
        });
    });


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

    /**
     * Sets submenu items of "Operações"
     * @param {*} req HTTP request
     * @param {*} res HTTP response
     * @returns array of objects
     */
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
}

/**
 * Iterates the array and removes object elements that do not have a given property
 * @param {*} originalArray 
 * @param {*} propertyToRemain 
 * @returns new array
 */
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

/**
 * Switches properties of object true or false, if they have the same name of prop parameter
 * @param {*} object
 * @param {*} prop
 * @returns transformed object
 */
function setPropertyTrue(object, prop) {
    for (let property in object) {
        if (object.hasOwnProperty(property)) {
            object[property] = (property === prop);
        }
    }
    return object;
}


// route middleware to make sure... DESNECESSÁRIO?
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}



