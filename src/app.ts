// ! IMPORTS
import express from 'express';
import configureMiddleware from '../config/apiConfigMiddleware.config';

// ! Routes Imports
import authRoutes from './Routes/auth.routes';
import userRoutes from './Routes/user.routes';
import videoRoutes from './Routes/video.routes';
import commentRoutes from './Routes/comment.routes';
import conversationRoutes from './Routes/conversation.routes';
import followerRoutes from './Routes/follow.routes';


// ! Middleware
const app = express();

// Configure the safety middleware
configureMiddleware(app);


// ! Routes
// Use the routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', videoRoutes);
app.use('/api', commentRoutes);
app.use('/api', conversationRoutes);
app.use('/api', followerRoutes);


// ! EXPORT
export { app };