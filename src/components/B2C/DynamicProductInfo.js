import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const DynamicProductInfo = ({ productData }) => {
  const { t } = useTranslation();

  // Helper function to render info row
  const renderInfoRow = (label, value, isRequired = false) => {
    if (!value && !isRequired) return null;
    
    return (
      <View style={styles.infoRow} key={label}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || t('not_specified')}</Text>
      </View>
    );
  };

  // Get category-specific fields
  const getCategorySpecificFields = () => {
    const category = productData.category;
    const fields = [];

    switch (category) {
      case 'Real Estate':
        fields.push(
          renderInfoRow(t('property_type'), productData.propertyType, true),
          renderInfoRow(t('area'), productData.area, true),
          renderInfoRow(t('bedrooms'), productData.bedrooms, productData.subcategory !== 'Plot'),
          renderInfoRow(t('bathrooms'), productData.bathrooms, productData.subcategory !== 'Plot'),
          renderInfoRow(t('furnished_status'), productData.furnished, productData.subcategory !== 'Plot'),
          renderInfoRow(t('floor'), productData.floor, productData.subcategory === 'Apartment'),
          renderInfoRow(t('total_floors'), productData.totalFloors, productData.subcategory === 'Apartment')
        );
        break;

      case 'Vehicles':
        fields.push(
          renderInfoRow(t('mileage'), productData.mileage, true),
          renderInfoRow(t('year'), productData.year, true),
          renderInfoRow(t('fuel_type'), productData.fuelType, true),
          renderInfoRow(t('transmission'), productData.transmission, true)
        );
        break;

      case 'Food Products':
        fields.push(
          renderInfoRow(t('expiry_date'), productData.expiryDate, true),
          renderInfoRow(t('weight_quantity'), productData.weight, true),
          renderInfoRow(t('brand'), productData.brand, false)
        );
        break;

      default:
        // For Furniture, Electronics, and Other categories
        fields.push(
          renderInfoRow(t('product_condition'), productData.condition, true),
          renderInfoRow(t('product_age'), productData.productAge, true)
        );
        break;
    }

    return fields.filter(field => field !== null);
  };

  // Get common fields for all categories
  const getCommonFields = () => {
    return [
      renderInfoRow(t('category'), productData.category, true),
      renderInfoRow(t('subcategory'), productData.subcategory, true),
      renderInfoRow(t('seller_name'), productData.sellerName, true),
      renderInfoRow(t('phone_number'), productData.phone, true),
      renderInfoRow(t('email'), productData.email, true),
      renderInfoRow(t('address'), productData.address, true),
      renderInfoRow(t('location_link'), productData.address_link, false)
    ].filter(field => field !== null);
  };

  return (
    <View style={styles.container}>
      {/* Basic Product Information */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{t('basic_info')}</Text>
        {getCommonFields()}
      </View>

      {/* Category-specific Information */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{t('product_details')}</Text>
        {getCategorySpecificFields()}
      </View>

      {/* Description */}
      {productData.description && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('product_description')}</Text>
          <Text style={styles.descriptionText}>{productData.description}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
    flex: 1,
    marginRight: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right',
  },
  descriptionText: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
    textAlign: 'justify',
  },
});

export default DynamicProductInfo;
