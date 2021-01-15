/** User Model
 * A mongoose schema that defines the shape of a user's data in DB
 */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    gamesPlayed: {
        type: Array,
    },
    highScores: {
        type: Object,
        default: {
            add: {
                easy: undefined,
                medium: undefined,
                hard: undefined,
            },
            subtract: {
                easy: undefined,
                medium: undefined,
                hard: undefined,
            },
            multiply: {
                easy: undefined,
                medium: undefined,
                hard: undefined,
            },
            divide: {
                easy: undefined,
                medium: undefined,
                hard: undefined,
            },
        },
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model('User', UserSchema);
