const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ExpressError = require('../helpers/expressError');

const WORK_FACTOR = Number(process.env.WORK_FACTOR);

router.post('/register', async (req, res, next) => {
    try {
        const { firstName, lastName, username, password } = req.body;

        if (!username || !password) {
            throw new ExpressError('Username and Password are required to register a new user', 400);
        }

        let user = await User.findOne({ username });

        if (user) {
            // User already exists
            throw new ExpressError('Username is already taken', 400);
        } else {
            const hashedPassword = await bcrypt.hash(password, WORK_FACTOR);

            const newUser = {
                firstName,
                lastName,
                username,
                password: hashedPassword,
            };

            // Create a new user
            user = await User.create(newUser);

            // Create a new JWT
            const token = jwt.sign({ username }, process.env.SESSION_SECRET);

            return res.status(201).json({ token });
        }
    } catch (e) {
        return next(e);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username }, 'username password');

        if (!user) {
            throw new ExpressError('Incorrect username or password', 400);
        } else {
            if ((await bcrypt.compare(password, user.password)) === true) {
                // If password matches, create JWT
                const token = jwt.sign({ username }, process.env.SESSION_SECRET);

                return res.status(200).json({ token });
            } else {
                throw new ExpressError('Incorrect username or password', 400);
            }
        }
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
