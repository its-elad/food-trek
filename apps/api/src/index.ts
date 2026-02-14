import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect(process.env.MONGO_URI ?? "")
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB', err));

app.get('/api', (_req: Request, res: Response) => {
  res.send('Welcome to the webapp API');
});

app.get('/', (_req: Request, res: Response) => {
  res.send('Welcome to the webapp API');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
