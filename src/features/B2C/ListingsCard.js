import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Theme from "../../styles/theme";
const ListingCard = ({ items, fetchProducts, loadingAnimation }) => {
  const navigation = useNavigation();

  const firstTwoItems = items?.slice(0, 2);
  return (
    <View style={{ flex: 1, padding: 10 }}>
      <View style={styles.gridContainer}>
        {loadingAnimation ? (
          <ActivityIndicator
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            size={"large"}
            color={Theme.themeColor}
          />
        ) : items.length > 0 ? (
          firstTwoItems?.map((product, index) => (
            <TouchableOpacity
              key={index}
              style={styles.cardWrapper}
              onPress={() =>
                navigation.navigate("EachListing", {
                  itemId: product._id,
                  item: product,
                  fetchProducts: fetchProducts,
                })
              }
            >
              <View style={styles.card}>
                <Image
                  style={styles.productImage}
                  source={{ uri: `${product.images[0]}` }}
                  resizeMode="cover"
                />
                <View style={styles.productInfoContainer}>
                  <Text
                    style={styles.productName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {product?.name}
                  </Text>
                  <View style={styles.priceConditionRow}>
                    <Text
                      style={styles.productPrice}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      ₹{product?.price?.toLocaleString('en-IN')}
                    </Text>
                    {product?.condition && (
                      <View style={styles.conditionBadge}>
                        <Text style={styles.conditionText}>{product.condition}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ fontSize: 16, color: "gray" }}>
              No products found
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    overflow: "hidden",
    minHeight: 200,
  },
  productImage: {
    width: "100%",
    height: 100,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 6,
    color: "#333",
    lineHeight: 18,
    textAlign: "left",
  },
  productPrice: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "600",
    marginTop: 4,
  },
  productInfoContainer: {
    marginTop: 6,
    paddingHorizontal: 4,
    flex: 1,
  },
  priceConditionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    justifyContent: "space-between",
  },
  conditionBadge: {
    backgroundColor: "#e8f5e8",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  conditionText: {
    fontSize: 10,
    color: "#27ae60",
    fontWeight: "600",
  },
  viewDetailsText: {
    color: Theme.themeColor,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
  },
});
export default ListingCard;
