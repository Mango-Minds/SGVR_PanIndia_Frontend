import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import Theme from '../../styles/theme';

const { width } = Dimensions.get('window');

const CompactProfileCard = ({ 
  profile, 
  onPress, 
  showConnectionStatus = false,
  connectionStatus = 'none', // 'none', 'pending', 'accepted', 'rejected'
  subscriptionInfo = null // { isPremium: boolean, endDate: string, remainingDays: number }
}) => {
  const { t } = useTranslation();

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Helper function to format height
  const formatHeight = (height) => {
    if (!height) return null;
    const feet = Math.floor(height / 12);
    const inches = height % 12;
    return `${feet}'${inches}"`;
  };

  const age = calculateAge(profile.dateOfBirth);
  const height = formatHeight(profile.height);
  const hasImage = profile.images && profile.images.length > 0;

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'pending': return '#D4AF37';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return Theme.themeColor;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'pending': return t('connection_pending');
      case 'accepted': return t('connection_accepted');
      case 'rejected': return t('connection_rejected');
      default: return t('view_details');
    }
  };

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
      <View style={styles.cardContent}>
        {/* Image Section */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image
              source={
                hasImage
                  ? { uri: profile.images[0] }
                  : require('../../assets/images/general/user.png')
              }
              style={styles.profileImage}
              resizeMode="cover"
            />
            {!hasImage && (
              <View style={styles.noImageOverlay}>
                <Icon name="person" size={30} color="#ccc" />
              </View>
            )}
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          {/* Name and Age */}
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={styles.nameText} numberOfLines={1}>
                {profile.name || 'Name not provided'}
              </Text>
              {subscriptionInfo?.isPremium && (
                <View style={styles.premiumBadge}>
                  <Icon name="star" size={12} color="#FFD700" />
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>
            {age && (
              <Text style={styles.ageText}>{age} {t('years')}</Text>
            )}
            {subscriptionInfo?.isPremium && subscriptionInfo?.remainingDays && (
              <Text style={styles.subscriptionText}>
                Premium expires in {subscriptionInfo.remainingDays} days
              </Text>
            )}
          </View>

          {/* Occupation and Location */}
          <View style={styles.infoSection}>
            {profile.occupation && (
              <View style={styles.detailRow}>
                <Icon name="briefcase-outline" size={12} color="#666" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {profile.occupation}
                </Text>
              </View>
            )}
            {profile.homeTown && (
              <View style={styles.detailRow}>
                <Icon name="location-outline" size={12} color="#666" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {profile.homeTown}
                </Text>
              </View>
            )}
          </View>

          {/* Action Button */}
          <View style={styles.actionSection}>
            <View style={[
              styles.actionButton,
              { backgroundColor: getConnectionStatusColor() }
            ]}>
              <Text style={styles.actionButtonText}>
                {getConnectionStatusText()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageSection: {
    width: 80,
    marginRight: 12,
  },
  imageContainer: {
    width: 80,
    height: 100,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  noImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  detailsSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameSection: {
    marginBottom: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.themeColor,
    flex: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  premiumText: {
    fontSize: 10,
    color: '#856404',
    fontWeight: '600',
    marginLeft: 2,
  },
  ageText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  subscriptionText: {
    fontSize: 10,
    color: '#856404',
    fontStyle: 'italic',
    marginTop: 2,
  },
  infoSection: {
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  actionSection: {
    alignItems: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default CompactProfileCard;
