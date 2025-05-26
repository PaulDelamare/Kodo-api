// ! IMPORTS
import express, { Request } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { requestLog, rotateLog } from '../src/Utils/logFunction/logFunction';
import { logger } from '../src/Utils/logger/logger';
import createRateLimiter from '../src/Middlewares/rateLimiter/rateLimiter.middleware';
import { sanitizeRequestData } from '../src/Middlewares/sanitizeData/sanitizeData.middleware';
import passportConfig from './passport.config';
import passport from 'passport';
import { checkFileExists } from '../src/Utils/checkFileExist/checkFileExist';
import path from "path";


// ! FONCTION

/**
 * Configue Middleware for an express application
 * 
 * @param app - The Express application instance to configure middleware for.
 * 
 * The function sets up various middleware functionalities including:
 * - Parsing incoming request bodies as JSON.
 * - Enabling CORS for the API.
 * - Securing the API with Helmet.
 * - Compressing the response body with specific filter conditions.
 * - Trusting proxy settings for certain network interfaces.
 * - Limiting the number of requests per window via a rate limiter.
 * - Sanitizing request data to prevent malicious input.
 * - Logging and rotating logs for incoming requests, including method, URL, and IP information.
 */

const configureMiddleware = (app: express.Application) => {
    require('dotenv').config()

    // Use this middleware to parse the incoming request bodies
    app.use(express.json());

    // Cors for the API
    app.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'Origin', 'X-Requested-With', 'Accept'],
        exposedHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges', 'Content-Type'],
        credentials: true
    }));

    // Middleware for the api security
    app.use(helmet());

    // For compressing the response body
    app.use(compression(
        {
            threshold: 1024,
            filter: (req: Request) => {
                if (req.headers['x-no-compression']) {
                    return false;
                }
                return !req.path.match(/\.(jpg|jpeg|png|gif|pdf|svg|mp4)$/i);
            }
        }
    ));

    // Configure passport
    passportConfig(passport);

    // Middleware the proxy 
    app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

    // Defined the limit of the request
    const limiter = createRateLimiter(15, 100);
    app.use(limiter);

    // Middleware for the sanitize data
    app.use(sanitizeRequestData);

    // Middleware for have the log of the request
    app.use((req, res, next) => {
        rotateLog();
        requestLog(req, res, next);

        logger.info(` ${req.method} - ${req.url} - IP:  ${req.ip}`);
    });

    app.use(
        "/api/uploads/public",
        checkFileExists,
        // eslint-disable-next-line no-undef
        express.static(path.join(__dirname, "..", "uploads/public")),
    );
};

// ! EXPORT
export default configureMiddleware;
