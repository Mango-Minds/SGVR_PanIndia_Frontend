import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ProductCard from '../../components/Jewellery/ProductCard';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import AddProductScreen from './AddProductScreen';
import {
  getProductRequirements,
  getMyProductRequirements,
} from '../../services/jewellery.services';
import { mapProductRequirement } from '../../utils/mapJewelryProduct';
import { requireAuth, navigateJewelleryAuthTab } from '../../utils/requireAuth';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

const NUM_COLUMNS = 3;
const GRID_PADDING = spacing.sm;
const GRID_GAP = spacing.xs;
const CARD_WIDTH = Math.floor(
  (Dimensions.get('window').width - GRID_PADDING * 2 - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS
);
const PAGE_LIMIT = 30;

const ProductRequirementsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { token, isGuest } = useSelector((state) => state.user);

  const CONTENT_TABS = useMemo(
    () => [
      { key: 'all', label: t('all') },
      { key: 'mine', label: t('jw_my_requirements') },
    ],
    [t]
  );
  const [bottomTab, setBottomTab] = useState('home');
  const [contentTab, setContentTab] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const [allProducts, setAllProducts] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const requestIdRef = useRef(0);

  const products = contentTab === 'mine' ? myProducts : allProducts;

  const handleBackPress = () => {
    if (contentTab === 'mine' && showAddForm) {
      setShowAddForm(false);
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('JewellerysHomeScreen');
  };

  const fetchList = useCallback(
    async ({
      pageNum = 1,
      isRefresh = false,
      append = false,
      mine = false,
    } = {}) => {
      const requestId = ++requestIdRef.current;

      if (isRefresh) {
        setRefreshing(true);
      } else if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const response = mine
          ? await getMyProductRequirements({ page: pageNum, limit: PAGE_LIMIT })
          : await getProductRequirements({ page: pageNum, limit: PAGE_LIMIT });

        if (requestId !== requestIdRef.current) return;

        const rawList = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

        const mapped = rawList.map(mapProductRequirement).filter(Boolean);
        const pages = response?.pagination?.pages;
        const nextHasMore =
          typeof pages === 'number' ? pageNum < pages : mapped.length >= PAGE_LIMIT;

        const setter = mine ? setMyProducts : setAllProducts;
        setter((prev) => (append ? [...prev, ...mapped] : mapped));
        setPage(pageNum);
        setHasMore(nextHasMore);
      } catch (error) {
        console.error('Error fetching product requirements:', error);
        if (!append) {
          if (mine) setMyProducts([]);
          else setAllProducts([]);
        }
        setHasMore(false);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      setBottomTab('home');
      if (contentTab === 'all') {
        fetchList({ pageNum: 1, mine: false });
      } else if (contentTab === 'mine' && !showAddForm) {
        fetchList({ pageNum: 1, mine: true });
      }
    }, [contentTab, showAddForm, fetchList])
  );

  const handleContentTabChange = (tabKey) => {
    if (tabKey === 'mine') {
      const allowed = requireAuth({
        token,
        isGuest,
        dispatch,
        navigation,
        message: t('jw_sign_in_requirements'),
        onAuthed: () => {
          setShowAddForm(false);
          setContentTab('mine');
          fetchList({ pageNum: 1, mine: true });
        },
      });
      if (!allowed) return;
      return;
    }

    setShowAddForm(false);
    setContentTab('all');
    fetchList({ pageNum: 1, mine: false });
  };

  const handleBottomTabChange = (tab) => {
    setBottomTab(tab);
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

  const handleProductPress = (productId) => {
    navigation.navigate('ProductDetailScreen', {
      productId,
      type: 'requirement',
    });
  };

  const handleRefresh = () => {
    fetchList({
      pageNum: 1,
      isRefresh: true,
      mine: contentTab === 'mine',
    });
  };

  const handleLoadMore = () => {
    if (!hasMore || loading || loadingMore || refreshing || showAddForm) return;
    fetchList({
      pageNum: page + 1,
      append: true,
      mine: contentTab === 'mine',
    });
  };

  const openAddForm = () => {
    requireAuth({
      token,
      isGuest,
      dispatch,
      navigation,
      message: t('jw_sign_in_add_requirement'),
      onAuthed: () => setShowAddForm(true),
    });
  };

  const handleProductAdded = () => {
    setShowAddForm(false);
    setContentTab('mine');
    fetchList({ pageNum: 1, mine: true });
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <ProductCard
        id={item.id}
        image={item.image}
        title={item.title}
        shop={item.shop}
        price={item.priceLabel || item.price}
        rating={item.rating}
        reviewCount={item.reviewCount}
        onPress={() => handleProductPress(item.id)}
      />
    </View>
  );

  const renderGallery = ({ emptyTitle, emptySubtitle, showAddInEmpty }) => {
    if (loading && products.length === 0) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={jewelleryColors.primary} />
          <Text style={styles.centeredText}>{t('jw_loading_album')}</Text>
        </View>
      );
    }

    if (!loading && products.length === 0) {
      return (
        <View style={styles.centered}>
          <Icon name="photo-library" size={48} color={jewelleryColors.textSecondary} />
          <Text style={styles.centeredTitle}>{emptyTitle}</Text>
          <Text style={styles.centeredText}>{emptySubtitle}</Text>
          {showAddInEmpty && (
            <TouchableOpacity style={styles.addCta} onPress={openAddForm}>
              <Icon name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addCtaText}>{t('jw_add_requirement')}</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View style={styles.galleryWrap}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          renderItem={renderProductItem}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={jewelleryColors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={jewelleryColors.primary} />
              </View>
            ) : null
          }
        />
        {contentTab === 'mine' && (
          <TouchableOpacity
            style={styles.fab}
            onPress={openAddForm}
            activeOpacity={0.85}
          >
            <Icon name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderMineTab = () => {
    if (showAddForm) {
      return (
        <View style={styles.formWrap}>
          <View style={styles.formHeader}>
            <TouchableOpacity
              style={styles.formBackBtn}
              onPress={() => setShowAddForm(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="arrow-back" size={20} color={jewelleryColors.text} />
            </TouchableOpacity>
            <Text style={styles.formHeaderTitle}>{t('jw_add_requirement')}</Text>
          </View>
          <AddProductScreen
            embedded
            asRequirement
            onSuccess={handleProductAdded}
          />
        </View>
      );
    }

    return renderGallery({
      emptyTitle: t('jw_no_requirements'),
      emptySubtitle: t('jw_add_first_requirement'),
      showAddInEmpty: true,
    });
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title={t('jw_product_requirements')} onBackPress={handleBackPress} />

      <View style={styles.tabBar}>
        {CONTENT_TABS.map((tab) => {
          const isActive = contentTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => handleContentTabChange(tab.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.content}>
        {contentTab === 'all'
          ? renderGallery({
              emptyTitle: t('jw_no_product_requirements'),
              emptySubtitle: t('jw_album_photos_hint'),
              showAddInEmpty: false,
            })
          : renderMineTab()}
      </View>

      <BottomTabBar activeTab={bottomTab} onTabChange={handleBottomTabChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    backgroundColor: jewelleryColors.bgSecondary,
    borderRadius: 10,
    padding: 3,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    position: 'relative',
  },
  tabItemActive: {
    backgroundColor: jewelleryColors.bg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabLabel: {
    ...typography.bodySmall,
    fontSize: 13,
    fontWeight: '500',
    color: jewelleryColors.textSecondary,
  },
  tabLabelActive: {
    color: jewelleryColors.primary,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 3,
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: jewelleryColors.primary,
  },
  content: {
    flex: 1,
  },
  galleryWrap: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl + 40,
  },
  gridRow: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  centeredTitle: {
    ...typography.body,
    fontWeight: '600',
    color: jewelleryColors.text,
    marginTop: spacing.md,
  },
  centeredText: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  addCta: {
    marginTop: spacing.lg,
    backgroundColor: jewelleryColors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addCtaText: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: jewelleryColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  formWrap: {
    flex: 1,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: jewelleryColors.border,
    gap: spacing.sm,
  },
  formBackBtn: {
    padding: spacing.xs,
  },
  formHeaderTitle: {
    ...typography.body,
    fontWeight: '600',
    color: jewelleryColors.text,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
});

export default ProductRequirementsScreen;
