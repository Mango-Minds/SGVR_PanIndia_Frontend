import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { jewelleryColors, typography, spacing } from '../../styles/jewellery.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CarouselBanner = ({ items = [], onItemPress }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const scrollViewRef = useRef(null);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  if (!items || items.length === 0) {
    // Default banner based on UI samples
    return (
      <View style={styles.container}>
        <View style={styles.banner}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Limited Deals</Text>
            <Text style={styles.subtitle}>YOUR SPARKLE, OUR TREAT!</Text>
            <View style={styles.offerContainer}>
              <Text style={styles.offerText}>GET 100% OFF</Text>
              <Text style={styles.offerSubtext}>making charges</Text>
              <Text style={styles.offerSubtext}>select Diamond Jewellery</Text>
            </View>
          </View>
          <View style={styles.imageContainer}>
            {/* Placeholder for earrings image */}
            <View style={styles.placeholderImage} />
          </View>
        </View>
        <View style={styles.indicators}>
          <View style={[styles.indicator, styles.activeIndicator]} />
          <View style={styles.indicator} />
          <View style={styles.indicator} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.banner}
            onPress={() => onItemPress && onItemPress(item)}
            activeOpacity={0.9}
          >
            {item.image && !imageErrors[index] ? (
              <View style={styles.bannerWithImage}>
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.bannerImage} 
                  resizeMode="cover"
                  onError={() => setImageErrors(prev => ({ ...prev, [index]: true }))}
                />
                <View style={styles.imageOverlay} />
                <View style={styles.bannerContent}>
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title || 'Limited Deals'}</Text>
                    <Text style={styles.subtitle}>{item.subtitle || 'YOUR SPARKLE, OUR TREAT!'}</Text>
                    {item.offer && (
                      <View style={styles.offerContainer}>
                        <Text style={styles.offerText}>{item.offer}</Text>
                        {item.offerSubtext && (
                          <Text style={styles.offerSubtext}>{item.offerSubtext}</Text>
                        )}
                        {item.offerSubtext2 && (
                          <Text style={styles.offerSubtext}>{item.offerSubtext2}</Text>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.bannerContent}>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{item.title || 'Limited Deals'}</Text>
                  <Text style={styles.subtitle}>{item.subtitle || 'YOUR SPARKLE, OUR TREAT!'}</Text>
                  {item.offer && (
                    <View style={styles.offerContainer}>
                      <Text style={styles.offerText}>{item.offer}</Text>
                      {item.offerSubtext && (
                        <Text style={styles.offerSubtext}>{item.offerSubtext}</Text>
                      )}
                      {item.offerSubtext2 && (
                        <Text style={styles.offerSubtext}>{item.offerSubtext2}</Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.indicators}>
        {items.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === activeIndex && styles.activeIndicator
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  banner: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    height: 200,
    borderRadius: 16,
    marginHorizontal: spacing.xl,
    overflow: 'hidden',
    backgroundColor: jewelleryColors.bgDark,
  },
  bannerWithImage: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imageOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    padding: spacing.lg,
    position: 'relative',
    zIndex: 1,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.heading1,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.heading3,
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  offerContainer: {
    marginTop: spacing.md,
  },
  offerText: {
    ...typography.heading2,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  offerSubtext: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  imageContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: jewelleryColors.border,
  },
  activeIndicator: {
    width: 24,
    backgroundColor: jewelleryColors.primary,
  },
});

export default CarouselBanner;

