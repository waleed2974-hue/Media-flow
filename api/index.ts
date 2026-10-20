import express from 'express';
import apiRouter from '../server/routes/api';

const app = express();
app.use(express.json());

// Support both /api/* and direct path if Vercel routes to function
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
