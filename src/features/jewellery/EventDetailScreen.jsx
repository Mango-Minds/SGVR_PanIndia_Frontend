import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import VerifiedBadge from '../../components/Jewellery/VerifiedBadge';
import SpecificationRow from '../../components/Jewellery/SpecificationRow';
import QRModal from '../../components/Jewellery/QRModal';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import { navigateJewelleryAuthTab, requireAuth } from '../../utils/requireAuth';
import {
  getJewelleryEventById,
  deleteJewelleryEvent,
  expressInterestInJewelleryEvent,
} from '../../services/jewellery.services';
import {
  normalizeEvent,
  createEventData,
  formatEventDate,
  formatEventTime,
  getEventImages,
} from '../../models/events';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';
import { ErrorToggle } from '../../store/user';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const EventDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { token, isGuest, user } = useSelector((state) => state.user);
  const { eventId } = route.params || {};
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('home');
  const [eventData, setEventData] = useState(createEventData(eventId));
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [markingInterest, setMarkingInterest] = useState(false);
  const scrollViewRef = useRef(null);

  const isEventOwner =
    user?._id &&
    eventData.createdBy &&
    String(user._id) === String(eventData.createdBy);

  const isInterested =
    Boolean(user?._id) &&
    Array.isArray(eventData.interestedUsers) &&
    eventData.interestedUsers.some((id) => String(id) === String(user._id));

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getJewelleryEventById(eventId);
        setEventData(normalizeEvent(data));
      } catch (error) {
        console.error('Error loading event:', error);
        Alert.alert('Error', 'Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  useFocusEffect(
    React.useCallback(() => {
      setActiveBottomTab('home');

      const refreshEvent = async () => {
        if (!eventId) return;
        try {
          const data = await getJewelleryEventById(eventId);
          setEventData(normalizeEvent(data));
        } catch (error) {
          console.error('Error refreshing event:', error);
        }
      };

      refreshEvent();
    }, [eventId])
  );

  const eventImages = getEventImages(eventData);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  const handleBackPress = () => {
    navigation.goBack();
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

  const handleCall = () => {
    const raw = eventData?.organizerPhone;
    const digits = raw != null ? String(raw).replace(/\D/g, '') : '';
    if (digits.length >= 10) {
      Linking.openURL(`tel:${digits}`);
    } else {
      Alert.alert('Call', 'Phone number is not available.');
    }
  };

  const handleEmail = () => {
    const email = eventData?.organizerEmail;
    if (email) {
      Linking.openURL(`mailto:${email}`);
    } else {
      Alert.alert('Email', 'Email address is not available.');
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditEventScreen', { eventId: eventData.id });
  };

  const handleInterest = () => {
    requireAuth({
      token,
      isGuest,
      dispatch,
      navigation,
      message: 'Sign in to mark interest in this event.',
      onAuthed: async () => {
        if (isInterested || markingInterest || !eventData.id) return;

        try {
          setMarkingInterest(true);
          const data = await expressInterestInJewelleryEvent(eventData.id);
          setEventData(normalizeEvent(data));
          dispatch(
            ErrorToggle({
              type: 'Success',
              msg: 'Interest recorded. Organizer has been notified.',
              toggle: true,
            })
          );
        } catch (error) {
          const message =
            error.response?.data?.msg ||
            error.response?.data?.message ||
            error.message ||
            'Failed to mark interest.';
          dispatch(
            ErrorToggle({
              type: 'error',
              msg: message,
              toggle: true,
            })
          );
        } finally {
          setMarkingInterest(false);
        }
      },
    });
  };

  const handleDelete = () => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            await deleteJewelleryEvent(eventData.id);
            Alert.alert('Deleted', 'Event deleted successfully.', [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]);
          } catch (error) {
            const message =
              error.response?.data?.msg ||
              error.response?.data?.message ||
              error.message ||
              'Failed to delete event';
            Alert.alert('Error', message);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={22} color={jewelleryColors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleContainer} pointerEvents="none">
          <Text style={styles.headerTitle} numberOfLines={1}>
            Event Details
          </Text>
        </View>

        <View style={styles.headerRight}>
          {isEventOwner ? (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerActionBtn}
                onPress={handleEdit}
                disabled={loading}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="edit" size={22} color={jewelleryColors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerActionBtn}
                onPress={handleDelete}
                disabled={deleting || loading}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color={jewelleryColors.error} />
                ) : (
                  <Icon name="delete-outline" size={22} color={jewelleryColors.error} />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.headerRightSpacer} />
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={jewelleryColors.primary} />
        </View>
      ) : (
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            {eventImages[selectedImageIndex] && !imageErrors[selectedImageIndex] ? (
              <Image
                source={{ uri: eventImages[selectedImageIndex] }}
                style={styles.eventImage}
                resizeMode="cover"
                onError={() =>
                  setImageErrors((prev) => ({ ...prev, [selectedImageIndex]: true }))
                }
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="event" size={60} color={jewelleryColors.textSecondary} />
              </View>
            )}
            {eventData.isVerified && (
              <View style={styles.badgeContainer}>
                <VerifiedBadge />
              </View>
            )}
            {eventData.isFeatured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>Featured</Text>
              </View>
            )}
            {eventImages.length > 1 && (
              <View style={styles.indicators}>
                {eventImages.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === selectedImageIndex && styles.activeIndicator,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {eventImages.length > 1 && (
            <View style={styles.thumbnailsContainer}>
              {eventImages.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnail,
                    index === selectedImageIndex && styles.activeThumbnail,
                  ]}
                  onPress={() => setSelectedImageIndex(index)}
                >
                  {image && !imageErrors[index] ? (
                    <Image
                      source={{ uri: image }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                      onError={() => setImageErrors((prev) => ({ ...prev, [index]: true }))}
                    />
                  ) : (
                    <View style={styles.thumbnailPlaceholder}>
                      <Icon name="image" size={20} color={jewelleryColors.textSecondary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.eventName}>{eventData.name}</Text>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{eventData.category}</Text>
            </View>
            <Text style={styles.entryFee}>
              {!eventData.entryFee ||
              String(eventData.entryFee).toLowerCase() === 'free' ||
              Number(eventData.entryFee) === 0
                ? 'Free'
                : `₹${String(eventData.entryFee).replace(/^₹\s*/, '')}`}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Event</Text>
          <Text style={styles.description}>{eventData.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <View style={styles.specificationsList}>
            <SpecificationRow
              label="Date"
              value={formatEventDate(eventData.startDate, eventData.endDate)}
            />
            <SpecificationRow
              label="Time"
              value={formatEventTime(eventData.startTime, eventData.endTime)}
            />
            <SpecificationRow label="Venue" value={eventData.venue} />
            <SpecificationRow label="Address" value={eventData.address} />
            <SpecificationRow
              label="Entry Fee"
              value={
                !eventData.entryFee ||
                String(eventData.entryFee).toLowerCase() === 'free' ||
                Number(eventData.entryFee) === 0
                  ? 'Free'
                  : `₹${String(eventData.entryFee).replace(/^₹\s*/, '')}`
              }
            />
            <SpecificationRow
              label="Capacity"
              value={`${eventData.capacity} people`}
            />
            <SpecificationRow
              label="Interested"
              value={`${eventData.interestedCount || 0} people`}
            />
          </View>
        </View>

        <View style={styles.interestContainer}>
          <TouchableOpacity
            style={[
              styles.interestButton,
              isInterested && styles.interestButtonActive,
            ]}
            onPress={handleInterest}
            disabled={isInterested || markingInterest}
            activeOpacity={0.8}
          >
            {markingInterest ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon
                  name={isInterested ? 'favorite' : 'favorite-border'}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.interestButtonText}>
                  {isInterested
                    ? 'You are interested'
                    : 'I am interested in this Event'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organizer Details</Text>

          <View style={styles.contactItem}>
            <View style={styles.contactIconContainer}>
              <Icon name="person" size={24} color={jewelleryColors.primary} />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Organizer</Text>
              <Text style={styles.contactValue}>{eventData.organizer}</Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactIconContainer}>
              <Icon name="phone" size={24} color={jewelleryColors.primary} />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>{eventData.organizerPhone}</Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactIconContainer}>
              <Icon name="email" size={24} color={jewelleryColors.primary} />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{eventData.organizerEmail}</Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactIconContainer}>
              <Icon name="location-on" size={24} color={jewelleryColors.primary} />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Venue</Text>
              <Text style={styles.contactValue}>{eventData.venue}</Text>
              <Text style={styles.contactSubValue}>{eventData.address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Icon name="phone" size={20} color="#FFFFFF" />
            <Text style={styles.callButtonText}>Call Organizer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.emailButton} onPress={handleEmail}>
            <Icon name="email" size={20} color={jewelleryColors.text} />
            <Text style={styles.emailButtonText}>Email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => setQrModalVisible(true)}
          >
            <Icon name="share" size={20} color={jewelleryColors.text} />
            <Text style={styles.shareButtonText}>Share QR Code</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
      )}

      <QRModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        qrValue={`event-${eventData.id}`}
        shopName={eventData.name}
      />

      <BottomTabBar activeTab={activeBottomTab} onTabChange={handleTabBarChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: jewelleryColors.bg,
    borderBottomWidth: 1,
    borderBottomColor: jewelleryColors.border,
    position: 'relative',
  },
  headerLeft: {
    flex: 1,
    zIndex: 1,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  headerRightSpacer: {
    width: 40,
    height: 40,
  },
  headerTitleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 110,
  },
  headerTitle: {
    ...typography.heading3,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    color: jewelleryColors.text,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: jewelleryColors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerActionBtn: {
    padding: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSection: {
    marginBottom: spacing.md,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: SCREEN_WIDTH * 0.6,
    backgroundColor: jewelleryColors.bgSecondary,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: jewelleryColors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: jewelleryColors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  indicators: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: jewelleryColors.bg,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: jewelleryColors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: jewelleryColors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  eventName: {
    ...typography.heading2,
    fontWeight: '700',
    fontSize: 24,
    marginBottom: spacing.sm,
    color: jewelleryColors.text,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: jewelleryColors.bgSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: jewelleryColors.primary,
  },
  entryFee: {
    ...typography.body,
    fontWeight: '700',
    color: jewelleryColors.primary,
    fontSize: 16,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.heading3,
    fontWeight: '700',
    marginBottom: spacing.md,
    color: jewelleryColors.text,
  },
  description: {
    ...typography.body,
    color: jewelleryColors.text,
    lineHeight: 22,
  },
  specificationsList: {
    gap: spacing.sm,
  },
  interestContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  interestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: jewelleryColors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  interestButtonActive: {
    backgroundColor: jewelleryColors.primary + 'CC',
  },
  interestButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
    fontSize: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  contactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: jewelleryColors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  contactValue: {
    ...typography.body,
    fontWeight: '600',
    color: jewelleryColors.text,
    fontSize: 16,
  },
  contactSubValue: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    marginTop: spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: jewelleryColors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  callButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
    fontSize: 16,
  },
  emailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: jewelleryColors.bg,
    borderWidth: 1,
    borderColor: jewelleryColors.border,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  emailButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: jewelleryColors.text,
    fontSize: 16,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: jewelleryColors.bg,
    borderWidth: 1,
    borderColor: jewelleryColors.border,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  shareButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: jewelleryColors.text,
    fontSize: 16,
  },
});

export default EventDetailScreen;
