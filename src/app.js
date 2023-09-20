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
        winston.format.json()
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

process.on('uncaughtException', (error) => {
    // Log the uncaught exception and exit the process if needed
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    // Log unhandled promise rejections
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

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
    const startTime = new Date();

    // Log request details
    logger.info(`${req.method} ${req.url} ${req.ip}`);

    // Log request headers
    logger.info('Request Headers:', req.headers);

    // Log query parameters (if applicable)
    if (Object.keys(req.query).length > 0) {
        logger.info('Query Parameters:', req.query);
    }

    // Continue with the request
    next();

    // Log response status code and response time after the response is sent
    res.on('finish', () => {
        const endTime = new Date();
        const responseTime = endTime - startTime;

        logger.info(`Response Status Code: ${res.statusCode}`);
        logger.info(`Response Time: ${responseTime}ms`);

    });
});

export default app;
