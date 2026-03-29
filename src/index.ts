import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from './config';
import { authMiddleware } from './middleware/auth';
import currenciesRouter from './routes/currencies';
import ratesRouter from './routes/rates';
import userRouter from './routes/user';
import { memoryCacheMiddleware } from './middleware/memoryCache';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);
app.use(memoryCacheMiddleware);

app.use('/api/currencies', currenciesRouter);
app.use('/api/rates', ratesRouter);
app.use('/api/currencies', currenciesRouter);
app.use('/api/rates', ratesRouter);
app.use('/api/user', userRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.json({
    message: 'Currency Converter API',
    version: '1.0.0',
    endpoints: {
      currencies: 'GET /api/currencies',
      rates: 'GET /api/rates?base=USD&targets=EUR,GBP',
      user: {
        get: 'GET /api/user',
        update: 'POST /api/user',
      },
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`GET  /api/currencies`);
  console.log(`GET  /api/rates?base=USD&targets=EUR,GBP`);
  console.log(`GET  /api/user`);
  console.log(`POST /api/user`);
});
