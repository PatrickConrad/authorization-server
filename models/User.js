const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        lowercase: true,
        required: [true, "Please provide a username"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "Please provide a email"],
        lowercase: true,
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email"
        ]
    },
    firstName: {
        type: String,
        required: [true, "Please add a first name."]
    },
    lastName: {
        type: String,
        required: [true, "Please add a last name."]
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: 6,
        select: false 
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    contactPreference: {
        type: String,
        enum: ['phone', 'email'],
        default: 'email'
    },
    phoneNumber: {
        type: String,
        minlength: 10
    },
    phoneCarrier: {
        type: String,
    },
    phoneCarrierEmail: {
        type: String
    },
    resetToken: {
        type: String,
        default: "",
        select: false 
    },
    phonePin: {
        type: String,
        default: "",
        select: false
    },
    verificationToken: {
        type: String,
        default: "",
        select: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    failedLogins: {
        type: Number,
        default: 0,
        expires: 30000
    },
    twoPointAuth: {
        type: Boolean,
        default: false
    },
    roles: {
        type:Array,
        default: ['user']
    },
    darkMode: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;