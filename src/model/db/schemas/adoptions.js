module.exports = {
    adoption_id: {
        type: "number",
        min: 1,
        unique: true,
        required: true,
        index: true
    },
    user_id: {
        type: "number",
        min: 1,
        required: true
    },
    animal_id: {
        type: "string",
        required: true
    },
    adoptionDate: {
        type: "date",
        required: true,
        default: new Date()
    }
}