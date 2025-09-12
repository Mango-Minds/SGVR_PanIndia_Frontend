import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useRealEstateSubscription } from '../../hooks/useRealEstateSubscription';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Theme from '../../styles/theme';

const RealEstateSubscriptionModal = ({ visible, onClose, onSubscribe }) => {
  const { t } = useTranslation();
  const {
    subscriptionPlans,
    subscriptionStatus,
    fetchSubscriptionPlans,
    fetchSubscriptionStatus,
    subscribe,
    validateCoupon
  } = useRealEstateSubscription();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponValid, setCouponValid] = useState(null);
  const [couponDetails, setCouponDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchSubscriptionPlans();
    }
  }, [visible]);

  // Reset coupon state when plan changes
  useEffect(() => {
    if (selectedPlan) {
      setCouponValid(null);
      setCouponDetails(null);
      setCouponCode('');
    }
  }, [selectedPlan]);

  const handleCouponValidation = async () => {
    if (!couponCode.trim() || !selectedPlan) return;

    setValidatingCoupon(true);
    try {
      const response = await validateCoupon(couponCode, selectedPlan.planName);
      if (response.status === 0) {
        setCouponValid(true);
        setCouponDetails(response.data.coupon);
        Alert.alert('Success', 'Coupon code is valid!');
      } else {
        setCouponValid(false);
        setCouponDetails(null);
        Alert.alert('Invalid Coupon', response.msg);
      }
    } catch (error) {
      setCouponValid(false);
      Alert.alert('Error', 'Failed to validate coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    setLoading(true);
    try {
      const response = await subscribe(selectedPlan._id, couponCode || null);
      if (response.status === 0) {
        // Refresh subscription status immediately
        await fetchSubscriptionStatus();
        
        Alert.alert(
          'Success',
          'Real estate subscription activated successfully! You can now create property listings.',
          [
            {
              text: 'OK',
              onPress: () => {
                onSubscribe && onSubscribe(response.data);
                onClose();
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to subscribe to plan');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `₹${price.toLocaleString()}`;
  };

  const formatValidity = (days) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  const calculateFinalPrice = () => {
    if (!selectedPlan) return 0;
    
    let finalPrice = selectedPlan.price;
    
    if (couponValid && couponDetails) {
      let discountAmount = 0;
      
      if (couponDetails.discountType === 'percentage') {
        discountAmount = (selectedPlan.price * couponDetails.discountValue) / 100;
        if (couponDetails.maxDiscountAmount && discountAmount > couponDetails.maxDiscountAmount) {
          discountAmount = couponDetails.maxDiscountAmount;
        }
      } else if (couponDetails.discountType === 'fixed') {
        discountAmount = couponDetails.discountValue;
      }
      
      finalPrice = Math.max(0, selectedPlan.price - discountAmount);
    }
    
    return finalPrice;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Real Estate Subscription</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.infoBox}>
            <Icon name="information" size={24} color={Theme.themeColor} />
            <Text style={styles.infoText}>
              Subscribe to create and manage property listings. Choose a plan that suits your needs.
            </Text>
          </View>

          {subscriptionStatus.isPremium && (
            <View style={styles.activeSubscriptionBox}>
              <Icon name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.activeSubscriptionText}>
                You have an active subscription with {subscriptionStatus.remainingDays} days remaining
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Available Plans</Text>
          
          {subscriptionPlans.map((plan) => (
            <TouchableOpacity
              key={plan._id}
              style={[
                styles.planCard,
                selectedPlan?._id === plan._id && styles.selectedPlanCard
              ]}
              onPress={() => setSelectedPlan(plan)}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.planName}</Text>
                <Text style={styles.planPrice}>{formatPrice(plan.price)}</Text>
              </View>
              <Text style={styles.planValidity}>Valid for {formatValidity(plan.validity)}</Text>
              <Text style={styles.planDescription}>{plan.description}</Text>
              
              {selectedPlan?._id === plan._id && (
                <View style={styles.selectedIndicator}>
                  <Icon name="check" size={20} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}

          {selectedPlan && (
            <View style={styles.couponSection}>
              <Text style={styles.sectionTitle}>Coupon Code (Optional)</Text>
              <View style={styles.couponInputContainer}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.validateButton}
                  onPress={handleCouponValidation}
                  disabled={validatingCoupon || !couponCode.trim()}
                >
                  {validatingCoupon ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.validateButtonText}>Validate</Text>
                  )}
                </TouchableOpacity>
              </View>
              
              {couponValid === true && (
                <Text style={styles.couponValidText}>✓ Coupon code is valid</Text>
              )}
              {couponValid === false && (
                <Text style={styles.couponInvalidText}>✗ Invalid coupon code</Text>
              )}
            </View>
          )}

          {selectedPlan && (
            <View style={styles.priceBreakdownSection}>
              <Text style={styles.sectionTitle}>Price Breakdown</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Original Price:</Text>
                <Text style={styles.priceValue}>{formatPrice(selectedPlan.price)}</Text>
              </View>
              {couponValid && couponDetails && (
                <>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Discount:</Text>
                    <Text style={styles.discountValue}>
                      -{couponDetails.discountType === 'percentage' 
                        ? `${couponDetails.discountValue}%` 
                        : formatPrice(couponDetails.discountValue)}
                    </Text>
                  </View>
                  <View style={[styles.priceRow, styles.finalPriceRow]}>
                    <Text style={styles.finalPriceLabel}>Final Price:</Text>
                    <Text style={styles.finalPriceValue}>{formatPrice(calculateFinalPrice())}</Text>
                  </View>
                </>
              )}
            </View>
          )}

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Subscription Benefits</Text>
            <View style={styles.featureItem}>
              <Icon name="check" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>Create unlimited property listings</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>Priority listing placement</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>Advanced analytics and insights</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>Premium customer support</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.subscribeButton, loading && styles.disabledButton]}
            onPress={handleSubscribe}
            disabled={loading || !selectedPlan}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.subscribeButtonText}>
                Subscribe Now - {selectedPlan ? formatPrice(calculateFinalPrice()) : 'Select Plan'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Add extra padding to ensure last content is visible above footer
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: '#1976d2',
    fontSize: 14,
  },
  activeSubscriptionBox: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  activeSubscriptionText: {
    flex: 1,
    marginLeft: 10,
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  planCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  selectedPlanCard: {
    borderColor: Theme.themeColor,
    backgroundColor: '#f8f9ff',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.themeColor,
  },
  planValidity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: Theme.themeColor,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponSection: {
    marginTop: 20,
  },
  couponInputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  couponInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    fontSize: 16,
  },
  validateButton: {
    backgroundColor: Theme.themeColor,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  validateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  couponValidText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  couponInvalidText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '500',
  },
  featuresSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  subscribeButton: {
    backgroundColor: Theme.themeColor,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceBreakdownSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  discountValue: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  finalPriceRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 8,
  },
  finalPriceLabel: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  finalPriceValue: {
    fontSize: 18,
    color: Theme.themeColor,
    fontWeight: 'bold',
  },
});

export default RealEstateSubscriptionModal;
