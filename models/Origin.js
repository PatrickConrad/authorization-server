const mongoose = require('mongoose');

const originSchema = new mongoose.Schema({
    url: {
        type: String,
        lowercase: true,
        required: [true, "Need to enter a origin url"]
    },
    creatorId: {
        type: String,
        required: [true, "must have a user id"],
        default: "6097d748fc3f9746d8c343a4"
    },
    token: {
        type: String,
        required: [true, "Must have token"]
    },
    groupIds: [{
        type: String
    }]

})

const Origin = mongoose.model("Origin", originSchema);

module.exports =  Origin;