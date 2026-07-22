import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  Pressable,
  ImageBackground,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Container, RowBetween } from "../../styles/common.styles";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { IconButton, Divider } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./JewelleryMainScreen";
import { ScrollView } from "react-native-gesture-handler";
import { BASEAPIURL } from "../../infrastructure/constants";
import { BASEIMGURL } from "../../infrastructure/constants";
import UserImg from "../../assets/images/general/user.png";
import BannerImg from "../../assets/images/general/golden_banner.png";

import BottomNavigation from "../../components/Jewellery/BottomNavigation";
import { useIsFocused } from "@react-navigation/native";

const EachVendor = ({ route }) => {
  const { vendorId, handleVendorConnect } = route.params;
  const fromVendor = route.params.vendor;
  const vendorUserId = fromVendor.owner._id;

  const token = useSelector((state) => state.user.token);
  const { user } = useSelector((state) => state.user);
  console.log("userrrrrrrrr", user)
  const isFocused = useIsFocused();

  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [vendor, setVendor] = useState({});
  useEffect(() => {
    const fetchProducts = async (vendorId) => {
      try {
        console.log("Vendor id: ", vendorId);
        const response = await fetch(
          `${BASEAPIURL}/jewelry-products?vendors=["${fromVendor._id}"]`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Failed to fetch products: ${errorMessage}`);
        }

        const data = await response.json();
        const limitedProducts = data.data.slice(0, 4);

        setProducts(limitedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts(vendorId);
  }, [vendorId, isFocused]);

  const [userData, setUserData] = useState({});
  const fetchUser = async () => {
    try {
      // setLoadingAnimation(true);
      const response = await fetch(`${BASEAPIURL}/user/${vendorUserId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("User Data: ", data);

        setVendor(data.user);
        setUserData(data);
      } else {
        throw new Error("Failed to fetch user");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
    }
  };
  useEffect(() => {
    fetchUser();
  }, [isFocused]);

  const handleMessagePress = () => {
    const conversationId = [user._id, vendorUserId].sort().join("_");
    const toName =
      `${vendor?.firstName || ""} ${vendor?.lastName || ""}`.trim() ||
      vendor?.roleData?.username ||
      "Vendor";
    navigation.navigate("ChatScreen", {
      toid: vendorUserId,
      toName,
      index: 0,
      conversationId,
    });
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
          <Text style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}>
            Vendor Details
          </Text>
        </View>
        <TouchableOpacity
          style={style.chatButton}
          onPress={handleMessagePress}
        >
          <IconButton icon="chat" size={30}></IconButton>

          {/* <Text style={style.chatButtonText}>Chat</Text> */}
        </TouchableOpacity>
      </RowBetween>
      {vendor && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{ padding: "3%", marginTop: "2%", flexDirection: "column" }}
          >
            <ImageBackground
              source={
                vendor.roleData?.profileimages
                  ? { uri: `${BASEIMGURL}${vendor.roleData.profileimages}` }
                  : BannerImg
              }
              style={style.backgroundImage}
            >
              <View style={style.profileContainer}>
                <Image
                  source={
                    vendor?.image
                      ? { uri: `${BASEIMGURL}${vendor.image}` }
                      : UserImg
                  }
                  style={style.profileImage}
                />
              </View>
            </ImageBackground>

            <View style={style.whiteContainer}>
              <Text style={style.loginText}>
                <Text style={style.ownerName}>
                  {vendor?.roleData?.username || "Vendor Name"}
                </Text>
              </Text>
            </View>

            <View style={{ flexDirection: "column" }}>
              <View
                style={{
                  flexDirection: "column",
                  marginTop: 60,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "#D4AF37" }}
                >
                  About Us :
                </Text>
                <Text style={style.description}>
                  {vendor?.roleData?.about || "No description available"}
                </Text>
              </View>
              <Divider />

              <View style={style.contactDetails}>
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "#D4AF37" }}
                >
                  Owner Details :
                </Text>
                <Text style={style.contact}>
                  {vendor?.firstName} {vendor?.lastName}
                </Text>
              </View>

              <View>
                <View style={style.contactDetails}>
                  <MaterialIcon name="email" size={18} color="#D4AF37" />
                  <Text style={style.contact}>{vendor?.email || "N/A"}</Text>
                </View>

                <View style={style.contactDetails}>
                  <MaterialIcon name="phone" size={18} color="#D4AF37" />
                  <Text style={style.contact}>{vendor?.phone || "N/A"}</Text>
                </View>

                <View style={[style.contactDetails, { marginBottom: 20 }]}>
                  <MaterialIcon name="location-on" size={18} color="#D4AF37" />
                  <Text style={style.contact}>
                    {vendor?.address || ""}{" "}
                    {vendor?.address && vendor?.city && ","}{" "}
                    {vendor?.city || ""}
                  </Text>
                </View>

                {user?.userType === "superadmin" && (
                  <TouchableOpacity
                    style={style.EditButton}
                    onPress={() =>
                      navigation.navigate("EditJewelleryUserRegisterScreen", {
                        userData,
                        user,
                        userId: vendorUserId,
                      })
                    }
                  >
                    <Text style={style.EditButtonText}>Edit Profile</Text>
                  </TouchableOpacity>
                )}
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
                  borderBottomColor: "#D4AF37",
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
                    color: "#D4AF37",
                  }}
                >
                  Our Catalog
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ padding: "2.5%", paddingTop: "1%" }}>
              <View style={styles.eachJewelleryCardContainer}>
                {products?.map((product, index) => (
                  <View
                    key={index}
                    style={[styles.shadowProp, styles.eachJewelleryCard]}
                  >
                    <Pressable
                      onPress={() => {
                        navigation.navigate("EachProduct", {
                          productId: product._id,
                          product: product,
                          handleVendorConnect : handleVendorConnect ,
                        });
                      }}
                    >
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{ uri: `${BASEIMGURL}${product.images[0]}` }}
                      />
                      <View style={{ marginLeft: "2%", marginTop: "5%" }}>
                        <Text style={{ fontWeight: "700", fontSize: 14 }}>
                          {product?.name}
                        </Text>
                        <View style={{ marginTop: "3%", flexDirection: "row" }}>
                          <Text
                            style={{
                              opacity: 0.5,
                              marginLeft: "0%",
                              fontSize: 13,
                            }}
                          >
                            ₹{product?.price}
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
                  onPress={() => {
                    navigation.navigate("EachShopAllProducts", {
                      userType: vendor?.userType,
                      ownerId: vendor?.roleData?._id,
                      handleVendorConnect : handleVendorConnect ,
                    });
                  }}
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
            </View>
          </View>
        </ScrollView>
      )}

      <BottomNavigation navigation={navigation} />
    </Container>
  );
};

export default EachVendor;
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
    borderRadius: 10,
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
  EditButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D4AF3733",
    borderRadius: 10,
    width: "100%",
    padding: "3%",
    marginVertical: 10,
  },
  EditButtonText: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  backgroundImage: {
    width: "100%",
    height: 250,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  profileContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    position: "absolute",
    bottom: -50,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "white",
    borderWidth: 3,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  whiteContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 16,
    color: "black",
    bottom: -50,
    position: "relative",
  },
  ownerName: {
    fontSize: 20,
    fontWeight: "500",
    marginTop: 20,
    color: "#D4AF37",
    textAlign: "center",
  },

  chatButton: {
    marginLeft: "auto",
    marginRight: 10,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  sendRequestButton: {
    marginTop: 20,
    backgroundColor: "#D4AF37",
    padding: 10,
    borderRadius: 5,
  },
  sendRequestButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
  },
  closeButtonText: {
    color: "#D4AF37",
    fontWeight: "bold",
  },
});
