import { Router, Request, Response } from 'express';
import { exchangeRateService } from '../services/exchangeRate';
import { memoryCache } from '../services/cache';
import { config } from '../config';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const cacheKey = 'currencies_list';

    let currencies = memoryCache.get<string[]>(cacheKey);

    if (!currencies) {
      currencies = await exchangeRateService.getCurrencies();
      memoryCache.set(cacheKey, currencies, config.cache.currenciesCacheDuration);
    }

    res.json({
      currencies,
      count: currencies.length,
    });
  } catch (error) {
    console.error('Error in /api/currencies:', error);
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
});

export default router;
