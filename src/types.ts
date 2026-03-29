export interface UserSettings {
  user_id: string;
  base_currency: string;
  favorites: string[];
  created_at: string;
  updated_at: string;
}

export interface ExchangeRate {
  base_currency: string;
  target_currency: string;
  rate: number;
  cached_at: string;
}

export interface RatesResponse {
  base: string;
  rates: { [key: string]: number };
  timestamp: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
