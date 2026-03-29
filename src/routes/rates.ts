import { Router, Request, Response } from 'express';
import { supabaseService } from '../services/supabase';
import { exchangeRateService } from '../services/exchangeRate';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    let base = req.query.base as string;
    const targetsQuery = req.query.targets as string;

    if (!targetsQuery) {
      return res
        .status(400)
        .json({ error: 'targets parameter is required (e.g., targets=EUR,GBP)' });
    }

    const targets = targetsQuery.split(',').map((t) => t.trim().toUpperCase());

    if (!base) {
      const user = await supabaseService.getUser(userId);

      if (!user) {
        await supabaseService.createUser(userId);
        base = 'USD';
      } else {
        base = user.base_currency;
      }
    } else {
      base = base.toUpperCase();
    }

    const rates: Record<string, number> = {};
    const missingTargets: string[] = [];

    // Проверяем кэш в БД (на 24 часа) для каждой запрошенной валюты
    for (const target of targets) {
      if (base === target) {
        rates[target] = 1;
        continue;
      }

      const cachedRate = await supabaseService.getExchangeRate(base, target);
      if (cachedRate) {
        rates[target] = cachedRate.rate;
      } else {
        missingTargets.push(target);
      }
    }

    if (missingTargets.length > 0) {
      const externalRates = await exchangeRateService.getRates(base, missingTargets);

      for (const target of missingTargets) {
        const rate = externalRates[target];
        if (rate !== undefined) {
          rates[target] = rate;
          await supabaseService.saveExchangeRate(base, target, rate);
        }
      }
    }

    res.json({
      base,
      rates,
    });
  } catch (error) {
    console.error('Error in /api/rates:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

export default router;
