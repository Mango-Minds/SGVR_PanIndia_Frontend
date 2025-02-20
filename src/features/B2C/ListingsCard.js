import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BASEAPIURL, BASEIMGURL } from "../../infrastructure/constants";
import Theme from "../../styles/theme";
const ListingCard = ({ items, fetchProducts, loadingAnimation }) => {
  console.log("Items in card: ", items);
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
                  source={{ uri: `${BASEIMGURL}${product.images[0]}` }}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.priceCard}>
                <Text
                  style={styles.productPrice}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {product?.price}
                </Text>
              </View>
              <Text
                style={styles.productName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {product?.name}
              </Text>
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
    borderRadius: 5,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    //   elevation: 1,
    width: "100%",
  },
  priceCard: {
    backgroundColor: "#F0F0F0",
    borderRadius: 7,
    marginLeft: 8,
    marginTop: 5,
    width: "92%",
  },
  productImage: {
    width: "100%",
    height: 250,
    borderRadius: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "400",
    marginTop: 6,
    maxWidth: "100%",
    marginLeft: 15,
  },
  productPrice: {
    fontSize: 14,
    color: "black",
    marginTop: 8,
    marginLeft: 5,
  },
});
export default ListingCard;
