import apiClient from '../store/apiClient';

export const realEstateSubscriptionService = {
  // Get user's real estate subscription status
  getSubscriptionStatus: async () => {
    try {
      const response = await apiClient.get('/real-estate-subscription/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching real estate subscription status:', error);
      throw error;
    }
  },

  // Validate coupon code for real estate subscription
  validateCoupon: async (couponCode, planName) => {
    try {
      const response = await apiClient.post('/real-estate-subscription/validate-coupon', {
        couponCode,
        planName,
      });
      return response.data;
    } catch (error) {
      console.error('Error validating coupon:', error);
      throw error;
    }
  },

  // Create real estate subscription
  subscribe: async (subscriptionId, couponCode = null) => {
    try {
      const response = await apiClient.post('/real-estate-subscription/subscribe', {
        subscriptionId,
        couponCode,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating real estate subscription:', error);
      throw error;
    }
  },

  // Get available real estate subscription plans
  getSubscriptionPlans: async () => {
    try {
      const response = await apiClient.get('/real-estate-subscription/plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching real estate subscription plans:', error);
      throw error;
    }
  },

  // Get user's real estate subscription history
  getSubscriptionHistory: async () => {
    try {
      const response = await apiClient.get('/real-estate-subscription/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching real estate subscription history:', error);
      throw error;
    }
  },
};
