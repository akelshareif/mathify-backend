const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { ensureAuth } = require('../middleware/auth');
const ExpressError = require('../helpers/expressError');
const User = require('../models/User');
const Game = require('../Game');

// * Desc: Get User Data
router.get('/user', ensureAuth, async (req, res, next) => {
    try {
        const existingUser = await User.findOne({ username: req.user });
        return res.status(200).json({ user: existingUser });
    } catch (e) {
        return next(e);
    }
});

// * Desc: Delete User
router.post('/delete', ensureAuth, async (req, res, next) => {
    try {
        const { _token } = req.body;

        const { username } = jwt.verify(_token, process.env.SESSION_SECRET);

        await User.deleteOne({ username });

        return res.status(200).json({ msg: `User ${username} was deleted successfully` });
    } catch (e) {
        return next(e);
    }
});

// * Desc: Retrieve new game data
router.post('/new', ensureAuth, async (req, res, next) => {
    try {
        const { difficulty, gameType } = req.body;
        // const newGame = await Game.createGame(difficulty, gameType, '5fd7b25c6a5832112dc6bf48');
        const newGame = await Game.createGame(difficulty, gameType, req.user);

        if (!newGame) {
            throw new ExpressError('Error: New game failed to be created and saved to db');
        }

        return res.status(201).json(newGame);
    } catch (e) {
        return next(e);
    }
});

// * Desc: Check user answer to question
router.post('/answer', ensureAuth, async (req, res, next) => {
    try {
        const { gameType, ans1, ans2, question } = req.body;

        // const newScore = await Game.updateGameScore(gameID, ans1, ans2, question);
        const isCorrect = Game.isCorrectAnswer(gameType, ans1, ans2, question);

        return res.status(200).json({ isCorrect });
    } catch (e) {
        return next(e);
    }
});

// * Desc: Check if final score is a new high score
router.post('/gameover', ensureAuth, async (req, res, next) => {
    try {
        const { gameID, currentScore } = req.body;

        // const isNewHighScore = await Game.isNewHighScore(gameID, currentScore, '5fd7b25c6a5832112dc6bf48');
        const isNewHighScore = await Game.isNewHighScore(gameID, currentScore, req.user);

        return res.status(200).json({ isNewHighScore });
    } catch (e) {
        return next(e);
    }
});

// * Desc: Get current leaderboard
router.post('/leaderboard', ensureAuth, async (req, res, next) => {
    try {
        const { gameType, difficulty } = req.body;

        const leaderboard = await Game.getLeaderboard(gameType, difficulty);

        return res.status(200).json({ leaderboard });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
