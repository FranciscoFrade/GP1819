module.exports = {
    movement_id: {
        type: "number",
        min: 1,
        unique: true,
        required: true,
        index: true
    },
    user_id: {
        type: "string",
        required: true
    },
    animal_id: {
        type: "string",
        required: true
    },
    date: {
        type: "date",
        required: true
    },
    isIn:{
        type: "boolean",
        required: true
    },
    isComplete: {
        type: "boolean",
        required: true
    }
}