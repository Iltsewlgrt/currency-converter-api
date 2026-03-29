import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { UserSettings, ExchangeRate } from '../types';

const supabase = createClient(config.supabase.url, config.supabase.key);

export class SupabaseService {
  async createUser(userId: string): Promise<UserSettings> {
    const nowISO = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .insert({
        user_id: userId,            // первичный ключ, uuid
        base_currency: 'USD',       // по умолчанию USD при первом запросе
        favorites: [],              // массив строк
        created_at: nowISO,         // дата создания в формате ISO8601
        updated_at: nowISO,         // дата обновления в формате ISO8601
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUser(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateUser(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(), // обновляем время при любом изменении
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getExchangeRate(base: string, target: string): Promise<ExchangeRate | null> {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('base_currency', base)
      .eq('target_currency', target)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      const cachedTime = new Date(data.cached_at).getTime();
      const now = Date.now();
      
      // Проверка на 24 часа. 
      // Если config.cache.dbCacheDuration не задан, используем 24 * 60 * 60 * 1000 (86400000 мс)
      const maxCacheAge = config.cache?.dbCacheDuration || 86400000;

      // Если кэш устарел, возвращаем null, чтобы триггернуть запрос к стороннему API
      if (now - cachedTime > maxCacheAge) {
        return null;
      }
    }

    return data;
  }

  async saveExchangeRate(base: string, target: string, rate: number): Promise<void> {
    const { error } = await supabase
      .from('exchange_rates')
      .upsert({
        base_currency: base,
        target_currency: target,
        rate,
        cached_at: new Date().toISOString(), // фиксируем время сохранения в БД
      }, {
        // Указываем поля, по которым Supabase поймет, что нужно обновить запись, а не создать новую
        // Предполагается, что в БД есть уникальный индекс на пару (base_currency, target_currency)
        onConflict: 'base_currency, target_currency' 
      });

    if (error) throw error;
  }
}

export const supabaseService = new SupabaseService();