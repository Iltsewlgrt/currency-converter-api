import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000;

export function memoryCacheMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'GET') {
    return next();
  }

  const userId = (req as any).userId;
  if (!userId) {
    return next();
  }

  const cacheKey = `${userId}_${req.originalUrl}`;

  const cachedEntry = cache.get(cacheKey);
  const now = Date.now();

  // Проверяем, есть ли запись в кэше и не прошло ли 5 минут
  if (cachedEntry && (now - cachedEntry.timestamp < CACHE_DURATION)) {
    console.log(`[CACHE HIT] Отдаем из памяти: ${req.originalUrl}`);
    return res.json(cachedEntry.data);
  }

  const originalJson = res.json.bind(res);

  res.json = (body: any) => {
    cache.set(cacheKey, {
      data: body,
      timestamp: Date.now(),
    });

    console.log(`[CACHE SAVED] Сохранили в память: ${req.originalUrl}`);
    
    return originalJson(body);
  };

  next();
}