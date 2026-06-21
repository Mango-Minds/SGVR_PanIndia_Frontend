import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';
import { BASEIMGURL } from '../../infrastructure/constants';
import { navigateJewelleryAuthTab } from '../../utils/requireAuth';
import {
  getVendorsList,
  getWorkersList,
  getDesignersList,
  getGemologistsList,
} from '../../services/jewellery.services';

const DIRECTORY_CONFIG = {
  VendorsScreen: {
    title: 'Vendors',
    emptyIcon: 'person',
    emptyText: 'No vendors found',
    fetch: getVendorsList,
    detailScreen: 'EachVendor',
    getDetailParams: (item) => ({ vendor: item, vendorId: item._id }),
  },
  WorkersScreen: {
    title: 'Workers',
    emptyIcon: 'people',
    emptyText: 'No workers found',
    fetch: getWorkersList,
    detailScreen: 'EachWorker',
    getDetailParams: (item) => ({ worker: item, workerId: item._id }),
  },
  DesignersScreen: {
    title: 'Designers',
    emptyIcon: 'star',
    emptyText: 'No designers found',
    fetch: getDesignersList,
    detailScreen: 'EachDesigner',
    getDetailParams: (item) => ({ designer: item }),
  },
  GemologistScreen: {
    title: 'Gemologists',
    emptyIcon: 'diamond',
    emptyText: 'No gemologists found',
    fetch: getGemologistsList,
    detailScreen: 'EachGemologist',
    getDetailParams: (item) => ({ gemologist: item }),
  },
};

const getImageUri = (item) => {
  const imagePath =
    item?.owner?.image ||
    item?.profileImage ||
    item?.image ||
    (item?.images?.length ? item.images[0] : null);

  if (!imagePath) return null;
  return imagePath.startsWith('http') ? imagePath : `${BASEIMGURL}${imagePath}`;
};

const getSubtitle = (item) => {
  if (item?.owner?.address) return item.owner.address;
  if (item?.address) return item.address;
  if (item?.location) return item.location;
  if (item?.certification) return item.certification;
  if (item?.city && item?.state) return `${item.city}, ${item.state}`;
  if (item?.city || item?.state) return item.city || item.state;
  return 'Address not available';
};

const getDisplayName = (item) =>
  item.username ||
  item.name ||
  (item.owner?.firstName
    ? `${item.owner.firstName} ${item.owner.lastName || ''}`.trim()
    : 'Unknown');

const DirectoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { token, isGuest } = useSelector((state) => state.user);
  const config = DIRECTORY_CONFIG[route.name];

  const [activeTab, setActiveTab] = useState('home');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      setActiveTab('home');
    }, [])
  );

  const fetchItems = useCallback(async () => {
    if (!config) return;

    try {
      setLoading(true);
      setError(null);
      const data = await config.fetch();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];
      setItems(list);
    } catch (err) {
      console.error(`Error fetching ${config.title}:`, err);
      setError(`Failed to load ${config.title.toLowerCase()}. Please try again.`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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

  if (!config) {
    return (
      <SafeAreaView style={commonStyles.container} edges={['top']}>
        <HeaderBar showBack title="Not Found" onBackPress={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Screen not configured.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar
        showBack
        title={config.title}
        onBackPress={() => navigation.navigate('HomeScreen')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={jewelleryColors.primary} />
            <Text style={styles.loadingText}>Loading {config.title.toLowerCase()}...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Icon name="error-outline" size={48} color={jewelleryColors.textSecondary} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchItems}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.centerContainer}>
            <Icon name={config.emptyIcon} size={48} color={jewelleryColors.textSecondary} />
            <Text style={styles.emptyText}>{config.emptyText}</Text>
          </View>
        ) : (
          items.map((item) => {
            const imageUri = getImageUri(item);
            const name = getDisplayName(item);
            const subtitle = getSubtitle(item);

            return (
              <TouchableOpacity
                key={item._id || item.id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate(config.detailScreen, config.getDetailParams(item))
                }
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Icon name={config.emptyIcon} size={32} color={jewelleryColors.textSecondary} />
                  </View>
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.name} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={styles.subtitle} numberOfLines={2}>
                    {subtitle}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color={jewelleryColors.textSecondary} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    minHeight: 200,
  },
  loadingText: {
    ...typography.body,
    color: jewelleryColors.textSecondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: jewelleryColors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
    marginHorizontal: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: jewelleryColors.text,
    marginTop: spacing.md,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: jewelleryColors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: jewelleryColors.bg,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: jewelleryColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: jewelleryColors.bgSecondary,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: jewelleryColors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.body,
    fontWeight: '700',
    color: jewelleryColors.text,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
  },
});

export default DirectoryScreen;
