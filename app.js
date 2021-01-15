const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const ExpressError = require('./helpers/expressError');
const { authenticateJWT } = require('./middleware/auth');

// ***** Express and MongoDB Setup *****
// Load config variables
require('dotenv').config({ path: './config/config.env' });

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Accept json requests
app.use(express.json());

// Cors middleware
app.use(cors());

// Setup morgan middleware for logging while in development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Global JWT Authentication Middleware
app.use(authenticateJWT);

// ***** Routes *****
app.use('/mathify', require('./routes/mathify'));
app.use('/auth', require('./routes/auth'));

// * Production Build Code
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('./client/build'));
} else {
    // ***** Error Handler Middlewares ******
    // 404 handler
    app.use(function (req, res, next) {
        const notFoundError = new ExpressError('Not Found', 404);
        return next(notFoundError);
    });

    // generic error handler
    app.use(function (err, req, res, next) {
        // the default status is 500 Internal Server Error
        let status = err.status || 500;
        let message = err.message;

        return res.status(status).json({
            error: { message, status },
        });
    });
}

module.exports = app;
