export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
  source: string;
}

export interface CurrencyConversion {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  convertedAmount: number;
  rate: number;
  timestamp: Date;
}

export class CurrencyService {
  private static cache: Map<string, { rate: number; timestamp: Date }> = new Map();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static readonly API_URL = 'https://api.exchangerate-api.com/v4/latest';

  static async getExchangeRate(from: string, to: string): Promise<number> {
    const cacheKey = `${from}-${to}`;
    const cached = this.cache.get(cacheKey);
    
    // Check if we have valid cached data
    if (cached && Date.now() - cached.timestamp.getTime() < this.CACHE_DURATION) {
      return cached.rate;
    }

    try {
      const response = await fetch(`${this.API_URL}/${from}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.rates || !data.rates[to]) {
        throw new Error(`Exchange rate for ${from} to ${to} not found`);
      }
      
      const rate = data.rates[to];
      
      // Cache the result
      this.cache.set(cacheKey, {
        rate,
        timestamp: new Date()
      });
      
      return rate;
      
    } catch (error) {
      console.error('Currency API error:', error);
      
      // Return cached data if available, even if expired
      if (cached) {
        console.warn('Using expired cached exchange rate');
        return cached.rate;
      }
      
      // Fallback rates (approximate)
      const fallbackRates: Record<string, number> = {
        'EUR-RON': 4.97,
        'RON-EUR': 0.201,
        'USD-RON': 4.56,
        'RON-USD': 0.219
      };
      
      const fallbackRate = fallbackRates[cacheKey];
      if (fallbackRate) {
        console.warn(`Using fallback exchange rate for ${from} to ${to}: ${fallbackRate}`);
        return fallbackRate;
      }
      
      throw new Error(`Unable to get exchange rate for ${from} to ${to}: ${error}`);
    }
  }

  static async convertCurrency(
    amount: number, 
    fromCurrency: string, 
    toCurrency: string
  ): Promise<CurrencyConversion> {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (fromCurrency === toCurrency) {
      return {
        amount,
        fromCurrency,
        toCurrency,
        convertedAmount: amount,
        rate: 1,
        timestamp: new Date()
      };
    }

    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amount * rate;

    return {
      amount,
      fromCurrency,
      toCurrency,
      convertedAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
      rate,
      timestamp: new Date()
    };
  }

  static async getCurrentRates(): Promise<ExchangeRate[]> {
    try {
      const [eurToRon, ronToEur] = await Promise.all([
        this.getExchangeRate('EUR', 'RON'),
        this.getExchangeRate('RON', 'EUR')
      ]);

      return [
        {
          from: 'EUR',
          to: 'RON',
          rate: eurToRon,
          lastUpdated: new Date(),
          source: 'ExchangeRate-API'
        },
        {
          from: 'RON',
          to: 'EUR',
          rate: ronToEur,
          lastUpdated: new Date(),
          source: 'ExchangeRate-API'
        }
      ];
    } catch (error) {
      console.error('Error fetching current rates:', error);
      throw error;
    }
  }

  static formatCurrency(amount: number, currency: string): string {
    const formatters: Record<string, Intl.NumberFormat> = {
      'EUR': new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
      'RON': new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }),
      'USD': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    };

    const formatter = formatters[currency];
    if (formatter) {
      return formatter.format(amount);
    }

    // Fallback formatting
    return `${amount.toFixed(2)} ${currency}`;
  }

  static clearCache(): void {
    this.cache.clear();
  }

  static getCacheInfo(): { size: number; entries: Array<{ key: string; rate: number; age: number }> } {
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      rate: value.rate,
      age: Date.now() - value.timestamp.getTime()
    }));

    return {
      size: this.cache.size,
      entries
    };
  }
}