import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Dhaka Tesla Pool API' });
});

app.listen(PORT, () => {
  console.log(`⚡ Dhaka Tesla Pool Backend is running on port ${PORT}`);
});