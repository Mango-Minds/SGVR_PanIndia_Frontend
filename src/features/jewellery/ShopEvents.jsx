import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';
import { BASEIMGURL } from '../../infrastructure/constants';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import { getShopEvents, getShopEventDatesByMonth, deleteShopEvent, getShopDetails } from '../../services/jewellery.services';

const ShopEvents = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { shopId } = route.params || {};
  const user = useSelector((state) => state.user.user);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [isShopOwner, setIsShopOwner] = useState(false);

  // Check if current user is shop owner
  useEffect(() => {
    const checkShopOwnership = async () => {
      if (!shopId || !user) {
        setIsShopOwner(false);
        return;
      }

      try {
        // Get shop details to check ownership
        const shop = await getShopDetails(shopId);
        
        if (shop && shop.owner) {
          const ownerId = shop.owner._id || shop.owner.id || shop.owner;
          setIsShopOwner(ownerId === user._id || ownerId?.toString() === user._id?.toString());
        }
      } catch (error) {
        console.error('Error checking shop ownership:', error);
        setIsShopOwner(false);
      }
    };

    checkShopOwnership();
  }, [shopId, user]);

  // Fetch event dates for calendar marking
  const fetchEventDates = useCallback(async (month, year) => {
    if (!shopId) return;

    try {
      const response = await getShopEventDatesByMonth(shopId, month, year);
      const dates = response.dates || [];

      const marked = {};
      dates.forEach((date) => {
        marked[date] = {
          marked: true,
          dotColor: jewelleryColors.primary,
          selectedColor: jewelleryColors.primary,
        };
      });

      // Mark selected date
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: jewelleryColors.primary,
        selectedTextColor: 'white',
      };

      setMarkedDates(marked);
    } catch (error) {
      console.error('Error fetching event dates:', error);
    }
  }, [shopId, selectedDate]);

  // Fetch events for selected date
  const fetchEvents = useCallback(async () => {
    if (!shopId) return;

    try {
      setLoading(true);
      const response = await getShopEvents(shopId, selectedDate);
      setEvents(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error.response?.status === 404) {
        setEvents([]);
      } else {
        Alert.alert('Error', 'Failed to fetch events');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shopId, selectedDate]);

  // Initial load and when date changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Fetch dates when month changes
  const handleMonthChange = (month) => {
    const monthNum = moment(month.dateString).month() + 1;
    const year = moment(month.dateString).year();
    fetchEventDates(monthNum, year);
  };

  // Initial calendar dates load
  useEffect(() => {
    const month = moment(selectedDate).month() + 1;
    const year = moment(selectedDate).year();
    fetchEventDates(month, year);
  }, []);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      fetchEvents();
      const month = moment(selectedDate).month() + 1;
      const year = moment(selectedDate).year();
      fetchEventDates(month, year);
    }, [selectedDate])
  );

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleAddEvent = () => {
    navigation.navigate('ShopEventCreate', { shopId, date: selectedDate });
  };

  const handleDeleteEvent = async (eventId) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteShopEvent(eventId);
              fetchEvents();
              const month = moment(selectedDate).month() + 1;
              const year = moment(selectedDate).year();
              fetchEventDates(month, year);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
    const month = moment(selectedDate).month() + 1;
    const year = moment(selectedDate).year();
    fetchEventDates(month, year);
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title="Shop Events" onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Add Event Button for Shop Owners */}
        {isShopOwner && (
          <View style={styles.addButtonContainer}>
            <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
              <Icon name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            minDate={moment().format('YYYY-MM-DD')}
            markingType="multi-dot"
            markedDates={markedDates}
            onMonthChange={handleMonthChange}
            onDayPress={handleDateSelect}
            theme={{
              arrowColor: jewelleryColors.primary,
              calendarBackground: jewelleryColors.bg,
              todayTextColor: jewelleryColors.primary,
              todayBackgroundColor: 'transparent',
              selectedDayBackgroundColor: jewelleryColors.primary,
              selectedDayTextColor: 'white',
              dayTextColor: jewelleryColors.text,
              textDisabledColor: jewelleryColors.textSecondary,
              monthTextColor: jewelleryColors.text,
              textDayFontWeight: '600',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
            }}
          />
        </View>

        {/* Events List */}
        <View style={styles.eventsContainer}>
          <Text style={styles.eventsTitle}>
            Events for {moment(selectedDate).format('DD MMM YYYY')}
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={jewelleryColors.primary} />
            </View>
          ) : events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="event-busy" size={48} color={jewelleryColors.textSecondary} />
              <Text style={styles.emptyText}>No events for this date</Text>
            </View>
          ) : (
            events.map((event) => (
              <View key={event._id} style={styles.eventCard}>
                {event.bannerImage && (
                  <Image
                    source={{
                      uri: event.bannerImage.startsWith('http')
                        ? event.bannerImage
                        : `${BASEIMGURL}${event.bannerImage}`,
                    }}
                    style={styles.bannerImage}
                  />
                )}
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventName}>{event.eventName}</Text>
                    {isShopOwner && (
                      <TouchableOpacity
                        onPress={() => handleDeleteEvent(event._id)}
                        style={styles.deleteButton}
                      >
                        <Icon name="delete" size={20} color={jewelleryColors.error} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={styles.eventDescription}>{event.eventDescription}</Text>

                  {event.eventTime && event.eventTime.length > 0 && (
                    <View style={styles.timeContainer}>
                      <Icon name="access-time" size={16} color={jewelleryColors.textSecondary} />
                      <Text style={styles.timeText}>
                        {event.eventTime.join(', ')}
                      </Text>
                    </View>
                  )}

                  {event.address && (
                    <View style={styles.infoRow}>
                      <Icon name="location-on" size={16} color={jewelleryColors.textSecondary} />
                      <Text style={styles.infoText}>{event.address}</Text>
                    </View>
                  )}

                  {event.contactPhone && (
                    <View style={styles.infoRow}>
                      <Icon name="phone" size={16} color={jewelleryColors.textSecondary} />
                      <Text style={styles.infoText}>{event.contactPhone}</Text>
                    </View>
                  )}

                  {event.contactEmail && (
                    <View style={styles.infoRow}>
                      <Icon name="email" size={16} color={jewelleryColors.textSecondary} />
                      <Text style={styles.infoText}>{event.contactEmail}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  addButtonContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: jewelleryColors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  addButtonText: {
    ...typography.body,
    color: 'white',
    fontWeight: '600',
  },
  calendarContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: jewelleryColors.bg,
  },
  eventsContainer: {
    padding: spacing.lg,
  },
  eventsTitle: {
    ...typography.heading3,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: jewelleryColors.textSecondary,
    marginTop: spacing.md,
  },
  eventCard: {
    backgroundColor: jewelleryColors.bg,
    borderRadius: 12,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: jewelleryColors.border,
  },
  bannerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: spacing.lg,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  eventName: {
    ...typography.heading3,
    flex: 1,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  eventDescription: {
    ...typography.body,
    color: jewelleryColors.textSecondary,
    marginBottom: spacing.md,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  timeText: {
    ...typography.bodySmall,
    color: jewelleryColors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: jewelleryColors.text,
    flex: 1,
  },
});

export default ShopEvents;

