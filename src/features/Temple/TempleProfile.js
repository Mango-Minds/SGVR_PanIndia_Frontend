import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
  ImageBackground,
} from "react-native";
import { TopText } from "../../styles/social.styles";
import { RowBetween } from "../../styles/common.styles";
import { IconButton } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Divider } from "react-native-paper";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { BASEAPIURL } from "../../infrastructure/constants";
import { BASEIMGURL } from "../../infrastructure/constants";
import { styles } from "../../features/jewellery/JewelleryMainScreen";
import { decode } from "base-64";
import ActivityIndicator from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import UserImg from "../../assets/images/general/user.png";
import BottomNavigation from "./BottomNavigation";

const MyTempleProfile = ({ route }) => {
  const {pandits, fetchPandits} = route.params;
  console.log("Pandits in profile: ", pandits);
  const navigation = useNavigation();
  const userType = useSelector((state) => state.user.user.userType);

  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));
  const user = useState(useSelector((state) => state.user.user));
  console.log("User: ", user);

  const userId = decodedPayload.id;

  const [userData, setUserData] = useState({});

  // Access templeId correctly
  const templeDetails = user[0];

  const templeId = templeDetails?.roleData?.temple;

  const fetchUser = async () => {
    try {
      setLoadingAnimation(true);
      const response = await fetch(`${BASEAPIURL}/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        setUserData(data);
        console.log("data.user", data.user);
      } else {
        throw new Error("Failed to fetch user");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoadingAnimation(false);
    }
  };

  const [shopData, setShopData] = useState([]);

  const fetchShops = async () => {
    try {
      setLoadingAnimation(true);
      const response = await fetch(`${BASEAPIURL}/templeShops`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("fetch Shop Data: ", data);
        setShopData(data);
        const loggedInShopUser = data.find(
          (shop) =>
            (shop.owner && shop.owner.id?._id === userId) || shop.owner === userId
        );
      const loggedInShopId = loggedInShopUser ? loggedInShopUser._id : null;
        fetchProducts(loggedInShopId);
      } else {
        throw new Error("Failed to fetch shops");
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
    } finally {
      setLoadingAnimation(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchShops();
    }
  }, [isFocused]);

  console.log("ShopData: ", shopData);
  const loggedInShop = shopData.find(
    (shop) =>
      (shop.owner && shop.owner.id?._id === userId) || shop.owner === userId
  );

  console.log("Loggedinshop data: ", loggedInShop);

  const shopId = loggedInShop ? loggedInShop._id : null;

  const heading =
    userType === "templeAdmin"
      ? "Edit Temple Admin Profile"
      : userType === "templeShopOwner"
      ? "Edit Shop Profile"
      : userType === "pandit"
      ? "Edit Pandit Profile"
      : "Edit Profile";

  const [products, setProducts] = useState([]);

  const fetchProducts = async (loggedInShopId) => {
    try {
      const response = await fetch(`${BASEAPIURL}/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        const filteredProducts = data.filter(
          (product) => product.shop._id === loggedInShopId
        );

        setProducts(filteredProducts);
      } else {
        throw new Error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsloading(false);
    }
  };
  
  useEffect(() => {
    if (isFocused) {
      fetchUser();
    }
  }, [isFocused]);

  const limitedProducts = products.slice(0, 4);
  const [loadingAnimation, setLoadingAnimation] = useState(true);

  const getProfileImage = () => {
    if (userType === "templeShopOwner" && loggedInShop && loggedInShop.image) {
      return { uri: `${BASEIMGURL}${loggedInShop.image}` };
    } else {
      return UserImg;
    }
  };

  const loggedInId = useSelector(
    (state) => state.user.user && state.user.user.roleData._id
  );

  const loggedInPandit = pandits.find((pandit) => pandit._id === loggedInId);
  console.log("loggedInPandit: ", loggedInPandit);



  return (
    <>
      {userData && userData.user && (
        <View
          style={{
            paddingHorizontal: 20,
            flex: 1,
          }}
        >
          <ImageBackground
          source={
            userData.user.image
              ? {
                  uri: `${BASEIMGURL}${userData.user.image}`,
                }
              : UserImg
          }
            // source={getProfileImage()}
            style={style.backgroundImage}
            resizeMode="contain"

          >
            {userData.user.role === 'templeShopOwner' && (
            <View style={style.profileContainer}>
            
          <Image
            source={getProfileImage()}
            style={style.profileImage}
          />
      
            </View>
              )}
          </ImageBackground>
          <View style={style.whiteContainer}>
            {userType === "templeShopOwner" && loggedInShop && (
              <Text key={loggedInShop._id}>
                <Text style={style.loginText}>{loggedInShop.name}</Text>
              </Text>
            )}
          </View>

          <View style={style.contactDetails}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#D4AF37",
                bottom: -30,
              }}
            >
              Owner Details
            </Text>
          </View>

          <View style={style.nameDetails}>
            <MaterialIcon name="people" size={18} color="#D4AF37" />
            <Text style={style.contact}>
              {userData.user.firstName} {userData.user.lastName}
            </Text>
          </View>

          <View style={style.contactDetails}>
            <MaterialIcon name="email" size={18} color="#D4AF37" />
            <Text style={style.contact}>{userData.user.email}</Text>
          </View>

          <View style={style.phoneDetails}>
            <MaterialIcon name="phone" size={18} color="#D4AF37" />
            <Text style={style.contact}>{userData.user.phone}</Text>
          </View>

          <View style={style.phoneDetails}>
            <MaterialIcon name="location-on" size={18} color="#D4AF37" />
            <Text style={style.contact}>{userData.user.address}</Text>
          </View>

          <View style={style.contactButtonDetails}>
            <TouchableOpacity
              style={style.EditButton}
              onPress={() =>
                navigation.navigate("EditProfile", {
                  userData,
                  fetchUser,
                  userId,
                  user,
                })
              }
            >
              <Text style={style.EditButtonText}>Edit My Profile</Text>
            </TouchableOpacity>
          </View>
          <View style={style.contactButtonDetails}>
            {/* {(userType === "templeShopOwner" ) && ( */}
            {(userType === "templeShopOwner" || userType === "pandit") && (
              <TouchableOpacity
                style={style.EditButton}
                onPress={() => {
                  navigation.navigate("EditRoleProfile", {
                    userData,
                    fetchUser,
                    userId,
                    user,
                    shopId: shopId,
                    shopData: shopData,
                    loggedInShop: loggedInShop,
                    fetchShops,
                    templeId: templeId,
                    loggedInPandit: loggedInPandit,
                    fetchPandits: fetchPandits,
                  });
                }}
              >
                <Text style={style.EditButtonText}>{heading}</Text>
              </TouchableOpacity>
            )}
            {userType === "pandit" && (
              <TouchableOpacity
                style={style.EditButton}
                onPress={() => {
                  navigation.navigate("PanditSpecificTempleList", {
                    userData,
                    fetchUser,
                    userId,
                    user,
                    shopId: shopId,
                    shopData: shopData,
                    loggedInShop: loggedInShop,
                    fetchShops,
                    templeId: templeId,
                  });
                }}
              >
                <Text style={style.EditButtonText}>View Your Temples</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      <Divider />

      {userType === "templeShopOwner" && (
        <>
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
              {limitedProducts.map((product) => (
                <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                  <Pressable
                    key={product._id}
                    onPress={() => {
                      navigation.navigate("EachProduct", {
                        productId: product._id,
                      });
                    }}
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
                  userId: userId,
                  shopId: shopId,
                  loggedInShop: loggedInShop,
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
        </>
      )}
    </>
  );
};

export default MyTempleProfile;

const style = StyleSheet.create({
  ProfileHeading: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 15,
    color: "#141414",
    letterSpacing: 0.3,
  },
  ImageStyle: {
    width: "100%",
    height: 250,
    borderRadius: 20,
    marginTop: 20,
  },
  Aboutus: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
    color: "#141414",
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
  ownerdetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 15,
  },
  ownerhead: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 20,
    marginBottom: 5,
    color: "#D4AF37",
  },
  ownerName: {
    fontSize: 20,
    fontWeight: "500",
    marginTop: 20,
    color: "#D4AF37",
    textAlign: "center",
  },
  whiteContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  contactDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 35,
  },
  phoneDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 5,
  },
  contactButtonDetails: {
    flexDirection: "column",
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
  },
  nameDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 35,
    marginBottom: -30,
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
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: "100%",
    height: 350,
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
    bottom: -50,
  },
  loginText: {
    color: "black",
    bottom: -50,
    position: "relative",
    fontSize: 20,
    fontWeight: "500",

    color: "#D4AF37",
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "lightgrey",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  loginButtonText: {
    fontSize: 16,
    color: "black",
  },
});

// const style = StyleSheet.create({
//   ProfileHeading: {
//     fontSize: 20,
//     fontWeight: "600",
//     marginTop: 10,
//     marginBottom: 15,
//     color: "#141414",
//     letterSpacing: 0.3,
//   },
//   ImageStyle: {
//     width: "100%",
//     height: 250,
//     borderRadius: 20,
//     marginTop: 20,
//   },
//   Aboutus: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginTop: 15,
//     marginBottom: 5,
//     color: "#141414",
//   },
//   description: {
//     fontSize: 14,
//     fontWeight: "400",
//     marginTop: 5,
//     marginBottom: 5,
//     color: "#7E7E7E",
//     letterSpacing: 0.3,
//     lineHeight: 20,
//   },
//   ownerdetails: {
//     flexDirection: "row",
//     justifyContent: "flex-start",
//     alignItems: "center",
//     marginTop: 15,
//     marginBottom: 15,
//   },
//   ownerhead: {
//     fontSize: 14,
//     fontWeight: "500",
//     marginTop: 20,
//     marginBottom: 5,
//     color: "#D4AF37",
//   },
//   ownerName: {
//     fontSize: 20,
//     fontWeight: "500",
//     marginTop: 20,
//     color: "#D4AF37",
//     textAlign: "center",
//   },
//   whiteContainer: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   contactDetails: {
//     flexDirection: "row",
//     justifyContent: "flex-start",
//     alignItems: "center",
//     marginTop: 35,
//   },
//   phoneDetails: {
//     flexDirection: "row",
//     justifyContent: "flex-start",
//     alignItems: "center",
//     marginTop: 5,
//   },
//   contactButtonDetails: {
//     flexDirection: "column",
//     justifyContent: "flex-start",
//     alignItems: "center",
//     marginTop: 15,
//   },
//   contact: {
//     fontSize: 13,
//     fontWeight: "400",
//     color: "#1C1C1C",
//     marginLeft: 10,
//     lineHeight: 20,
//   },
//   contactName: {
//     bottom: -30,
//     fontSize: 13,
//     fontWeight: "400",
//     color: "#1C1C1C",
//     marginLeft: 10,
//     lineHeight: 20,
//   },
//   EditButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#D4AF3733",
//     borderRadius: 10,
//     width: "100%",
//     padding: "3%",
//     marginVertical: 10,
//   },
//   EditButtonText: {
//     color: "#D4AF37",
//     fontSize: 16,
//     fontWeight: "500",
//     letterSpacing: 0.5,
//   },
//   container: {
//     flex: 1,
//   },
//   backgroundImage: {
//     width: "100%",
//     height: 350,
//     justifyContent: "flex-end",
//     alignItems: "center",
//   },
//   profileContainer: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     overflow: "hidden",
//     position: "absolute",
//     bottom: -50,
//     alignItems: "center",
//     justifyContent: "center",
//     borderColor: "white",
//     borderWidth: 3,
//   },
//   profileImage: {
//     width: "100%",
//     height: "100%",
//   },
//   whiteContainer: {
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     bottom: -50,
//   },
//   loginText: {
//     color: "black",
//     bottom: -50,
//     position: "relative",
//     fontSize: 20,
//     fontWeight: "500",

//     color: "#D4AF37",
//     textAlign: "center",
//   },
//   loginButton: {
//     backgroundColor: "lightgrey",
//     paddingVertical: 10,
//     paddingHorizontal: 40,
//     borderRadius: 5,
//   },
//   loginButtonText: {
//     fontSize: 16,
//     color: "black",
//   },
// });
