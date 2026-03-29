import { Router, Request, Response } from 'express';
import { supabaseService } from '../services/supabase';

const router = Router();

// GET /api/user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    const user = await supabaseService.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error in GET /api/user:', error);
    res.status(500).json({ error: 'Failed to fetch user settings' });
  }
});

// POST /api/user
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { base_currency, favorites } = req.body;

    const updates: { base_currency?: string; favorites?: string[] } = {};

    if (base_currency) {
      if (!/^[A-Z]{3}$/.test(base_currency)) {
        return res.status(400).json({ error: 'base_currency must be a 3-letter ISO code' });
      }
      updates.base_currency = base_currency;
    }

    if (favorites) {
      if (!Array.isArray(favorites)) {
        return res.status(400).json({ error: 'favorites must be an array' });
      }
      if (!favorites.every((f: string) => /^[A-Z]{3}$/.test(f))) {
        return res.status(400).json({ error: 'All favorites must be 3-letter ISO codes' });
      }
      updates.favorites = favorites;
    }

    // Если обновлять нечего, просто возвращаем текущего пользователя
    if (Object.keys(updates).length === 0) {
      const user = await supabaseService.getUser(userId);
      return res.json(user);
    }

    const updatedUser = await supabaseService.updateUser(userId, updates);

    res.json(updatedUser);
  } catch (error) {
    console.error('Error in POST /api/user:', error);
    res.status(500).json({ error: 'Failed to update user settings' });
  }
});

export default router;