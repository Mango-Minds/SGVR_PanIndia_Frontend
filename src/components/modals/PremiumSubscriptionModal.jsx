import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import Theme from '../../styles/theme';
import apiClient from '../../store/apiClient';

const { width, height } = Dimensions.get('window');

const PremiumSubscriptionModal = ({ visible, onClose, onSubscribe, subscriptionPlans = [], loading = false }) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (subscriptionPlans.length > 0 && !selectedPlan) {
      setSelectedPlan(subscriptionPlans[0]);
    }
  }, [subscriptionPlans]);

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    if (subscriptionPlans.length === 0) {
      Alert.alert('Error', 'No subscription plans available');
      return;
    }

    try {
      setIsValidatingCoupon(true);
      const response = await apiClient.post('/matrimony-subscription/validate-coupon', {
        couponCode: couponCode.trim(),
        planName: selectedPlan.planName,
      });

      if (response.data.status === 0) {
        setAppliedCoupon(response.data.data);
        setShowSuccessModal(true);
      } else {
        Alert.alert('Invalid Coupon', response.data.msg);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      Alert.alert('Error', 'Failed to validate coupon. Please try again.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    try {
      setIsSubscribing(true);
      const response = await apiClient.post('/matrimony-subscription/subscribe', {
        subscriptionId: selectedPlan._id,
        couponCode: appliedCoupon ? appliedCoupon.coupon.code : null,
      });

      if (response.data.status === 0) {
        Alert.alert(
          'Success!',
          'Your subscription has been activated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                onSubscribe(response.data.data);
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.data.msg);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      Alert.alert('Error', 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const getFinalPrice = () => {
    if (!selectedPlan) return 0;
    if (appliedCoupon) {
      return appliedCoupon.finalPrice;
    }
    return selectedPlan.price;
  };

  const getDiscountText = () => {
    if (!appliedCoupon) return '';
    const discount = appliedCoupon.originalPrice - appliedCoupon.finalPrice;
    if (discount === appliedCoupon.originalPrice) {
      return '100% off - Free subscription!';
    }
    return `₹${discount} off`;
  };

  const resetModal = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setShowSuccessModal(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Upgrade to Premium</Text>
            <IconButton
              icon="close"
              size={24}
              iconColor={Theme.themeColor}
              onPress={handleClose}
            />
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Get access to unlimited groom profiles and advanced features
          </Text>

          {/* Subscription Plan Selection */}
          <View style={styles.planSection}>
            <Text style={styles.planLabel}>Select Plan:</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Theme.themeColor} />
                <Text style={styles.loadingText}>Loading plans...</Text>
              </View>
            ) : subscriptionPlans.length > 0 ? (
              subscriptionPlans.map((plan) => (
                <TouchableOpacity
                  key={plan._id}
                  style={[
                    styles.planOption,
                    selectedPlan?._id === plan._id && styles.selectedPlan
                  ]}
                  onPress={() => setSelectedPlan(plan)}
                >
                  <View style={styles.planInfo}>
                    <Text style={[
                      styles.planName,
                      selectedPlan?._id === plan._id && styles.selectedPlanText
                    ]}>
                      {plan.planName}
                    </Text>
                    <Text style={styles.planDescription}>
                      {plan.description}
                    </Text>
                    <Text style={styles.planValidity}>
                      Valid for {plan.validity} days
                    </Text>
                  </View>
                  <View style={styles.planPrice}>
                    <Text style={[
                      styles.planPriceText,
                      selectedPlan?._id === plan._id && styles.selectedPlanText
                    ]}>
                      ₹{plan.price}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noPlansContainer}>
                <Text style={styles.noPlansText}>No subscription plans available</Text>
              </View>
            )}
          </View>

          {/* Coupon Code Section */}
          <View style={styles.couponSection}>
            <Text style={styles.couponLabel}>Enter Promo Code:</Text>
            <View style={styles.couponInputContainer}>
              <TextInput
                style={styles.couponInput}
                placeholder="e.g., MATRIMONY"
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.applyButton}
                onPress={validateCoupon}
                disabled={isValidatingCoupon}
              >
                {isValidatingCoupon ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.applyButtonText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Subscription Button */}
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscribe}
            disabled={isSubscribing}
          >
            <View style={styles.subscribeButtonContent}>
              <Icon name="star" size={20} color="white" />
              <View style={styles.subscribeButtonText}>
                <Text style={styles.subscribeButtonMainText}>SUBSCRIBE NOW -</Text>
                <Text style={styles.subscribeButtonPriceText}>₹{getFinalPrice()}</Text>
              </View>
              <Icon name="arrow-forward" size={20} color="white" />
            </View>
          </TouchableOpacity>

          {/* View Details Link */}
          <TouchableOpacity style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>

          {/* Success Modal for Coupon */}
          <Modal
            visible={showSuccessModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowSuccessModal(false)}
          >
            <View style={styles.successOverlay}>
              <View style={styles.successModal}>
                <Text style={styles.successTitle}>Success</Text>
                <Text style={styles.successDiscountText}>{getDiscountText()}</Text>
                <Text style={styles.successPriceText}>
                  Valid promo code! Price: ₹{getFinalPrice()}
                </Text>
                <View style={styles.successIconContainer}>
                  <Icon name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
                <TouchableOpacity
                  style={styles.okButton}
                  onPress={() => setShowSuccessModal(false)}
                >
                  <Text style={styles.okButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: width * 0.9,
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.themeColor,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  planSection: {
    marginBottom: 24,
  },
  planLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  planOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  selectedPlan: {
    borderColor: Theme.themeColor,
    backgroundColor: '#fff3e0',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  planValidity: {
    fontSize: 12,
    color: '#888',
  },
  planPrice: {
    alignItems: 'flex-end',
  },
  planPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.themeColor,
  },
  selectedPlanText: {
    color: Theme.themeColor,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  noPlansContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noPlansText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  couponSection: {
    marginBottom: 24,
  },
  couponLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  subscribeButton: {
    backgroundColor: Theme.themeColor,
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 16,
  },
  subscribeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    marginHorizontal: 12,
    alignItems: 'center',
  },
  subscribeButtonMainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subscribeButtonPriceText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewDetailsButton: {
    alignItems: 'center',
  },
  viewDetailsText: {
    color: Theme.themeColor,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: width * 0.8,
    maxWidth: 300,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  successDiscountText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successPriceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  okButton: {
    alignSelf: 'flex-end',
  },
  okButtonText: {
    color: Theme.themeColor,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PremiumSubscriptionModal;
