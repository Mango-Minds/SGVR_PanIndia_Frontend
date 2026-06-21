import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Pressable,
  Dimensions,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Row } from "../../styles/dashboard.styles";
import { ActivityIndicator, Divider, IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import { useNavigation } from "@react-navigation/native";

import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import { BASEAPIURL } from "../../infrastructure/constants";
import { decode } from "base-64";
import AssignForm from "./AssignForm";
import { BASEIMGURL } from "../../infrastructure/constants";
import { useIsFocused } from "@react-navigation/native";

const WINDOW_WIDTH = Dimensions.get("window").width;
const WINDOW_HEIGHT = Dimensions.get("window").height;

const EachProduct = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const images = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQq1IkSrb16qU9WEDTasSrvxivdkmKo14IkhPdddU4ngzkvdZOJ3fsZ3apV5cGoy8hkbyQ&usqp=CAU",
    "https://i.pinimg.com/originals/6d/67/ea/6d67ea1f533c6fd08d355ea854c0b7f2.jpg",
  ];

  const changeSelectedImage = (index) => {
    setSelectedImageIndex(index);
  };

  const {
    productId,
    product,
    connectedWorkers,
    connectedShops,
    toId,
    handleConnect,
    handleVendorConnect,
  } = route.params;
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  console.log("Product data through route params: ", product);
  const createdBy = product.createdBy;
  console.log("toId through route params: ", toId);
  console.log("createdBy: ", createdBy);
  const [products, setProducts] = useState([]);
  const { user } = useSelector((state) => state.user);
  console.log("User: ", user);
  const fromShopId = useSelector((state) => state.user.user?.roleData?._id);
  console.log("Fom shop Id: ", fromShopId);
  const token = useSelector((state) => state.user.token);

  // const [products, setProducts] = useState([]);
  const deleteProduct = async () => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/jewelry-products/${productId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      Alert.alert(
        "Success",
        "Product deleted successfully",
        [
          {
            text: "OK",
            onPress: () => {
              fetchProducts();
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/jewelry-products?vendors=["${fromVendorId}"]`,
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
      setProducts(data.data);
      console.log("Products: ", data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const [productData, setProductData] = useState({});
  console.log("ProductData: ", productData);

  const fetchProduct = async () => {
    try {
      setLoadingAnimation(true);
      const response = await fetch(
        `${BASEAPIURL}/jewelry-products/${productId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoadingAnimation(false);

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to fetch product: ${errorMessage}`);
      }

      const data = await response.json();
      console.log("Fetched Product:", data);
      setProductData(data.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchProduct();
    }
  }, [isFocused]);
  const [userData, setUserData] = useState({});
  // const toId = productData.createdBy;
  const fetchUserDetail = async () => {
    try {
      const response = await fetch(`${BASEAPIURL}/user/${createdBy}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Attempt to parse the error response if it's JSON
        const errorData = await response.json();
        throw new Error(`Failed to fetch user: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      setUserData(data.user);
      console.log("User data 1: ", data);
      console.log("User data: ", data.user);
      // console.log("User data id: ", data?.user?.roleData?._id);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
  useEffect(() => {
    fetchUserDetail();
  }, []);
  console.log("User data  userData: ", userData);

  console.log("User data id using userData: ", userData?.roleData?._id);
 
  const tokenPayload = token?.split(".")?.[1];
  const decodedPayload = tokenPayload ? JSON.parse(decode(tokenPayload)) : {};
  const userType = decodedPayload.userType;
  const fromVendorId = decodedPayload.id;
  console.log("from vendor id", fromVendorId);
  const userId = user?.roleData?._id;
  console.log("User id: ", userId);
  


  const handleBuyProductRequest = async () => {
    try {
      const fromId = userId;
      const toVendorId = userData?.roleData?._id;
      // const shopId = userData?.shopId;
      const isShop = userType === "shop";

      console.log("From ID (Your ID):", fromId);
      console.log("To Vendor ID (Target Vendor):", toVendorId);
      console.log("User Role:", userData?.role);

      // Vendor-to-vendor connection check
      if (!isShop) {
        console.log(
          "User is a Vendor, checking vendor-to-vendor connection..."
        );
        const isConnected = userData?.roleData?.listOfVendors.includes(fromId);

        console.log("Is Vendor Connected:", isConnected);
        console.log(
          "List of Connected Vendors:",
          userData?.roleData?.listOfVendors
        );

        if (!isConnected) {
          console.log("Not connected, sending a vendor connection request...");
          alert(
            "You are not connected to this vendor. Sending a connection request..."
          );

          // Send a vendor connection request
          await handleConnect(fromId, toVendorId);
          console.log("Ids for handleConnect: ", fromId, toVendorId);
        } else {
          console.log("Already connected, proceeding with buy request...");

          const payload = {
            fromId,
            fromType: userType === "vendor" ? "vendors" : userType,
            toVendorId,
            productId,
            quantity: 1,
          };

          const response = await fetch(`${BASEAPIURL}/buy/buy-request`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json();
          console.log("Response from Buy API:", data);

          // if (response.ok) {
          //   alert(data.msg);
          // } 
          if (response.ok) {
           alert(`Buy product request has been sent successfully to ${userData.firstName} ${userData.lastName}. Please wait for a while for a response.`);
        }else {
            alert(data.msg || "An error occurred.");
          }
        }
      } else {
        // Shop-to-vendor connection check
        console.log("User is a Shop, checking shop-to-vendor connection...");
        const isShopConnected =
        userData?.roleData?.listOfShops?.includes(fromId);

        console.log("Is Shop Connected to Vendor:", isShopConnected);
        console.log(
          "List of Connected shops by vendor:",
          // userData?.roleData?.listOfVendors,
          userData?.roleData?.listOfShops
        );
        console.log("From id: ", fromId);
         console.log("To vendor id: ", toVendorId);

        if (!isShopConnected) {
          console.log("Not connected, sending a shop connection request...");
          alert(
            "You are not connected to this vendor. Sending a connection request..."
          );
          console.log(
            "Ids for handleVendorConnect: ",
            fromShopId,
            toVendorId,
            userType
          );
          // Send a shop connection request
          const shopId = toVendorId;
          const vendorId = fromShopId;
          const createdBy = userType;

          await handleVendorConnect(shopId, vendorId, createdBy);

          console.log(
            "Ids for handleVendorConnect: ",
            shopId,
            vendorId,
            createdBy
          );
        } else {
          console.log(
            "Shop is connected to vendor, proceeding with buy request..."
          );

          const payload = {
            fromId,
            fromType: userType,
            toVendorId,
            productId,
            quantity:1,
          };

          const response = await fetch(`${BASEAPIURL}/buy/buy-request`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json();
          console.log("Response from Buy API:", data);

          if (response.ok) {
            alert(data.msg);
          } else {
            alert(data.msg || "An error occurred.");
          }
        }
      }
    } catch (error) {
      console.error("Error in Buy Product Request:", error.message);
      alert("Failed to create buy request. Please try again later.");
    }
  };

  return (
    <Container
      style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
    >
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
          >
            Product Details
          </TopText>
        </View>

        {((userType === "vendor" && productData.createdBy === fromVendorId) ||
          userType === "superadmin") && (
          <>
            <IconButton
              icon="trash-can-outline"
              style={{ marginLeft: "auto" }}
              onPress={deleteProduct}
            />
            <IconButton
              icon="pencil-outline"
              onPress={() =>
                navigation.navigate("EditRetailProduct", {
                  productId: productData._id,
                  product: productData,
                  fetchProduct: fetchProduct,
                  setProductData,
                })
              }
            />
          </>
        )}

        {/* <IconButton icon="bell-outline"></IconButton> */}
      </RowBetween>
      {loadingAnimation === true ? (
        <ActivityIndicator
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          size={"large"}
          color={"#b98c13"}
        />
      ) : (
        Object.keys(productData).length > 0 && (
          <View style={{ padding: "4%" }}>
            <Text style={{ fontWeight: "700", fontSize: 22, opacity: 0.8 }}>
              {productData.name}
            </Text>
            <Image
              style={{
                width: "100%",
                height: 240,
                marginTop: "4%",
                borderRadius: 5,
              }}
              source={{
                uri: `${BASEIMGURL}${productData.images[selectedImageIndex]}`,
              }}
            ></Image>
            <View style={{ marginTop: "4%" }}>
              <Text
                style={{
                  fontWeight: "700",
                  opacity: 1,
                  fontSize: 16,
                  marginBottom: "2%",
                }}
              >
                Product Pictures
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {productData.images.map((image, index) => (
                <View
                  style={{
                    margin: "3%",
                    marginHorizontal: 6,
                    borderWidth: 3,
                    flex: 1,
                    borderColor:
                      selectedImageIndex === index
                        ? "goldenrod"
                        : "transparent",
                    borderRadius: 7,
                    elevation: selectedImageIndex === index ? 5 : 0,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => changeSelectedImage(index)}
                    key={index}
                  >
                    <Image
                      style={{ width: 60, height: 60, borderRadius: 5 }}
                      source={{
                        uri: `${BASEIMGURL}${productData.images[index]}`,
                      }}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <View style={{ flexDirection: "row" }}>
              <View style={styles.qq}>
                <Text style={styles.qqtxt}>Quality: {productData.quality}</Text>
              </View>
              <View style={styles.qq}>
                <Text style={styles.qqtxt}>
                  Quantity: {productData.quantity}
                </Text>
              </View>
            </View>

            {/* <View style={{ flexDirection: "row" }}>
            <View style={styles.qq}>
              <Text style={styles.qqtxt}>Assigned To: </Text>
              {productData.workers.map((worker) => (
                <View key={worker.owner._id} style={styles.qq}>
                  <Text
                    style={styles.qqtxt}
                  >{`${worker.owner.firstName} ${worker.owner.lastName}`}</Text>
                </View>
              ))}
            </View>
          </View> */}

            <View style={{ flexDirection: "row" }}>
              {/* <Text style={styles.oldPrice}>₹52000</Text> */}
              <Text style={{ fontSize: 17, margin: "1%" }}>
                ₹{productData.price}
              </Text>
            </View>
            <View style={{ marginTop: "2%" }}>
              <Text
                style={{
                  fontWeight: "800",
                  opacity: 1.5,
                  fontSize: 16,
                  marginBottom: "3%",
                  color: "black",
                }}
              >
                About Product
              </Text>
              <Text>{productData.description}</Text>
            </View>
          </View>
        )
      )}
      {fromVendorId === productData.createdBy && (
        <>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <View
              style={{
                backgroundColor: "transparent",
                padding: "2%",
                borderWidth: 1,
                borderColor: "#D4AF37",
                height: 44.5,
                color: "red",
                width: "50%",
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("SellForm", {
                    productId: product._id,
                    product: product,
                    setProductData,
                    fetchProduct,
                    connectedShops: connectedShops,
                  })
                }
              >
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <Text
                    style={{
                      color: "#D4AF37",
                      fontSize: 18,
                      fontWeight: "700",
                    }}
                  >
                    Sell
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                backgroundColor: "transparent",
                padding: "2%",
                borderWidth: 1,
                borderColor: "#D4AF37",
                height: 44.5,
                color: "red",
                width: "50%",
                backgroundColor: "#D4AF37",
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("AssignForm", {
                    productId: product._id,
                    product: product,
                    fetchProduct,
                    connectedWorkers: connectedWorkers,
                  })
                }
              >
                <View
                  style={{
                    opacity: 0.8,
                    justifyContent: "center",
                    alignItems: "center",
                    // padding: "5%",
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 18, fontWeight: "700" }}
                  >
                    Assign
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {((userType === "vendor" && fromVendorId !== productData.createdBy) ||
        userType === "shop") && (
        <>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <View
              style={{
                backgroundColor: "transparent",
                padding: "2%",
                borderWidth: 1,
                borderColor: "#D4AF37",
                height: 44.5,
                color: "red",
                width: "100%",
                backgroundColor: "#D4AF37",
              }}
            >
              <TouchableOpacity onPress={handleBuyProductRequest}>
                <View
                  style={{
                    opacity: 0.8,
                    justifyContent: "center",
                    alignItems: "center",
                    // padding: "5%",
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 18, fontWeight: "700" }}
                  >
                    Buy
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </Container>
  );
};

export default EachProduct;

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    height: 50,
    left: 0,
    bottom: -2,
    width: WINDOW_WIDTH,
  },
  button: {
    backgroundColor: "#D4AF37",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    margin: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  oldPrice: {
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    opacity: 0.9,
    fontSize: 13,
    color: "#D4AF37",
    margin: "1%",
  },
  qq: {
    margin: "3%",
    marginLeft: 0,
    backgroundColor: "#f7f1d5",
    padding: "3%",
    borderRadius: 9,
  },
  qqtxt: {
    fontSize: 12,
    color: "#D4AF37",
  },
  eachJewelleryCardFooter: {
    backgroundColor: "#D4AF37",
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    padding: "3%",
  },
});
