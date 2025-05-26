// ! IMPORTS
import express from 'express';
import configureMiddleware from '../config/apiConfigMiddleware.config';

// ! Routes Imports
import authRoutes from './Routes/auth.routes';
import userRoutes from './Routes/user.routes';
import videoRoutes from './Routes/video.routes';


// ! Middleware
const app = express();

// Configure the safety middleware
configureMiddleware(app);


// ! Routes
// Use the routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', videoRoutes);


// ! EXPORT
export { app };