module.exports = {
    animal_id: {
        type: "number",
        min: 1,
        unique: true,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    birthday: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    vaccinated: {
        type: Boolean,
        required: true
    },
    dog: {
        type: Boolean,
        required: true
    },
    sterilized: {
        type: Boolean,
        required: true
    },
    photoLink: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    }
}