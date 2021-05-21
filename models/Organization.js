const mongoose = require('mongoose');

const organizationSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    type: {
        type: String,
        default: "developer",
        // eNum: ["developer", "small business", "enterprise", "social", "work", "family", "emergency", "school", "local", "interest", "golobal", "regional", "managerial", "neighborhood"]
        
    },
    creatorId: {
        type: String,
        default: "6097d748fc3f9746d8c343a4"
    },
})

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = Organization