import axios from 'axios';
import { BASEAPIURL } from '../infrastructure/constants';
import authHeader from './auth.header';

/**
 * Gold Silver Rates Service
 * Handles API calls for live gold and silver rates
 * Includes polling mechanism for auto-refresh
 */

class GoldSilverRatesService {
  constructor() {
    this.updateInterval = 30000; // 30 seconds default
    this.pollingInterval = null;
    this.cache = {
      data: null,
      timestamp: null,
      ttl: 30000, // 30 seconds cache
    };
  }

  /**
   * Check if cached data is still valid
   */
  isCacheValid() {
    if (!this.cache.data || !this.cache.timestamp) {
      return false;
    }
    const now = Date.now();
    return (now - this.cache.timestamp) < this.cache.ttl;
  }

  /**
   * Fetch live rates from backend API
   */
  async fetchLiveRates() {
    try {
      const response = await axios.get(
        `${BASEAPIURL}/jewelry/live-rates`,
        {
          headers: await authHeader(),
        }
      );

      if (response.data && response.data.success) {
        // Update cache
        this.cache.data = response.data.data;
        this.cache.timestamp = Date.now();
        
        return response.data.data;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching live rates:', error);
      
      // Return cached data if available (even if expired)
      if (this.cache.data) {
        console.log('Returning cached data due to API error');
        return this.cache.data;
      }
      
      throw error;
    }
  }

  /**
   * Fetch only spot rates (lighter endpoint)
   */
  async fetchSpotRates() {
    try {
      const response = await axios.get(
        `${BASEAPIURL}/jewelry/live-rates/spot`,
        {
          headers: await authHeader(),
        }
      );

      if (response.data && response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching spot rates:', error);
      // Return default values if API fails
      return {
        gold: { spot: 6500, high: 6600, low: 6400 },
        silver: { spot: 85, high: 86, low: 84 },
        inr: { rate: 83.0 },
      };
    }
  }

  /**
   * Start polling for live rates
   * @param {Function} callback - Callback function to call with new data
   * @param {number} interval - Polling interval in milliseconds (default: 30000)
   */
  startPolling(callback, interval = this.updateInterval) {
    // Clear any existing polling
    this.stopPolling();

    // Initial fetch
    this.fetchLiveRates()
      .then((data) => {
        if (callback) callback(data);
      })
      .catch((error) => {
        console.error('Initial fetch failed:', error);
        if (callback) callback(null, error);
      });

    // Set up polling interval
    this.pollingInterval = setInterval(() => {
      this.fetchLiveRates()
        .then((data) => {
          if (callback) callback(data);
        })
        .catch((error) => {
          console.error('Polling fetch failed:', error);
          if (callback) callback(null, error);
        });
    }, interval);
  }

  /**
   * Stop polling for live rates
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Get cached data if available
   */
  getCachedData() {
    if (this.isCacheValid()) {
      return this.cache.data;
    }
    return null;
  }
}

// Export singleton instance
export default new GoldSilverRatesService();

