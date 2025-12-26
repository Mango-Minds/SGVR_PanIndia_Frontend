import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import LiveRatesCard from '../../components/Jewellery/LiveRatesCard';
import goldSilverRatesService from '../../services/goldSilverRates.service';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

const LiveRatesScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('home');
  const [ratesData, setRatesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // Initial fetch
    loadRates();

    // Start polling
    goldSilverRatesService.startPolling((data, err) => {
      if (err) {
        setError(err.message);
        setLoading(false);
      } else if (data) {
        setRatesData(data);
        setError(null);
        setLoading(false);
        setLastUpdated(new Date(data.lastUpdated));
      }
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => {
      goldSilverRatesService.stopPolling();
    };
  }, []);

  const loadRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await goldSilverRatesService.fetchLiveRates();
      setRatesData(data);
      setLastUpdated(new Date(data.lastUpdated));
    } catch (err) {
      setError(err.message || 'Failed to load rates');
      // Try to use cached data
      const cachedData = goldSilverRatesService.getCachedData();
      if (cachedData) {
        setRatesData(cachedData);
        setError('Using cached data. Please check your connection.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRates();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
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
      default:
        break;
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar
        showBack
        title="Live Rates"
        showNotification
        showShare
        onBackPress={() => navigation.goBack()}
      />

      {loading && !ratesData ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={jewelleryColors.primary} />
          <Text style={styles.loadingText}>Loading live rates...</Text>
        </View>
      ) : error && !ratesData ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText} onPress={loadRates}>
            Tap to retry
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={jewelleryColors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Spot Rates Section */}
          {ratesData?.spot && (
            <View style={styles.spotSection}>
              <Text style={styles.sectionTitle}>SPOT RATES</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.spotCardsContainer}
              >
                <View style={[styles.spotCard, styles.goldSpotCard]}>
                  <Text style={styles.spotTitle}>GOLD</Text>
                  <Text style={styles.spotPrice}>
                    ₹{ratesData.spot.gold.current.toLocaleString('en-IN')}
                  </Text>
                  <View style={styles.spotRangeContainer}>
                    <View style={styles.rangeItem}>
                      <Text style={styles.rangeLabel}>L</Text>
                      <Text style={styles.rangeValue} numberOfLines={1} adjustsFontSizeToFit>
                        ₹{ratesData.spot.gold.low.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <Text style={styles.rangeSeparator}>|</Text>
                    <View style={styles.rangeItem}>
                      <Text style={styles.rangeLabel}>H</Text>
                      <Text style={styles.rangeValue} numberOfLines={1} adjustsFontSizeToFit>
                        ₹{ratesData.spot.gold.high.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.spotCard, styles.silverSpotCard]}>
                  <Text style={styles.spotTitle}>SILVER</Text>
                  <Text style={styles.spotPrice}>
                    ₹{ratesData.spot.silver.current.toFixed(2)}
                  </Text>
                  <View style={styles.spotRangeContainer}>
                    <View style={styles.rangeItem}>
                      <Text style={styles.rangeLabel}>L</Text>
                      <Text style={styles.rangeValue} numberOfLines={1} adjustsFontSizeToFit>
                        ₹{ratesData.spot.silver.low.toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.rangeSeparator}>|</Text>
                    <View style={styles.rangeItem}>
                      <Text style={styles.rangeLabel}>H</Text>
                      <Text style={styles.rangeValue} numberOfLines={1} adjustsFontSizeToFit>
                        ₹{ratesData.spot.silver.high.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.spotCard, styles.inrSpotCard]}>
                  <Text style={styles.spotTitle}>INR</Text>
                  <Text style={styles.spotPrice}>
                    {ratesData.spot.inr.current.toFixed(3)}
                  </Text>
                  <View style={styles.spotRangeContainer}>
                    <View style={styles.rangeItem}>
                      <Text style={styles.rangeLabel}>L</Text>
                      <Text style={styles.rangeValue} numberOfLines={1} adjustsFontSizeToFit>
                        {ratesData.spot.inr.low.toFixed(3)}
                      </Text>
                    </View>
                    <Text style={styles.rangeSeparator}>|</Text>
                    <View style={styles.rangeItem}>
                      <Text style={styles.rangeLabel}>H</Text>
                      <Text style={styles.rangeValue} numberOfLines={1} adjustsFontSizeToFit>
                        {ratesData.spot.inr.high.toFixed(3)}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          )}

          {/* Last Updated Indicator */}
          {lastUpdated && (
            <View style={styles.lastUpdatedContainer}>
              <Text style={styles.lastUpdatedText}>
                Last updated: {formatTime(lastUpdated)}
              </Text>
              {error && (
                <Text style={styles.warningText}>{error}</Text>
              )}
            </View>
          )}

          {/* Detailed Rates Section */}
          {ratesData?.rates && (
            <View style={styles.ratesSection}>
              <Text style={styles.sectionTitle}>DETAILED RATES</Text>
              <LiveRatesCard
                label={ratesData.rates.gold999WithoutGST.label}
                buy={ratesData.rates.gold999WithoutGST.buy}
                sell={ratesData.rates.gold999WithoutGST.sell}
                low={ratesData.rates.gold999WithoutGST.low}
                high={ratesData.rates.gold999WithoutGST.high}
              />

              <LiveRatesCard
                label={ratesData.rates.gold999WithGST.label}
                buy={ratesData.rates.gold999WithGST.buy}
                sell={ratesData.rates.gold999WithGST.sell}
                low={ratesData.rates.gold999WithGST.low}
                high={ratesData.rates.gold999WithGST.high}
              />

              <LiveRatesCard
                label={ratesData.rates.goldCosting.label}
                buy={ratesData.rates.goldCosting.buy}
                sell={ratesData.rates.goldCosting.sell}
                low={ratesData.rates.goldCosting.low}
                high={ratesData.rates.goldCosting.high}
              />

              <LiveRatesCard
                label={ratesData.rates.silverCosting.label}
                buy={ratesData.rates.silverCosting.buy}
                sell={ratesData.rates.silverCosting.sell}
                low={ratesData.rates.silverCosting.low}
                high={ratesData.rates.silverCosting.high}
              />
            </View>
          )}

          {/* Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              * Rates are indicative and may vary. Please contact your jeweler for actual rates.
            </Text>
          </View>
        </ScrollView>
      )}

      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: jewelleryColors.textSecondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: jewelleryColors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryText: {
    ...typography.body,
    color: jewelleryColors.primary,
    textDecorationLine: 'underline',
  },
  spotSection: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading3,
    fontWeight: '700',
    color: jewelleryColors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
    letterSpacing: 1,
  },
  spotCardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  spotCard: {
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    minWidth: 150,
    maxWidth: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  goldSpotCard: {
    backgroundColor: '#D4AF37', // Same gold color as home page
  },
  silverSpotCard: {
    backgroundColor: '#8C8C8C', // Same silver color as home page
  },
  inrSpotCard: {
    backgroundColor: jewelleryColors.bgDark,
  },
  spotTitle: {
    ...typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  spotPrice: {
    ...typography.heading2,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: spacing.sm,
    fontSize: 20,
  },
  spotRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
  },
  rangeItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  rangeLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 10,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  rangeValue: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
    minWidth: 0,
    flexShrink: 1,
  },
  rangeSeparator: {
    ...typography.body,
    color: '#FFFFFF',
    opacity: 0.5,
    marginHorizontal: spacing.sm,
  },
  lastUpdatedContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  lastUpdatedText: {
    ...typography.caption,
    color: jewelleryColors.textSecondary,
  },
  warningText: {
    ...typography.caption,
    color: jewelleryColors.error,
    marginTop: spacing.xs,
  },
  ratesSection: {
    padding: spacing.lg,
  },
  disclaimerContainer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  disclaimerText: {
    ...typography.caption,
    color: jewelleryColors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default LiveRatesScreen;

