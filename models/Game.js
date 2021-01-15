/** Game Model
 * A mongoose schema that defines the shape of a game in DB
 */

const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    difficulty: {
        type: String,
        required: true,
    },
    gameType: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        default: 0,
    },
    duration: {
        type: Number,
        required: true,
    },
    questionsAnswers: {
        type: Object,
        required: true,
    },
});

module.exports = mongoose.model('Game', GameSchema);
