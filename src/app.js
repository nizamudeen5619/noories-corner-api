import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import winston from 'winston';
import compression from 'compression';

import './db/mongoose.js';

import userRouter from './routers/user.js';
import amazonRouter from './routers/amazon.js';
import meeshoRouter from './routers/meesho.js';


// Create a Winston logger instance
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    defaultMeta: { service: 'noories-corner-api' },
    transports: [
        new winston.transports.Console(),
    ]
});


//create an express app
const app = express();

// Middleware
const allowedOrigins = ['http://localhost:4200']; // Add your frontend's domains
const corsOptions = {
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // This allows cookies and other credentials to be included in requests
};

app.use(cors(corsOptions)); // Use cors middleware with the defined options

app.use(express.json());
app.use(helmet());
app.use(compression());

// Routes
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}`, userRouter);
app.use(`/api/${apiVersion}`, amazonRouter);
app.use(`/api/${apiVersion}`, meeshoRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    const statusCode = err.status || 500;
    let errorMessage = '';
    if (err.name === 'ValidationError') {
        statusCode = 400; // Bad Request
        // Handle Mongoose validation error
        errorMessage = 'Validation error. Please check your input.';
    } else if (err.name === 'MongoError') {
        statusCode = 409; // Conflict 
        // Handle MongoDB error (e.g., duplicate key)
        errorMessage = 'Database error. Please try again later.';
    } else {
        errorMessage = err.message;
    }
    res.status(statusCode).json({
        message: errorMessage || 'Internal Server Error'
    });
});

// Logging middleware
app.use((req, res, next) => {
    // Add a timestamp to the Winston logs
    console.log('info');
    logger.info(`${req.method} ${req.url}`);
    next();
});

export default app;
