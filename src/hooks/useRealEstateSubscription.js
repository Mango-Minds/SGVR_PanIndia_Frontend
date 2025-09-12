import { useState, useEffect } from 'react';
import { realEstateSubscriptionService } from '../services/realEstateSubscription.service';

export const useRealEstateSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    isPremium: false,
    subscription: null,
    remainingDays: 0,
    loading: true,
    error: null
  });

  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);

  // Fetch subscription status
  const fetchSubscriptionStatus = async () => {
    try {
      setSubscriptionStatus(prev => ({ ...prev, loading: true, error: null }));
      const response = await realEstateSubscriptionService.getSubscriptionStatus();
      
      if (response.status === 0) {
        setSubscriptionStatus({
          isPremium: response.data.isPremium,
          subscription: response.data.subscription,
          remainingDays: response.data.remainingDays,
          loading: false,
          error: null
        });
      } else {
        setSubscriptionStatus(prev => ({
          ...prev,
          loading: false,
          error: response.msg
        }));
      }
    } catch (error) {
      console.error('Error fetching real estate subscription status:', error);
      setSubscriptionStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch subscription status'
      }));
    }
  };

  // Fetch subscription plans
  const fetchSubscriptionPlans = async () => {
    try {
      const response = await realEstateSubscriptionService.getSubscriptionPlans();
      if (response.status === 0) {
        setSubscriptionPlans(response.data);
      }
    } catch (error) {
      console.error('Error fetching real estate subscription plans:', error);
    }
  };

  // Fetch subscription history
  const fetchSubscriptionHistory = async () => {
    try {
      const response = await realEstateSubscriptionService.getSubscriptionHistory();
      if (response.status === 0) {
        setSubscriptionHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching real estate subscription history:', error);
    }
  };

  // Subscribe to a plan
  const subscribe = async (subscriptionId, couponCode = null) => {
    try {
      const response = await realEstateSubscriptionService.subscribe(subscriptionId, couponCode);
      if (response.status === 0) {
        // Refresh subscription status after successful subscription
        await fetchSubscriptionStatus();
        await fetchSubscriptionHistory();
        return response;
      } else {
        throw new Error(response.msg);
      }
    } catch (error) {
      console.error('Error subscribing to real estate plan:', error);
      throw error;
    }
  };

  // Validate coupon
  const validateCoupon = async (couponCode, planName) => {
    try {
      const response = await realEstateSubscriptionService.validateCoupon(couponCode, planName);
      return response;
    } catch (error) {
      console.error('Error validating coupon:', error);
      throw error;
    }
  };

  // Load subscription status on mount
  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  return {
    subscriptionStatus,
    subscriptionPlans,
    subscriptionHistory,
    fetchSubscriptionStatus,
    fetchSubscriptionPlans,
    fetchSubscriptionHistory,
    subscribe,
    validateCoupon
  };
};
