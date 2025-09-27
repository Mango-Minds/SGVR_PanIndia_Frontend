import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import UserImg from "../../assets/images/general/user.png";
import Theme from "../../styles/theme";
import { ScrollView } from "react-native-gesture-handler";
import { decode } from "base-64";
import React, { useEffect, useState } from "react";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { Divider, IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import { useNavigation } from "@react-navigation/native";
import { getEachShopData } from "../../services/jewellery.services";
import { useIsFocused } from "@react-navigation/native";
import { BASEAPIURL } from "../../infrastructure/constants";
import { useSelector } from "react-redux";
import apiClient from "../../store/apiClient";
import { useTranslation } from "react-i18next";
const EachShopProfile = ({ route }) => {
  const token = useSelector((state) => state.user.token);
 
 const { t } = useTranslation();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [shopProducts, setShopProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentShop, setCurrentShop] = useState(null);

  const { shop, shopId } = route.params;
  
  // Use currentShop if available, otherwise fall back to route params shop
  const displayShop = currentShop || shop;
  console.log("each shop profile screen", shop);
  console.log("Shopid: ", shopId);
  
  // Validate shop data
  if (!shop || !shopId) {
    console.error("Invalid shop data or shopId");
    return (
      <Container style={{ padding: 20, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, color: "red" }}>Error: Invalid shop data</Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20, padding: 10, backgroundColor: Theme.themeColor, borderRadius: 5 }}
        >
          <Text style={{ color: "white" }}>Go Back</Text>
        </TouchableOpacity>
      </Container>
    );
  }
  
  // Add error handling for token parsing
  let fromVendorId = null;
  let decodedPayload = null;
  
  try {
    if (token) {
      const tokenPayload = token.split(".")[1];
      decodedPayload = JSON.parse(decode(tokenPayload));
      fromVendorId = decodedPayload.id;
    }
  } catch (error) {
    console.error("Error parsing token:", error);
  }

 const userType = useSelector((state) => state.user.user.userType);
 
 // Check if current user is the shop owner with better error handling
  const isShopOwner = fromVendorId && displayShop?.owner && (
  displayShop.owner === fromVendorId ||
  displayShop.owner.id === fromVendorId || 
  displayShop.owner.id?._id === fromVendorId ||
  displayShop.owner._id === fromVendorId
);
 
 console.log("Shop owner check:", {
   fromVendorId,
   shopOwner: displayShop?.owner,
   isShopOwner
 });

  
  

  // const fetchShop = async () => {
  //   try {
  //     const response = await fetch(`${BASEAPIURL}/templeShops/${shopId}`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (!response.ok) {
  //       const errorMessage = await response.text();
  //       throw new Error(`Failed to fetch products: ${errorMessage}`);
  //     }
  //     const data = await response.json();
  //     console.log("fetched shop:", data)
  //     console.log("Products for logged-in worker: ", shopProducts);
  //   } catch (error) {
  //     console.error("Error fetching products:", error);
  //   }
  // };

  // const fetchShopProducts = async () => {
  //   try {
  //     const response = await fetch(`${BASEAPIURL}/products`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.ok) {
  //       const data = await response.json();

  //       const filteredProducts = data.filter(
  //         (product) => product.shop._id === shopId
  //       );
  //       setShopProducts(filteredProducts);
  //     } else {
  //       throw new Error("Failed to fetch products");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching products:", error);
  //   } finally {
  //     setIsloading(false);
  //   }
  // };

  const fetchShop = async () => {
    try {
      const response = await apiClient.get(`/templeShops/${shopId}`);
      
      if (response.data) {
        // Update the shop state with fresh data from backend
        const updatedShop = { ...shop, ...response.data };
        setCurrentShop(updatedShop);
        console.log("Shop updated with fresh data:", updatedShop);
      }
      
      console.log("Fetched shop:", response.data);
    } catch (error) {
      console.error("Error fetching shop:", error);
      Alert.alert("Error", "Failed to refresh shop data. Please try again.");
    }
  };
  
  const fetchShopProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/products");
  
      if (response.data && Array.isArray(response.data)) {
        const filteredProducts = response.data.filter(
          (product) => product.shop && product.shop._id === shopId
        );
        setShopProducts(filteredProducts);
      } else {
        console.warn("Invalid response data for products");
        setShopProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setShopProducts([]);
      // Show user-friendly error message for temple admins
      if (userType.includes("templeAdmin")) {
        Alert.alert("Error", "Failed to load shop products. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isFocused) {
      fetchShop()
      fetchShopProducts();
    }
  }, [isFocused]);

  console.log("Products: ", shopProducts);
  console.log("Image: ", shopProducts.pictures);
  console.log("Picture 1: ");

  // const deleteShop = async () => {
  //   try {
  //     const response = await fetch(`${BASEAPIURL}/templeShops/${shopId}`, {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     if (!response.ok) {
  //       throw new Error("Failed to delete shop");
  //     }

  //     Alert.alert(
  //       "Success",
  //       "Shop deleted successfully",
  //       [
  //         {
  //           text: "OK",
  //           onPress: () => {

  //             navigation.goBack();
  //           },
  //         },
  //       ],
  //       { cancelable: false }
  //     );
  //   } catch (error) {
  //     console.error("Error deleting shop:", error);
  //   }
  // };
  const deleteShop = async () => {
    // Confirm delete action first
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this shop? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/templeShops/${shopId}`);
          
              Alert.alert(
                "Success",
                "Shop deleted successfully",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      navigation.goBack();
                    },
                  },
                ],
                { cancelable: false }
              );
            } catch (error) {
              console.error("Error deleting shop:", error);
              Alert.alert(
                "Error", 
                error.response?.data?.message || "Failed to delete shop. Please try again."
              );
            }
          }
        }
      ]
    );
  };
  
  return (
    <Container
      style={{
        paddingRight: 0,
        paddingLeft: 0,
        paddingBottom: 0,
        backgroundColor: "white",
      }}
    >
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{ color: Theme.themeColor, fontSize: 20, fontWeight: "bold" }}
          >
            {t("shopDetails")}
          </TopText>
        </View>
        {(isShopOwner || userType.includes("SA")) && (
          <>
            <IconButton
              icon="trash-can-outline"
              style={{ marginLeft: "auto" }}
              onPress={deleteShop}
            />
            <IconButton
              icon="pencil-outline"
              onPress={() =>
                navigation.navigate("EditShop",{
                 shop: displayShop,
                })
              }
            />
          </>
        )}
      </RowBetween>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{ padding: "3%", marginTop: "2%", flexDirection: "column" }}
        >
          <View style={{ position: "relative" }}>
            <Image
              source={
                displayShop.image
                  ? {
                    uri: `${displayShop.image}`,
                  }
                  : UserImg
              }
              style={style.ImageStyle}
              resizeMode="cover"
            />
            {!displayShop.image && (
              <View style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.1)",
                borderRadius: 20,
              }}>
                <MaterialIcon name="store" size={40} color={Theme.themeColor} />
                <Text style={{ color: Theme.themeColor, marginTop: 5, fontWeight: "bold" }}>
                  {displayShop.name}
                </Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: "column" }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                opacity: 0.8,
                marginTop: "3%",
              }}
            >
              {displayShop.name}
            </Text>
            <View
              style={{
                flexDirection: "column",
                marginTop: 20,
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: Theme.themeColor,
                }}
              >
                {t("aboutUs")} :
              </Text>
              <Text style={style.description}>
                {displayShop.description || t("noDescriptionAvailable")}
              </Text>
            </View>
            <View>
              <View style={style.contactDetails}>
                <MaterialIcon name="email" size={18} color={Theme.themeColor}/>
                <Text style={style.contact}>
                  {displayShop.email || t("emailNotAvailable")}
                </Text>
              </View>
              <View style={style.contactDetails}>
                <MaterialIcon name="phone" size={18} color={Theme.themeColor} />
                <Text style={style.contact}>
                  {displayShop.phone || t("phoneNotAvailable")}
                </Text>
              </View>
              <View style={[style.contactDetails, { marginBottom: 10 }]}>
                <MaterialIcon name="location-on" size={18} color={Theme.themeColor} />
                <Text style={style.contact}>
                  {[displayShop?.address, displayShop?.city, displayShop?.state].filter(Boolean).join(", ") || t("addressNotAvailable")}
                </Text>
              </View>
              
              {/* Shop Statistics */}
              <View style={style.contactDetails}>
                <MaterialIcon name="inventory" size={18} color={Theme.themeColor} />
                <Text style={style.contact}>
                  {t("totalProducts")}: {shopProducts?.length || 0}
                </Text>
              </View>
              
              <View style={[style.contactDetails, { marginBottom: 20 }]}>
                <MaterialIcon name="store" size={18} color={Theme.themeColor} />
                <Text style={style.contact}>
                  {t("status")}: {displayShop.status === "accepted" ? t("active") : t("pending")}
                </Text>
              </View>
              
              <Divider />
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            marginBottom: 10,
            alignItems: "center",
            justifyContent: isShopOwner ? "space-between" : "center",
            paddingHorizontal: 10,
          }}
        >
          <TouchableOpacity
            style={{
              borderBottomColor:Theme.themeColor,
              borderBottomWidth: 2,
              paddingVertical: 5,
              flex: isShopOwner ? 0.6 : 1,
            }}
            // onPress={() => setScreen("Product")}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 16,
                fontWeight: "600",
                letterSpacing: 0.5,
                color: Theme.themeColor,
              }}
            >
              {t("ourCatalog")}
            </Text>
          </TouchableOpacity>
          
          {isShopOwner && (
            <TouchableOpacity
              style={{
                backgroundColor: Theme.themeColor,
                borderRadius: 5,
                paddingVertical: 8,
                paddingHorizontal: 12,
                flex: 0.35,
              }}
              onPress={() => {
                navigation.navigate("AddShopProduct", {
                  shopId: shopId,
                  shop: displayShop,
                  onProductAdded: () => fetchShopProducts(),
                });
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: "600",
                  color: "white",
                }}
              >
                {t("addProduct")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {/* <View style={{ padding: "2.5%", paddingTop: "1%" }}>
            <View style={styles.eachJewelleryCardContainer}>
              {shopProducts.map((product, index) => (
                <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                  <Pressable
                    key={index}
                    // onPress={() => {
                    //   navigation.navigate("EachProduct", {
                    //     productId: product._id,
                    //     product: product,
                    //   });
                    // }}
                  >
                    <Image
                      style={styles.eachJewelleryCardImg}
                      source={{ uri: `${BASEIMGURL}${product.pictures[0]}` }}
                      
                    ></Image>
                    <View style={{ marginLeft: "2%", marginTop: "5%" }}>
                      <Text style={{ fontWeight: "700", fontSize: 14 }}>
                        {product.name}
                      </Text>
                      <View style={{ marginTop: "3%", flexDirection: "row" }}>
                        <Text
                          style={{
                            opacity: 0.5,
                            marginLeft: "0%",
                            fontSize: 13,
                          }}
                        >
                          ₹{product.price}
                        </Text>
                      </View>
                      <Text style={{ color: "#b58904", marginTop: 10 }}>
                        View Details
                      </Text>
                    </View>
                  </Pressable>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginTop: "5%",
                width: "100%",
                marginBottom: "10%",
              }}
            >
              <Pressable
                // onPress={() => {
                //   navigation.navigate("EachShopAllProducts", {
                //     userType: shop.owner.userType,
                //     ownerId: shop.owner._id,
                //   });
                // }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    letterSpacing: 0.5,
                    color: "#D4AF37",
                    textAlign: "center",
                    textDecorationLine: "underline",
                  }}
                >
                  View More Products
                </Text>
              </Pressable>
            </TouchableOpacity>
          </View> */}
        <View style={{ padding: "2.5%", paddingTop: "1%" }}>
          <View style={styles.eachJewelleryCardContainer}>
            {shopProducts.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "600",
                    color: Theme.themeColor,
                  }}
                >
                 {t("noProductsAdded")}
                </Text>
              </View>
            ) : (
              shopProducts.map((product, index) => (
                <View
                  key={index}
                  style={[styles.shadowProp, styles.eachJewelleryCard]}
                >
                  <Pressable
                    key={product._id}
                    onPress={() => {
                      navigation.navigate("EachProduct", {
                        productId: product._id,
                        product: product,
                      });
                    }}
                  >
                    <Image
                      style={styles.eachJewelleryCardImg}
                      source={{ uri: `${product.pictures[0]}` }}
                    />
                    <View style={{ marginLeft: "2%", marginTop: "5%" }}>
                      <Text style={{ fontWeight: "700", fontSize: 14 }}>
                        {product.name}
                      </Text>
                      <View style={{ marginTop: "3%", flexDirection: "row" }}>
                        <Text
                          style={{
                            opacity: 0.5,
                            marginLeft: "0%",
                            fontSize: 13,
                          }}
                        >
                          ₹{product.price}
                        </Text>
                      </View>
                      <Text style={{ color: "#b58904", marginTop: 10 }}>
                       {t("view_details")}
                      </Text>
                    </View>
                  </Pressable>
                  
                  {isShopOwner && (
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "rgba(0,0,0,0.7)",
                        borderRadius: 15,
                        padding: 6,
                      }}
                      onPress={() => {
                        navigation.navigate("EditShopProduct", {
                          productId: product._id,
                          product: product,
                          shopId: shopId,
                          onProductUpdated: () => fetchShopProducts(),
                        });
                      }}
                    >
                      <MaterialIcon name="edit" size={16} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>

          <TouchableOpacity
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: "5%",
              width: "100%",
              marginBottom: "10%",
            }}
          >
            <Pressable
              onPress={() => {
                navigation.navigate("AllProducts", {
                  // userType: shop.owner.userType,
                  // ownerId: shop.owner._id,
                  shopId: shopId,
                });
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  letterSpacing: 0.5,
                  color: Theme.themeColor,
                  textAlign: "center",
                  textDecorationLine: "underline",
                }}
              >
                {t("viewMoreProducts")}
              </Text>
            </Pressable>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </Container>
  );
};

export default EachShopProfile;

const style = StyleSheet.create({
  Aboutus: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
    color: "#141414",
  },
  ImageStyle: {
    width: "100%",
    height: 250,
    borderRadius: 20,
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
    marginTop: 5,
    marginBottom: 5,
    color: "#7E7E7E",
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  contactDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 15,
  },
  contact: {
    fontSize: 13,
    fontWeight: "400",
    color: "#1C1C1C",
    marginLeft: 10,
    lineHeight: 20,
    width: "95%",
  },
  bottomBarContainer: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
    marginTop: 3,
    marginLeft: 20,
  },
  iconText: {
    marginTop: 4,
  },
});

export const styles = StyleSheet.create({
  oldPrice: {
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    opacity: 0.4,
    fontSize: 12,
  },
  eachJewelleryCard: {
    width: "45%",
    padding: "4%",
    marginBottom: "5%",
  },
  eachJewelleryCardImg: {
    width: "100%",
    height: 110,
    borderRadius: 4,
  },
  eachJewelleryCardFooter: {
    backgroundColor: Theme.themeColor,
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    padding: "3%",
  },
  eachJewelleryCardContainer: {
    marginTop: "4%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  shadowProp: {
    backgroundColor: "white",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1.41,
    elevation: 2,
  },
});

