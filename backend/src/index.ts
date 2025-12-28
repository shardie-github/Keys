import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { profilesRouter } from './routes/profiles.js';
import { vibeConfigsRouter } from './routes/vibe-configs.js';
import { assemblePromptRouter } from './routes/assemble-prompt.js';
import { orchestrateAgentRouter } from './routes/orchestrate-agent.js';
import { feedbackRouter } from './routes/feedback.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/profiles', profilesRouter);
app.use('/vibe-configs', vibeConfigsRouter);
app.use('/assemble-prompt', assemblePromptRouter);
app.use('/orchestrate-agent', orchestrateAgentRouter);
app.use('/feedback', feedbackRouter);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
