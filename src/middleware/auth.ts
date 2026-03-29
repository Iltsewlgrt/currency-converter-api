import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabaseService } from '../services/supabase';

// Расширяем интерфейс Request для TypeScript, чтобы он знал о существовании req.userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    let userId = req.cookies.user_id;
    if (!userId) {
      userId = uuidv4();
      await supabaseService.createUser(userId);

      res.cookie('user_id', userId, {
        httpOnly: true, // Защита от кражи куки через JS
        maxAge: 365 * 24 * 60 * 60 * 1000, 
        sameSite: 'strict',
      });
    }

    req.userId = userId;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}