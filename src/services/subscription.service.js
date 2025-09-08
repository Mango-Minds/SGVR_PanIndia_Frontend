import apiClient from '../store/apiClient';

export const subscriptionService = {
  // Get user's subscription status
  getSubscriptionStatus: async () => {
    try {
      const response = await apiClient.get('/matrimony-subscription/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      throw error;
    }
  },

  // Validate coupon code
  validateCoupon: async (couponCode, planName) => {
    try {
      const response = await apiClient.post('/matrimony-subscription/validate-coupon', {
        couponCode,
        planName,
      });
      return response.data;
    } catch (error) {
      console.error('Error validating coupon:', error);
      throw error;
    }
  },

  // Create subscription
  subscribe: async (subscriptionId, couponCode = null) => {
    try {
      const response = await apiClient.post('/matrimony-subscription/subscribe', {
        subscriptionId,
        couponCode,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Get available subscription plans
  getSubscriptionPlans: async () => {
    try {
      const response = await apiClient.get('/matrimony-subscription/plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  },

  // Get user's subscription history
  getSubscriptionHistory: async () => {
    try {
      const response = await apiClient.get('/matrimony-subscription/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      throw error;
    }
  },
};
