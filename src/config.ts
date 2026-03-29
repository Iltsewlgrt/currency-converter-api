import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_KEY || '',
  },
  exchangeApiKey: process.env.EXCHANGE_API_KEY || '',
  cache: {
    dbCacheDuration: 24 * 60 * 60 * 1000,
    memoryCacheDuration: 5 * 60 * 1000,
    currenciesCacheDuration: 60 * 60 * 1000,
  },
};
