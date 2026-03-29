import axios from 'axios';
import { config } from '../config';

class ExchangeRateService {
  private baseUrl = 'https://v6.exchangerate-api.com/v6';

  async getCurrencies(): Promise<string[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${config.exchangeApiKey}/codes`
      );
      
      if (response.data.result === 'success') {
        return response.data.supported_codes.map((code: [string, string]) => code[0]);
      }
      
      throw new Error('Failed to fetch currencies');
    } catch (error) {
      console.error('Error fetching currencies:', error);
      return ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'RUB'];
    }
  }

  async getRates(base: string, targets: string[]): Promise<{ [key: string]: number }> {
    const rates: { [key: string]: number } = {};

    try {
      const response = await axios.get(
        `${this.baseUrl}/${config.exchangeApiKey}/latest/${base}`
      );

      if (response.data.result === 'success') {
        const conversionRates = response.data.conversion_rates;
        
        for (const target of targets) {
          if (conversionRates[target]) {
            rates[target] = conversionRates[target];
          }
        }
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw new Error('Failed to fetch exchange rates');
    }

    return rates;
  }
}

export const exchangeRateService = new ExchangeRateService();