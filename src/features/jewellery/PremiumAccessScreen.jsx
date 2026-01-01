import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import PremiumPlanCard from '../../components/Jewellery/PremiumPlanCard';
import CategoryIcon from '../../components/Jewellery/CategoryIcon';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

const PremiumAccessScreen = () => {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [activeBottomTab, setActiveBottomTab] = useState('profile');

  const handleBackPress = () => {
    navigation.navigate('ShopsScreen');
  };

  // Update active tab when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setActiveBottomTab('profile');
    }, [])
  );

  const plans = [
    {
      key: 'monthly',
      title: 'Monthly',
      price: '99',
      period: 'month',
      features: [
        'Access to 100+ Verified Shops',
        'Shop Contact Details',
        'Shop Ratings & Reviews',
        'Basic Support',
      ],
      isExpanded: true,
    },
    {
      key: 'quarterly',
      title: 'Quarterly',
      price: '299',
      period: 'quarter',
      features: [
        'Access to 100+ Verified Shops',
        'Shop Contact Details',
        'Shop Ratings & Reviews',
        'Priority Support',
        'Exclusive Deals',
      ],
      isExpanded: false,
    },
    {
      key: 'yearly',
      title: 'Yearly',
      price: '1999',
      period: 'year',
      features: [
        'Access to 100+ Verified Shops',
        'Shop Contact Details',
        'Shop Ratings & Reviews',
        'Priority Support',
        'Exclusive Deals',
        'Early Access to New Shops',
        'Premium Customer Service',
      ],
      isExpanded: false,
    },
  ];

  const whySubscriptionItems = [
    {
      title: 'Access 100 + Verified Shops',
      subtitle: 'Share this QR Code to View Shop Details',
    },
    {
      title: 'Exclusive Deals & Offers',
      subtitle: 'Get special discounts from partner shops',
    },
    {
      title: 'Priority Support',
      subtitle: 'Get help whenever you need it.',
    },
  ];

  const handlePlanToggle = (planKey) => {
    setSelectedPlan(planKey);
  };

  const handleSubscribe = () => {
    // Navigate to payment/subscription flow
    console.log('Subscribe to', selectedPlan, 'plan');
    // navigation.navigate('PaymentScreen', { plan: selectedPlan });
  };

  const handleTabBarChange = (tab) => {
    setActiveBottomTab(tab);
    switch (tab) {
      case 'home':
        navigation.navigate('HomeScreen');
        break;
      case 'search':
        navigation.navigate('BrowseScreen');
        break;
      case 'profile':
        navigation.navigate('ProfileScreen');
        break;
      case 'message':
        navigation.navigate('ChatScreen');
        break;
      case 'notifications':
        navigation.navigate('JewelleryNotifications');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title="Premium Access" onBackPress={handleBackPress} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Icon */}
        <View style={styles.headerIconContainer}>
          <CategoryIcon
            name="Shops"
            icon="attach-money"
            color={jewelleryColors.primary}
            size={80}
            onPress={() => {}}
          />
        </View>

        {/* Title and Subtitle */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Unlock Premium Access</Text>
          <Text style={styles.subtitle}>
            Get unlimited access to verified jewellery shops across your city with detailed
            information and exclusive benefits
          </Text>
        </View>

        {/* Plan Cards */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <PremiumPlanCard
              key={plan.key}
              title={plan.title}
              price={plan.price}
              period={plan.period}
              features={plan.features}
              isExpanded={plan.key === selectedPlan}
              onToggle={() => handlePlanToggle(plan.key)}
            />
          ))}
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
          <Text style={styles.subscribeButtonText}>
            Subscribe to {plans.find((p) => p.key === selectedPlan)?.title} Plan
          </Text>
        </TouchableOpacity>

        {/* Trust Text */}
        <Text style={styles.trustText}>Cancel anytime. Secure payment. Money Back</Text>

        {/* Why Subscription Section */}
        <View style={styles.whySection}>
          <Text style={styles.whyTitle}>Why Subscription?</Text>
          {whySubscriptionItems.map((item, index) => (
            <View key={index} style={styles.whyItem}>
              <Icon name="check-circle" size={24} color={jewelleryColors.primary} />
              <View style={styles.whyItemText}>
                <Text style={styles.whyItemTitle}>{item.title}</Text>
                <Text style={styles.whyItemSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomTabBar activeTab={activeBottomTab} onTabChange={handleTabBarChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerIconContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  headerTextContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: jewelleryColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  plansContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  subscribeButton: {
    backgroundColor: jewelleryColors.primary,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  subscribeButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trustText: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  whySection: {
    backgroundColor: jewelleryColors.bgSecondary,
    borderRadius: 12,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  whyTitle: {
    ...typography.heading3,
    marginBottom: spacing.md,
  },
  whyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  whyItemText: {
    flex: 1,
  },
  whyItemTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  whyItemSubtitle: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
  },
});

export default PremiumAccessScreen;

