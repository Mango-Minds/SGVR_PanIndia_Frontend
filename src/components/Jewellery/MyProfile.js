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
import BannerImg from "../../assets/images/general/golden_banner.png";


const MyJewelleryProfile = ({ route }) => {
  const navigation = useNavigation();
 
  const connectedWorkers = route.params?.connectedWorkers || [];
  const connectedShops = route.params?.connectedShops || [];
  const userType = useSelector((state) => state.user.user.userType);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const token = useSelector((state) => state.user.token);
 
  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));
  console.log("decoded payload", decodedPayload);

  
  const user = useState(useSelector((state) => state.user.user));
  console.log("userrr", user)
  const userId = useSelector(
    (state) =>
      state.user.user &&
    state.user.user.roleData &&
    state.user.user.roleData.owner
  );
  const vendorId = user[0].roleData._id;

  const heading =
    userType === "vendor"
      ? "Vendor Details"
      : userType === "worker"
      ? "Worker Details"
      : "Store Name";

  useEffect(() => {
    fetchVendors();
    fetchWorkers();
    fetchShops();
    fetchDesigners();
    fetchGemologists();
  }, []);

  const [vendors, setVendors] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [shops, setShops] = useState([]);

  const fetchShops = async () => {
    try {
      const response = await fetch(`${BASEAPIURL}/shop`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });


      if (response.ok) {
        const data = await response.json();
        setShops(data);
      } else {
        throw new Error("Failed to fetch workers");
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };
  const fetchVendors = async () => {
    try {
      const response = await fetch(`${BASEAPIURL}/vendor`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      } else {
        throw new Error("Failed to fetch vendors");
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };
  const fetchWorkers = async () => {
    try {
      const response = await fetch(`${BASEAPIURL}/worker`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkers(data);
      } else {
        throw new Error("Failed to fetch workers");
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    console.log("inside fetch products")
    try {
      let apiUrl = `${BASEAPIURL}/jewelry-products?`;

      if (userType === "vendor") {
        apiUrl += `vendors=["${vendorId}"]`;
      } else if (userType === "shop") {
        apiUrl += `shops=["${vendorId}"]`;
      } else if (userType === "worker") {
        apiUrl += `workers=["${vendorId}"]`;
      }
      console.log("apiurl",apiUrl);
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("res",response);

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to fetch products: ${errorMessage}`);
      }

      const data = await response.json();
      console.log("data.data", data.data)
      setProducts(data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }; 
  useEffect(() => {
    if (isFocused) {
      fetchProducts();
      fetchUser();
    }
  }, [isFocused]);

  const limitedProducts = products.slice(0, 4);
  const [loadingAnimation, setLoadingAnimation] = useState(true);

  const [userData, setUserData] = useState({});
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
        console.log("userdata", data);
      } else {
        throw new Error("Failed to fetch user");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoadingAnimation(false); // End loading
    }
  };

  const [gemologists, setGemologists] = useState([]);

  const fetchGemologists = async () => {
    try {
      const response = await fetch(`${BASEAPIURL}/gemologist`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetch Gemologists Data: ", data);
        setGemologists(data);
      } else {
        throw new Error("Failed to fetch Gemologists");
      }
    } catch (error) {
      console.error("Error fetching Gemologists:", error);
    }
  };
  const [designers, setDesigners] = useState([]);

  const fetchDesigners = async () => {
    try {
      const response = await fetch(`${BASEAPIURL}/jewelryDesigner`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetch Designers Data: ", data);
        setDesigners(data);
      } else {
        throw new Error("Failed to fetch Designers");
      }
    } catch (error) {
      console.error("Error fetching Designers:", error);
    }
  };


  // const loggedInVendorId = user?.roleData?._id;
  const loggedInId = useSelector(
    (state) => state.user.user && state.user.user.roleData._id
  );

  const loggedInVendor = vendors.find((vendor) => vendor._id === loggedInId);
  console.log("loggedInVendor", loggedInVendor);

  const loggedInShop = shops.find((shop) => shop._id === loggedInId);
  console.log("loggedInShop", loggedInShop);

  const loggedInWorker = workers.find((worker) => worker._id === loggedInId);
  console.log("loggedInWorker", loggedInWorker);

  const loggedInGemologist = gemologists.find((gemologist) => gemologist._id === loggedInId);
  console.log("loggedInGemologist", loggedInGemologist);

  const loggedInDesigner = designers.find((designer) => designer._id === loggedInId);
  console.log("loggedInDesigner", loggedInDesigner);
  
 
  
  const getProfileImage = () => {
    if (
      userType === "vendor" &&
      loggedInVendor &&
      loggedInVendor.profileimages
    ) {
      return { uri: `${BASEIMGURL}${loggedInVendor.profileimages}` };
    } else if (
      userType === "shop" &&
      loggedInShop &&
      loggedInShop.profileimages
    ) {
      return { uri: `${BASEIMGURL}${loggedInShop.profileimages}` };
    } else if (
      userType === "worker" &&
      loggedInWorker &&
      loggedInWorker.profileimages
    ) {
      return { uri: `${BASEIMGURL}${loggedInWorker.profileimages}` };
    }
    else if (
      userType === "gemologist" &&
      loggedInGemologist &&
      loggedInGemologist.profileImage
    ) {
      return { uri: `${BASEIMGURL}${loggedInGemologist.profileImage}` };
    } 
    else if (
      userType === "jewelryDesigner" &&
      loggedInDesigner &&
      loggedInDesigner.profileImage
    ) {
      return { uri: `${BASEIMGURL}${loggedInDesigner.profileImage}` };
    }
    else {
      return BannerImg;
    }
  };

  return (
    <>
      {/* {loadingAnimation === true ? (
            <ActivityIndicator
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
              size={"large"}
              color={"#b98c13"}
            />
          ) : ( */}
      {userData && userData.user && (
        <View
          style={{
            paddingHorizontal: 20,
            flex: 1,
          }}
        >
          <ImageBackground
            source={getProfileImage()}
            style={style.backgroundImage}
          >
            <View style={style.profileContainer}>
              <Image
                source={
                  userData.user.image
                    ? {
                        uri: `${BASEIMGURL}${userData.user.image}`,
                      }
                    : UserImg
                }
                style={style.profileImage}
              />
            </View>
          </ImageBackground>
          <View style={style.whiteContainer}>
            <Text style={style.loginText}>
              {userType === "vendor" && loggedInVendor && (
                <Text key={loggedInVendor._id}>
                  <Text style={style.ownerName}>{loggedInVendor.username}</Text>
                </Text>
              )}
              
              {userType === "gemologist" && loggedInGemologist && (
                <Text key={loggedInGemologist._id}>
                  <Text style={style.ownerName}>{loggedInGemologist.username}</Text>
                </Text>
              )}
              {userType === "jewelryDesigner" && loggedInDesigner && (
                <Text key={loggedInDesigner._id}>
                  <Text style={style.ownerName}>{loggedInDesigner.username}</Text>
                </Text>
              )}
              
              {userType === "shop" && loggedInShop && (
                <Text key={loggedInShop._id}>
                  <Text style={style.ownerName}>{loggedInShop.shopName}</Text>
                </Text>
              )}
              {userType === "worker" && loggedInWorker && (
                <Text key={loggedInWorker._id}>
                  <Text style={style.ownerName}>
                    {loggedInWorker.worker_name}
                  </Text>
                </Text>
              )}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "column",
              marginTop: 60,
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#D4AF37",
              }}
            >
              About Us :
            </Text>
            <Text style={style.description}>
              {userType === "vendor" && loggedInVendor && (
                <Text key={loggedInVendor._id}>
                  <Text style={style.description}>{loggedInVendor.about}</Text>
                </Text>
              )}
              {userType === "gemologist" && loggedInGemologist && (
                <Text key={loggedInGemologist._id}>
                  <Text style={style.description}>{loggedInGemologist.certifications}</Text>
                </Text>
              )}
              {userType === "jewelryDesigner" && loggedInDesigner && (
                <Text key={loggedInDesigner._id}>
                  <Text style={style.description}>{loggedInDesigner.specialty}</Text>
                </Text>
              )}
              {userType === "shop" && loggedInShop && (
                <Text key={loggedInShop._id}>
                  <Text style={style.description}>
                    {loggedInShop.description}
                  </Text>
                </Text>
              )}
              {userType === "worker" && loggedInWorker && (
                <Text key={loggedInWorker._id}>
                  <Text style={style.description}>
                    {loggedInWorker.description}
                  </Text>
                </Text>
              )}
            </Text>
          </View>
          <Divider />
          <View style={style.contactDetails}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#D4AF37",
              }}
            >
              Owner Details :
            </Text>
            <Text style={style.contact}>
              {userData.user.firstName} {userData.user.lastName}
            </Text>
          </View>
          <View style={style.contactDetails}>
            <MaterialIcon name="email" size={18} color="#D4AF37" />
            <Text style={style.contact}>{userData.user.email}</Text>
          </View>
          <View style={style.contactDetails}>
            <MaterialIcon name="phone" size={18} color="#D4AF37" />
            <Text style={style.contact}>{userData.user.phone}</Text>
          </View>
          <View style={style.contactDetails}>
            <MaterialIcon name="location-on" size={18} color="#D4AF37" />
            <Text style={style.contact}>{userData.user.address}</Text>
          </View>

          <View style={style.contactDetails}>
            <TouchableOpacity
              style={style.EditButton}
              onPress={() =>
                navigation.navigate("EditJewelleryUserRegisterScreen", {
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
          <View style={style.contactDetails}>
            <TouchableOpacity
              style={style.EditButton}
              onPress={() =>
                navigation.navigate("EditJewelleryRoleRegister", {
                  userData,
                  fetchUser,
                  userId,
                  user,
                  vendors,
                  setVendors,
                  loggedInVendor,
                  loggedInWorker,
                  loggedInShop,
                  loggedInId,
                  fetchVendors,
                  fetchShops,
                  fetchWorkers,
                  gemologists,
                  loggedInGemologist,
                  fetchGemologists,
                  loggedInDesigner,
                  designers,
                  fetchDesigners,
                })
              }
            >
              <Text style={style.EditButtonText}>
                {userType === "vendor"
                  ? "Edit Vendor Profile"
                  : userType === "shop"
                  ? "Edit Shop Profile"
                  : userType === "worker"
                  ? "Edit Worker Profile"
                  : userType === "jewelryDesigner"
                  ? "Edit Designer Profile"
                  : userType === "gemologist"
                  ? "Edit Gemologist Profile"
                 
                  : "Edit Profile"}
              </Text>
            </TouchableOpacity>
          </View>
          <Divider />
        </View>
      )}
      {userType !== "gemologist" && userType !== "jewelryDesigner" && (
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
          {limitedProducts.map((product, index) => (
            <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
              <Pressable
                key={index}
                onPress={() => {
                  navigation.navigate("EachProduct", {
                    productId: product._id,
                    product: product,
                    connectedShops: connectedShops,
                    connectedWorkers: connectedWorkers,
                  });
                }}
              >
                <Image
                  style={styles.eachJewelleryCardImg}
                  source={{ uri: `${BASEIMGURL}${product.images[0]}` }}
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
            navigation.navigate("EachShopAllProducts", {
              userType: userData.user.userType,
              ownerId: userData.user.roleData._id,
              connectedShops: connectedShops,
              connectedWorkers: connectedWorkers,
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
      
      
      
      {/* {userType === "shop" && (
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
              onPress={() => setScreen("Product")}
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
              {loggedInShop.jewelryProducts.map((product, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    navigation.navigate("EachProduct", {
                      productId: product._id,
                      product: product,
                      connectedShops: connectedShops,
                      connectedWorkers: connectedWorkers,
                    });
                  }}
                >
                  <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                    <Image
                      style={styles.eachJewelleryCardImg}
                      source={{ uri: `${BASEIMGURL}${product.images[0]}` }}
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
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
         
        </>
      )} */}
    </>
  );
};

export default MyJewelleryProfile;

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
    textAlign:"center"
  },
  whiteContainer:{
    display:"flex",
    alignItems:"center",
    justifyContent:"center"
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
