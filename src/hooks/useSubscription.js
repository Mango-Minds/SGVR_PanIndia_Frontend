import { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscription.service';

export const useSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    isPremium: false,
    subscription: null,
    remainingDays: 0,
  });
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch subscription status
  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionService.getSubscriptionStatus();
      
      if (response.status === 0) {
        setSubscriptionStatus(response.data);
      } else {
        setError(response.msg);
      }
    } catch (err) {
      console.error('Error fetching subscription status:', err);
      setError('Failed to fetch subscription status');
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscription plans
  const fetchSubscriptionPlans = async () => {
    try {
      const response = await subscriptionService.getSubscriptionPlans();
      
      if (response.status === 0) {
        setSubscriptionPlans(response.data);
      } else {
        setError(response.msg);
      }
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
      setError('Failed to fetch subscription plans');
    }
  };

  // Subscribe to a plan
  const subscribeToPlan = async (subscriptionId, couponCode = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionService.subscribe(subscriptionId, couponCode);
      
      if (response.status === 0) {
        // Refresh subscription status after successful subscription
        await fetchSubscriptionStatus();
        return response.data;
      } else {
        setError(response.msg);
        throw new Error(response.msg);
      }
    } catch (err) {
      console.error('Error subscribing to plan:', err);
      setError('Failed to subscribe to plan');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Validate coupon
  const validateCoupon = async (couponCode, planName) => {
    try {
      const response = await subscriptionService.validateCoupon(couponCode, planName);
      
      if (response.status === 0) {
        return response.data;
      } else {
        throw new Error(response.msg);
      }
    } catch (err) {
      console.error('Error validating coupon:', err);
      throw err;
    }
  };

  // Initialize subscription data
  useEffect(() => {
    const initializeSubscription = async () => {
      await Promise.all([
        fetchSubscriptionStatus(),
        fetchSubscriptionPlans(),
      ]);
    };

    initializeSubscription();
  }, []);

  return {
    subscriptionStatus,
    subscriptionPlans,
    loading,
    error,
    fetchSubscriptionStatus,
    fetchSubscriptionPlans,
    subscribeToPlan,
    validateCoupon,
  };
};
