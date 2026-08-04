import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PremiumPlanCard from '../../components/Jewellery/PremiumPlanCard';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { requireAuth, navigateJewelleryAuthTab } from '../../utils/requireAuth';
import { subscribeToPlan } from '../../services/jewellery.services';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

const PremiumAccessScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { token, isGuest } = useSelector((state) => state.user);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [activeBottomTab, setActiveBottomTab] = useState('profile');
  const [subscribing, setSubscribing] = useState(false);

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('HomeScreen');
  };

  // Update active tab when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setActiveBottomTab('profile');
    }, [])
  );

  const plans = useMemo(
    () => [
      {
        key: 'monthly',
        title: t('jw_plan_monthly'),
        price: '400',
        period: t('jw_per_month'),
        features: [
          t('jw_feat_verified_shops'),
          t('jw_feat_contact_details'),
          t('jw_feat_ratings'),
          t('jw_feat_basic_support'),
        ],
        isExpanded: true,
      },
      {
        key: 'quarterly',
        title: t('jw_plan_quarterly'),
        price: '1200',
        period: t('jw_per_quarter'),
        features: [
          t('jw_feat_verified_shops'),
          t('jw_feat_contact_details'),
          t('jw_feat_ratings'),
          t('jw_feat_priority_support'),
          t('jw_feat_exclusive_deals'),
        ],
        isExpanded: false,
      },
      {
        key: 'yearly',
        title: t('jw_plan_yearly'),
        price: '2400',
        period: t('jw_per_year'),
        features: [
          t('jw_feat_verified_shops'),
          t('jw_feat_contact_details'),
          t('jw_feat_ratings'),
          t('jw_feat_priority_support'),
          t('jw_feat_exclusive_deals'),
          t('jw_feat_early_access'),
          t('jw_feat_premium_service'),
        ],
        isExpanded: false,
      },
    ],
    [t]
  );

  const whySubscriptionItems = useMemo(
    () => [
      {
        title: t('jw_why_access_shops'),
        subtitle: t('jw_why_share_qr'),
      },
      {
        title: t('jw_why_deals'),
        subtitle: t('jw_why_deals_body'),
      },
      {
        title: t('jw_feat_priority_support'),
        subtitle: t('jw_why_support_body'),
      },
    ],
    [t]
  );

  const handlePlanToggle = (planKey) => {
    setSelectedPlan(planKey);
  };

  const confirmAndSubscribe = async () => {
    try {
      setSubscribing(true);
      await subscribeToPlan(selectedPlan);
      Alert.alert(
        t('jw_subscribed'),
        t('jw_subscription_success'),
        [{ text: t('ok'), onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert(
        t('jw_subscription_failed'),
        err?.response?.data?.msg || err?.message || t('jw_subscription_failed_msg')
      );
    } finally {
      setSubscribing(false);
    }
  };

  const handleSubscribe = () => {
    const plan = plans.find((p) => p.key === selectedPlan);
    requireAuth({
      token,
      isGuest,
      dispatch,
      navigation,
      message: t('jw_sign_in_subscribe'),
      onAuthed: () => {
        Alert.alert(
          t('jw_confirm_subscription'),
          t('jw_confirm_subscription_msg', {
            plan: plan?.title || selectedPlan,
            price: plan?.price || '',
          }),
          [
            { text: t('jw_no'), style: 'cancel' },
            { text: t('jw_yes'), onPress: confirmAndSubscribe },
          ]
        );
      },
    });
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
      case 'message':
      case 'notifications':
        navigateJewelleryAuthTab(tab, { token, isGuest, dispatch, navigation });
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title={t('jw_premium_access')} onBackPress={handleBackPress} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Icon */}
        <View style={styles.headerIconContainer}>
          <View style={styles.rupeeIconBox}>
            <Text style={styles.rupeeIconText}>₹</Text>
          </View>
        </View>

        {/* Title and Subtitle */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>{t('jw_unlock_premium')}</Text>
          <Text style={styles.subtitle}>{t('jw_unlock_premium_body')}</Text>
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
        <TouchableOpacity
          style={[styles.subscribeButton, subscribing && { opacity: 0.7 }]}
          onPress={handleSubscribe}
          disabled={subscribing}
        >
          {subscribing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.subscribeButtonText}>
              {t('jw_subscribe_to_plan', {
                plan: plans.find((p) => p.key === selectedPlan)?.title,
              })}
            </Text>
          )}
        </TouchableOpacity>

        {/* Trust Text */}
        <Text style={styles.trustText}>{t('jw_cancel_anytime')}</Text>

        {/* Why Subscription Section */}
        <View style={styles.whySection}>
          <Text style={styles.whyTitle}>{t('jw_why_subscription')}</Text>
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
  rupeeIconBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: jewelleryColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rupeeIconText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
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
