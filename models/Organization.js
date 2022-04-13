const mongoose = require('mongoose');

const organizationSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    type: {
        type: String,
        default: "developer",
        eNum: ["developer", "small business", "enterprise", "social", "work", "family", "emergency", "school", "local", "interest", "golobal", "regional", "managerial", "neighborhood"]
        
    },
    creatorId: {
        type: String,
        required: [true, "Must include creator Id"]
    },
    authServices: [{
        organizationSecret: {
            type: String,
            required: [true, "Add organization secret"]
        },
        userSecret: {
            type: String,
            required: [true, "Add organization secret"]
        },
        userSecretExp: {
            type: Number,
            default: 300000,
            required: [true, "Must include expire time"]
        },
        authUrl: {
            type: String,
            default: ''
        }
    }],
    users: [{
        userId: {
            type: String,
            required: [true, "Users must have an associated ID"]

        },
        userAccess: {
            type: String,
            default: 'user'
        }
    }]

})

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = Organization