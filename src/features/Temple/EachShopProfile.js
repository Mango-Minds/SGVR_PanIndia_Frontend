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
import BottomNavigation from "./BottomNavigation";
import apiClient from "../../store/apiClient";
import { useTranslation } from "react-i18next";
const EachShopProfile = ({ route }) => {
  const token = useSelector((state) => state.user.token);
 
 const { t } = useTranslation();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [shopProducts, setShopProducts] = useState([]);

  const { shop, shopId } = route.params;
  console.log("each shop profile screen", shop);
  console.log("Shopid: ", shopId);
  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));
  const fromVendorId = decodedPayload.id;

 const userType = useSelector((state) => state.user.user.userType[0]);

  
  

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
  
      console.log("Fetched shop:", response.data);
      console.log("Products for logged-in worker:", shopProducts);
    } catch (error) {
      console.error("Error fetching shop:", error);
    }
  };
  
  const fetchShopProducts = async () => {
    try {
      const response = await apiClient.get("/products");
  
      const filteredProducts = response.data.filter(
        (product) => product.shop._id === shopId
      );
  
      setShopProducts(filteredProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsloading(false);
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
    }
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
        {userType === "templeAdmin" || userType === "SA" && (
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
               shop: shop,
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
          <Image
            source={
              shop.image
                ? {
                  uri: `${shop.image}`,
                }
                : UserImg
            }
            style={style.ImageStyle}
            resizeMode="contain"
          />
          <View style={{ flexDirection: "column" }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                opacity: 0.8,
                marginTop: "3%",
              }}
            >
              {shop.name}
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
              <Text style={style.description}>{shop.description}</Text>
            </View>
            <View>
              <View style={style.contactDetails}>
                <MaterialIcon name="email" size={18} color={Theme.themeColor}/>
                <Text style={style.contact}>{shop.owner.id?.email}</Text>
              </View>
              <View style={style.contactDetails}>
                <MaterialIcon name="phone" size={18} color={Theme.themeColor} />
                <Text style={style.contact}>{shop.owner.id?.phone}</Text>
              </View>
              <View style={[style.contactDetails, { marginBottom: 20 }]}>
                <MaterialIcon name="location-on" size={18} color={Theme.themeColor} />
                <Text style={style.contact}>
                  {shop?.address}, {shop?.city}
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
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            style={{
              borderBottomColor:Theme.themeColor,
              borderBottomWidth: 2,
              paddingVertical: 5,
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
      <BottomNavigation navigation={navigation} />
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
