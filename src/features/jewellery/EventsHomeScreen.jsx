import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { navigateJewelleryAuthTab } from '../../utils/requireAuth';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import VerifiedBadge from '../../components/Jewellery/VerifiedBadge';
import { getJewelleryEvents, getMyJewelleryEvents } from '../../services/jewellery.services';
import {
  normalizeEvent,
  formatEventDate,
  formatEventTime,
} from '../../models/events';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

const EventsHomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { token, isGuest } = useSelector((state) => state.user);
  const mineOnly = Boolean(route.params?.mineOnly);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [imageErrors, setImageErrors] = useState({});
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = mineOnly
        ? await getMyJewelleryEvents()
        : await getJewelleryEvents();
      setEvents((data || []).map(normalizeEvent));
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert(t('error'), t('jw_load_events_error'));
    } finally {
      setLoading(false);
    }
  }, [mineOnly, t]);

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('HomeScreen');
  };

  useFocusEffect(
    useCallback(() => {
      setActiveTab('home');
      fetchEvents();
    }, [fetchEvents])
  );

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return events;

    return events.filter((event) => {
      const searchableText = [
        event.name,
        event.description,
        event.category,
        event.venue,
        event.address,
        event.organizer,
        event.entryFee,
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [searchQuery, events]);

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
      case 'message':
      case 'notifications':
        navigateJewelleryAuthTab(tab, { token, isGuest, dispatch, navigation });
        break;
      default:
        break;
    }
  };

  const renderEventCard = ({ item: event }) => {
    const imageUri = event.bannerImage;
    const hasImageError = imageErrors[event.id];

    return (
      <TouchableOpacity
        style={styles.eventCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('EventDetailScreen', { eventId: event.id })}
      >
        <View style={styles.imageContainer}>
          {!hasImageError && imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.bannerImage}
              resizeMode="cover"
              onError={() => setImageErrors((prev) => ({ ...prev, [event.id]: true }))}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="event" size={40} color={jewelleryColors.textSecondary} />
            </View>
          )}
          {event.isFeatured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>{t('jw_featured')}</Text>
            </View>
          )}
          {event.isVerified && (
            <View style={styles.verifiedBadge}>
              <VerifiedBadge size="small" />
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.eventName} numberOfLines={2}>
              {event.name}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{event.category}</Text>
            </View>
          </View>

          <Text style={styles.eventDescription} numberOfLines={2}>
            {event.description}
          </Text>

          <View style={styles.metaRowSplit}>
            <View style={styles.metaItem}>
              <Icon name="calendar-today" size={16} color={jewelleryColors.primary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {formatEventDate(event.startDate)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="access-time" size={16} color={jewelleryColors.primary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {formatEventTime(event.startTime, event.endTime)}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Icon name="location-on" size={16} color={jewelleryColors.primary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {event.venue}
            </Text>
          </View>

         
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar
        showBack
        title={mineOnly ? t('jw_my_events') : t('jw_events')}
        onBackPress={handleBackPress}
      />

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={24} color={jewelleryColors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('jw_search_events')}
            placeholderTextColor={jewelleryColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {mineOnly && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddEventScreen')}
          >
            <Icon name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>{t('jw_add_event')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={jewelleryColors.primary} />
        </View>
      ) : (
      <FlatList
        data={filteredEvents}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.eventsList,
          filteredEvents.length === 0 && styles.emptyEventsContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="event-busy" size={48} color={jewelleryColors.textSecondary} />
            <Text style={styles.emptyStateTitle}>{t('jw_no_events')}</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery.trim()
                ? t('jw_no_results_for', { query: searchQuery.trim() })
                : mineOnly
                  ? t('jw_no_events_mine')
                  : t('jw_no_events_available')}
            </Text>
          </View>
        }
      />
      )}

      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: jewelleryColors.bgSecondary,
    borderRadius: 30,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: jewelleryColors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    gap: spacing.xs,
  },
  addButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsList: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyEventsContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  eventCard: {
    backgroundColor: jewelleryColors.bg,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
    backgroundColor: jewelleryColors.bgSecondary,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: jewelleryColors.bgSecondary,
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: jewelleryColors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  verifiedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  eventName: {
    ...typography.heading3,
    flex: 1,
    fontWeight: '700',
    color: jewelleryColors.text,
  },
  categoryBadge: {
    backgroundColor: jewelleryColors.bgSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: jewelleryColors.primary,
  },
  eventDescription: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  metaRowSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.bodySmall,
    color: jewelleryColors.text,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: jewelleryColors.border,
  },
  entryFee: {
    ...typography.body,
    fontWeight: '700',
    color: jewelleryColors.primary,
  },
  registrationCount: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  emptyStateTitle: {
    ...typography.heading3,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptyStateText: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default EventsHomeScreen;
