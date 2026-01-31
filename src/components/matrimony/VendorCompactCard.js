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

const VendorCompactCard = ({ 
  vendor, 
  onPress, 
  showConnectionStatus = false,
  connectionStatus = 'none' // 'none', 'pending', 'accepted', 'rejected'
}) => {
  const { t } = useTranslation();

  const hasImage = vendor.images && vendor.images.length > 0;

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
                  ? { uri: vendor.images[0] }
                  : require('../../assets/images/general/user.png')
              }
              style={styles.profileImage}
              resizeMode="cover"
            />
            {!hasImage && (
              <View style={styles.noImageOverlay}>
                <Icon name="business" size={30} color="#ccc" />
              </View>
            )}
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          {/* Business Name */}
          <View style={styles.nameSection}>
            <Text style={styles.nameText} numberOfLines={1}>
              {vendor.businessName || vendor.name || 'Business Name not provided'}
            </Text>
            {vendor.category && (
              <Text style={styles.categoryText}>{vendor.category}</Text>
            )}
          </View>

          {/* Address and Location */}
          <View style={styles.infoSection}>
            {vendor.address && (
              <View style={styles.detailRow}>
                <Icon name="location-outline" size={12} color="#666" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {vendor.address}
                </Text>
              </View>
            )}
            {vendor.city && (
              <View style={styles.detailRow}>
                <Icon name="business-outline" size={12} color="#666" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {vendor.city}
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
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.themeColor,
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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

export default VendorCompactCard;
