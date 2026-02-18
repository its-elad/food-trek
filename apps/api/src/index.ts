import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import { env } from './env.js';
import mongoose from 'mongoose';

dotenv.config()

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: env.CLIENT_URL || 'http://localhost:8080',
    credentials: true, // allow cookies to be sent cross-origin
  }),
);

mongoose.connect(env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB', err));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

app.get('/api', (_req: Request, res: Response) => {
  res.send('Welcome to the FoodTrek API');
});

app.get('/', (_req: Request, res: Response) => {
  res.send('Welcome to the FoodTrek API');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
