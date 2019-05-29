/* eslint-disable no-console */
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const passportLocalMongoose = require('passport-local-mongoose');
const autoIncrement = require('mongoose-auto-increment');

const usersCollectionName = "users";
const animalsCollectionName = "animals";
const adoptionsCollectionName = "adoptions";
const movementsCollectionName = "movements";

// Object to be exported
let mongoDBConfig = {
    name: "quintaDoMiao",
    url: process.env.MONGO_URL || "mongodb://localhost:27017/",
    mongoose: null,
    connection: null,
    collections: [{
        name: usersCollectionName,
        schema: null,
        model: null,
        saltRounds: 12
    },
    {
        name: animalsCollectionName,
        schema: null,
        model: null
    },
    {
        name: adoptionsCollectionName,
        schema: null,
        model: null
    },
    {
        name: movementsCollectionName,
        schema: null,
        model: null
    }]
}
/*
let mongoDBFunctions = {
    getUserCollectionIndex: getUserCollectionIndex
}*/

/**
 * Connects to mongoDB; stores the connection in mongoDBConfig.connection
 */
let connectMongoDB = function (cb) {
    const mongoDB = mongoDBConfig.url + mongoDBConfig.name;
    Mongoose.connect(mongoDB, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, autoIndex: true });
    mongoDBConfig.mongoose = Mongoose;
    mongoDBConfig.connection = Mongoose.connection;
    mongoDBConfig.connection.on('error', console.error.bind(console, 'Connection error:'));
    mongoDBConfig.connection.once('open', function () {
        console.log("Connection to mongodb established");

        // para testes
        Mongoose.connection.db.dropDatabase();


        createUserCollection();
        createAnimalCollection();
        createAdoptionCollection();
        createMovementCollection();



        // Isto APAGA a colecção "user"; Só para testes!!!!!
        /*Mongoose.connection.collections['users'].drop(function (err) {
            console.log('collection users dropped');
        });
        Mongoose.connection.collections['animals'].drop(function (err) {
            console.log('collection animals dropped');
        });
        Mongoose.connection.collections['adoptions'].drop(function (err) {
            console.log('collection adoptions dropped');
        });*/

        // Para testar; APAGAR -------------------------------
        let testUserEmailAdmin = "a@a";
        let testUserProfileAdmin = "administrador";
        getUserByEmail(testUserEmailAdmin, function (err, result) {
            if (result) {
                updateUser({ _id: result._id, profile: testUserProfileAdmin }, function (err, result) {
                })
            } else {
                insertUser("Anabela Carrapateira", testUserEmailAdmin, "a", "1234654651", new Date(), function (err, res) {
                    updateUser({ _id: res._id, profile: testUserProfileAdmin }, function (err, result) {
                    })
                });
            }
        })
        let testUserProfileFunc = "funcionário";
        insertUser("André Feitor", "a@f", "a", "1234654651", new Date(), function (err, res) {
            updateUser({ _id: res._id, profile: testUserProfileFunc }, function (err, result) {
            })
        });

        let AnimalTeste = mongoDBConfig.collections[1].model;
        let newAnimal1 = new AnimalTeste();
        newAnimal1.name = "Princesa";
        newAnimal1.birthday = new Date();
        newAnimal1.gender = "Female";
        newAnimal1.vaccinated = true;
        newAnimal1.sterilized = true;
        newAnimal1.photoLink = "https://i.pinimg.com/474x/17/30/96/17309677f9320c574517dff1f0897bf6--rhinos-god.jpg";
        newAnimal1.dog = false;
        newAnimal1.state = "Adotado";
        newAnimal1.save(function (err, doc) {
            if (err) {
                console.log(err)
            } else {
                newAnimal1._id = doc._id;
                insertUser("Arlequim Farofa", "c@f", "a", "1234654651", new Date(), function (err, res) {
                    updateUser({ _id: res._id, profile: testUserProfileFunc }, function (err, result) {
                        let adoption = {
                            user_id: res.user_id,
                            animal_id: newAnimal1._id,
                            adoptionDate: (new Date()).toISOString()
                        }
                        insertAdoption(adoption, function (res) {
                            if (err) console.log(err)
                        });
                    })
                });
            }
        });

        let newAnimal2 = new AnimalTeste();
        newAnimal2.name = "Tareco";
        newAnimal2.birthday = new Date();
        newAnimal2.gender = "Male";
        newAnimal2.vaccinated = true;
        newAnimal2.sterilized = true;
        newAnimal2.photoLink = "https://3.bp.blogspot.com/-OOvDRRDXc7g/Td2WkJuq1yI/AAAAAAAABp8/5rx6z6ApVAM/s1600/baboon2.jpg";
        newAnimal2.dog = true;
        newAnimal2.state = "Adotado";
        newAnimal2.save(function (err, doc) {
            if (err) {
                console.log(err)
            } else {
                newAnimal2._id = doc._id;
                insertUser("Ana Fonseca", "b@f", "a", "1234654651", new Date(), function (err, res) {
                    if (err) console.log(err)
                    updateUser({ _id: res._id, profile: testUserProfileFunc }, function (err, result) {
                        if (err) console.log(err)
                        let adoption2 = {
                            user_id: res.user_id,
                            animal_id: newAnimal2._id,
                            adoptionDate: (new Date()).toISOString()
                        }
                        insertAdoption(adoption2, function (res) {
                            if (err) console.log(err)
                        });
                    })
                });
            }
        });
        let newAnimal3 = new AnimalTeste();
        newAnimal3.name = "Tofu";
        newAnimal3.birthday = new Date();
        newAnimal3.gender = "Male";
        newAnimal3.vaccinated = false;
        newAnimal3.sterilized = true;
        newAnimal3.photoLink = "https://www.zambiatourism.com/media/crocodile-013-1280x960.jpg";
        newAnimal3.dog = true;
        newAnimal3.state = "Disponível";
        newAnimal3.save(function (err, doc) {
            if (err) {
                console.log(err)
            }
        });
        // FIM: Para testar; APAGAR -------------------------------

        cb();
    });
    //createUserCollection();
};
//require('./schemas/animal.model');

/**
 * Creates mongoDB collection "User"
 */
let createUserCollection = function () {
    const userSchema = new Schema(require("./schemas/user.js"), { collection: usersCollectionName });
    autoIncrement.initialize(mongoDBConfig.connection);
    userSchema.plugin(autoIncrement.plugin, { model: 'userModel', field: 'user_id', startAt: 1 });

    mongoDBConfig.collections.forEach(element => {
        if (element.name === usersCollectionName) {
            element.schema = userSchema;
            element.schema.plugin(passportLocalMongoose);
            element.schema.pre('save', function (next) {
                let user = this;
                if (!user.isModified('password')) {
                    return next();
                }
                bcrypt.genSalt(element.saltRounds, function (err, salt) {
                    bcrypt.hash(user.password, salt, null, function (err, hash) {
                        user.password = hash;
                        next();
                    });
                });
            });
            element.schema.statics.validatePassword = validatePassword;
            element.schema.statics.getUserCollectionIndex = getUserCollectionIndex;
            element.schema.statics.insertUser = insertUser;
            element.schema.statics.getUserByEmail = getUserByEmail;
            element.schema.statics.getUserById = getUserById;
            element.schema.statics.getUserByProfile = getUserByProfile;
            element.schema.statics.getUser = getUser;
            element.schema.statics.updateUser = updateUser;
            element.schema.statics.deleteUser = deleteUser;
            element.model = Mongoose.model('userModel', userSchema);
        }
    })
}


let createAnimalCollection = function () {
    const animalSchema = new Schema(require("./schemas/animal.model.js"), { collection: animalsCollectionName });
    autoIncrement.initialize(mongoDBConfig.connection);
    animalSchema.plugin(autoIncrement.plugin, { model: 'animalModel', field: 'animal_id', startAt: 1 });

    mongoDBConfig.collections.forEach(element => {
        if (element.name === animalsCollectionName) {
            element.schema = animalSchema;
            element.model = Mongoose.model('animalModel', animalSchema);
        }
    })
}


let createAdoptionCollection = function () {
    const adoptionSchema = new Schema(require("./schemas/adoptions.js"), { collection: adoptionsCollectionName });
    autoIncrement.initialize(mongoDBConfig.connection);
    adoptionSchema.plugin(autoIncrement.plugin, { model: 'adoptionModel', field: 'adoption_id', startAt: 1 });

    mongoDBConfig.collections.forEach(element => {
        if (element.name === adoptionsCollectionName) {
            element.schema = adoptionSchema;
            element.schema.statics.getAdoptionCollectionIndex = getAdoptionCollectionIndex;
            element.schema.statics.insertAdoption = insertAdoption;
            element.schema.statics.getAdoption = getAdoption;
            element.schema.statics.updateAdoption = updateAdoption;
            element.schema.statics.deleteAdoption = deleteAdoption;
            element.model = Mongoose.model('adoptionModel', adoptionSchema);
        }
    })
}

let createMovementCollection = function () {
    const movementSchema = new Schema(require("./schemas/movements.js"), { collection: movementsCollectionName });
    autoIncrement.initialize(mongoDBConfig.connection);
    movementSchema.plugin(autoIncrement.plugin, { model: 'movementModel', field: 'movement_id', startAt: 1 });

    mongoDBConfig.collections.forEach(element => {
        if (element.name === movementsCollectionName) {
            element.schema = movementSchema;

            element.schema.statics.getMovement = getMovement;
            element.schema.statics.insertMovement = insertMovement;
            element.model = Mongoose.model('movementModel', movementSchema);
        }
    })
}

/**
 * CREATE: Inserts new user into mongoDB
 * @param {*} name User name
 * @param {*} email User email
 * @param {*} password User password
 * @param {*} phone User phone number
 * @param {*} profile User profile (ie, worker or volunteer)
 * @param {*} birthDate User birth date
 */
let insertUser = function (name, email, password, phone, birthDate, callback) {
    let index = getCollectionIndex(usersCollectionName);
    if (index === -1) {
        console.error("Collection " + usersCollectionName + " not in mongoDBConfig");
    }
    //mongoDBConfig.collections[index].model.findOne({}).sort({ $natural: -1 }).exec((err, result) => {
    const newUser = {
        username: name,
        email: email,
        password: password,
        phone: phone,
        birthDate: birthDate
    }
    // Insert
    mongoDBConfig.collections[0].model.create(newUser, function (err, res) {
        if (err) return console.error("error: " + err);
        callback(err, res);
    });
    //});
}



/**
 * CREATE: Inserts new adoption into mongoDB
 * @param {*} user_id User id (integer)
 * @param {*} animal_id animal id (objectID, string)
 * @param {*} callback 
 */
let insertAdoption = function (adoptionData, callback) {
    let index = getCollectionIndex(adoptionsCollectionName);
    if (index === -1) {
        console.error("Collection " + adoptionsCollectionName + " not in mongoDBConfig");
    }
    /*
    const newAdoption = {
        user_id: adoptionData.user_id,
        animal_id: adoptionData.animal_id,
        adoptionDate: adoptionData.adoptionDate
    }*/
    // Insert
    mongoDBConfig.collections[index].model.create(adoptionData, function (err, res) {
        if (err) return console.error("error: " + err);
        callback(res);
    });
}

let insertMovement = function (movementData, callback) {
    let index = getCollectionIndex(movementsCollectionName);
    if (index === -1) {
        console.error("Collection " + movementsCollectionName + " not in mongoDBConfig");
    }
    // Insert
    mongoDBConfig.collections[index].model.create(movementData, function (err, res) {
        if (err) return console.error("error: " + err);
        callback(res);
    });
}


/**
 * READ: returns user with given email address
 * @param {*} email user email
 * @param {*} callback
 * @returns user object
 */
let getUserByEmail = function (email, callback) {
    const index = getCollectionIndex(usersCollectionName);
    if (index === -1) {
        return -1;
    }
    mongoDBConfig.collections[index].model.findOne({ email: email }).exec((err, result) => {
        if (err) console.log(err);

        callback(err, result);
    });
}


/**
 * READ: returns user with given id
 * @param {*} id mongo document _id (ObjectID: hexadecimal as a string)
 * @returns user object
 */
let getUserById = function (id, callback) {
    const index = getCollectionIndex(usersCollectionName);
    if (index === -1) {
        return -1;
    }
    mongoDBConfig.collections[index].model.findById(id, function (err, result) {
        if (err) console.log(err);
        callback(err, result);
    });
}


/**
 * READ: returns users with given profile
 * @param {*} profile "administrador", "funcionário", "voluntário"
 * @param {*} callback
 * @returns users object array
 */
let getUserByProfile = function (profile, callback) {
    const index = getCollectionIndex(usersCollectionName);
    if (index === -1) {
        return -1;
    }
    mongoDBConfig.collections[index].model.find({ profile: profile.toLowerCase() }, function (err, result) {
        if (err) console.log(err);
        callback(err, result);
    });
}

/**
 * READ: returns users with given query parameters
 * @param {*} searchObject 
 * @param {*} callback
 * @returns users object array
 */
let getUser = function (searchObject, callback) {
    const index = getCollectionIndex(usersCollectionName);
    if (index === -1) {
        return -1;
    }
    mongoDBConfig.collections[index].model.find(searchObject, function (err, result) {
        if (err) console.log(err);
        callback(err, result);
    });
}


/**
 * READ: returns adoptions with given query parameters
 * @param {*} searchObject 
 * @param {*} callback
 * @returns adoptions object array 
 */
let getAdoption = function (searchObject, callback) {
    const index = getCollectionIndex(adoptionsCollectionName);
    if (index === -1) {
        return -1;
    }
    mongoDBConfig.collections[index].model.find(searchObject, function (err, result) {
        if (err) console.log(err);
        callback(err, result);
    });
}

let getMovement = function (searchObject, callback) {
    const index = getCollectionIndex(movementsCollectionName);
    if (index === -1) {
        return -1;
    }
    mongoDBConfig.collections[index].model.find(searchObject, function (err, result) {
        if (err) console.log(err);
        callback(err, result);
    });
}

/**
 * UPDATE:updates user data
 * @param {*} newUserData Object with properties to be changed (_id required and immutable). eg, {_id:"...", username:"Ana"}
 */
let updateUser = function (newUserData, callback) {
    const index = getCollectionIndex(usersCollectionName);
    if (index === -1) {
        return -1;
    }
    mongoDBConfig.collections[index].model.findOneAndUpdate({ _id: newUserData._id }, newUserData, { new: true }, function (err, data) {
        if (err) console.log(err);
        callback(err, data);
    });
}


/**
 * UPDATE:updates adoption data
 * @param {*} newAdoptionData Object with properties to be changed (_id required and immutable). eg, {_id:"...", name:"Bobby"}
 */
let updateAdoption = function (newAdoptionData, callback) {
    const index = getCollectionIndex(adoptionsCollectionName);
    if (index === -1) {
        return -1;
    }
    mongoDBConfig.collections[index].model.findOneAndUpdate({ _id: newAdoptionData._id }, newAdoptionData, { new: true }, function (err, data) {
        if (err) console.log(err);
        callback(err, data);
    });
}



/**
 * DELETE: deletes user with given id
 * @param {*} id mongo document _id (ObjectID: hexadecimal as a string)
 */
let deleteUser = function (id, callback) {
    const index = getCollectionIndex(usersCollectionName);
    if (index === -1) {
        return -1;
    }
    mongoDBConfig.collections[index].model.findOneAndRemove({ user_id: id }, function (err, data) {
        if (err) console.log(err);
        //console.log("data: ", data)
        //  eg, if(data.deletedCount ===1)...
        callback(data);
    });
}


/**
 * DELETE: deletes adoption with given id
 * @param {*} id mongo document _id (ObjectID: hexadecimal as a string)
 */
let deleteAdoption = function (id, callback) {
    const index = getCollectionIndex(adoptionsCollectionName);
    if (index === -1) {
        return -1;
    }
    mongoDBConfig.collections[index].model.findOneAndRemove({ adoption_id: id }, function (err, data) {
        if (err) console.log(err);
        callback(data);
    });
}







/**
 * Returns index of the collection in mongoDBConfig.collections[] 
 * @param {*} collectionName 
 */
let getCollectionIndex = function (collectionName) {
    let index = -1;
    for (let i = 0; i < mongoDBConfig.collections.length; i++) {
        if (mongoDBConfig.collections[i].name === collectionName) {
            index = i;
            break;
        }
    }
    return index;
}


/**
 * Returns index of the collection in mongoDBConfig.collections[] 
 * @param {*} collectionName 
 */
let getUserCollectionIndex = function () {
    let index = -1;
    for (let i = 0; i < mongoDBConfig.collections.length; i++) {
        if (mongoDBConfig.collections[i].name === usersCollectionName) {
            index = i;
            break;
        }
    }
    return index;
}


/**
 * Returns index of the collection in mongoDBConfig.collections[] 
 * @param {*} collectionName 
 */
let getAdoptionCollectionIndex = function () {
    let index = -1;
    for (let i = 0; i < mongoDBConfig.collections.length; i++) {
        if (mongoDBConfig.collections[i].name === adoptionsCollectionName) {
            index = i;
            break;
        }
    }
    return index;
}

/**
 * Compares and validates password
 * @param {*} password user input
 * @param {*} StoredHashedPassword password in database
 */
let validatePassword = function (password, StoredHashedPassword) {
    return (bcrypt.compareSync(password, StoredHashedPassword));
};



// Listens for the signal interruption (ctrl-c); Closes the MongoDB connection
process.on('SIGINT', () => {
    //mongoDBConfig.connection.close();
    Mongoose.disconnect();
    process.exit();
});




module.exports.connectMongoDB = connectMongoDB;
module.exports.mongoDBConfig = mongoDBConfig;