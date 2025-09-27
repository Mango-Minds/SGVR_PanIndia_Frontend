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
import Theme from "../../styles/theme";
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
import apiClient from "../../store/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
//   import AssignForm from "./AssignForm";
import { useIsFocused } from "@react-navigation/native";

const WINDOW_WIDTH = Dimensions.get("window").width;
const WINDOW_HEIGHT = Dimensions.get("window").height;

const EachProduct = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { t } = useTranslation();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { productId, product } = route.params;
  const [loadingAnimation, setLoadingAnimation] = useState(true);

  const images = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQq1IkSrb16qU9WEDTasSrvxivdkmKo14IkhPdddU4ngzkvdZOJ3fsZ3apV5cGoy8hkbyQ&usqp=CAU",
    "https://i.pinimg.com/originals/6d/67/ea/6d67ea1f533c6fd08d355ea854c0b7f2.jpg",
  ];

  const changeSelectedImage = (index) => {
    setSelectedImageIndex(index);
  };

  const [productData, setProductData] = useState([]);

  // const fetchProduct = async () => {
  //   try {
  //     setLoadingAnimation(true);
  //     const response = await fetch(`${BASEAPIURL}/products/${productId}`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     setLoadingAnimation(false);

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log(" Product Data: ", data);

  //       setProductData(data);
  //     } else {
  //       throw new Error("Failed to fetch temple product");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching product:", error);
  //   }
  // };
  // const fetchProduct = async () => {
  //   try {
  //     setLoadingAnimation(true);
  //     const { data } = await apiClient.get(`/products/${productId}`);
  //      const selectedLanguage =
  //       (await AsyncStorage.getItem("user-language")) || "en";
  //     console.log("Product Data: ", data);
  //     setProductData(data);
  //   } catch (error) {
  //     console.error("Error fetching product:", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };
  const fetchProduct = async () => {
    try {
      setLoadingAnimation(true);
      const response = await apiClient.get(`/products/${productId}`);
      const selectedLanguage =
        (await AsyncStorage.getItem("user-language")) || "en";
      if (response.status === 200) {
        const productData = response.data;
        console.log("productData: ", productData);

        if (selectedLanguage !== "en" && Array.isArray(productData)) {
          const translationResponse = await apiClient.post("/translate", {
            data: productData,
            targetLang: selectedLanguage,
          });

          if (translationResponse?.data?.translatedData?.length) {
            setProductData(translationResponse.data.translatedData);
            console.log(
              "Translated response productData: ",
              translationResponse?.data
            );
          } else {
            setProductData(translationResponse.data.translatedData);
          }
          console.log("prodcutData 2: ", translationResponse.data.translatedData);
        } else {
          setProductData(productData);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoadingAnimation(false);
    }
  };
  useEffect(() => {
    if (isFocused) {
      fetchProduct();
    }
  }, [isFocused]);

  const token = useSelector((state) => state.user.token);

  // const deleteProduct = async () => {
  //   try {
  //     const response = await fetch(`${BASEAPIURL}/products/${productId}`, {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     if (!response.ok) {
  //       throw new Error("Failed to delete product");
  //     }

  //     Alert.alert(
  //       "Success",
  //       "Product deleted successfully",
  //       [
  //         {
  //           text: "OK",
  //           onPress: () => {
  //             // fetchProducts();
  //             navigation.goBack();
  //           },
  //         },
  //       ],
  //       { cancelable: false }
  //     );
  //   } catch (error) {
  //     console.error("Error deleting product:", error);
  //   }
  // };
  const deleteProduct = async () => {
    try {
      await apiClient.delete(`/products/${productId}`);

      Alert.alert(
       t("successTitle"),
  t("productDeletedSuccess"),
        [
          {
            text: t("oK"),
            onPress: () => navigation.goBack(),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };
  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));
  const fromVendorId = decodedPayload.id;

  const userType = useSelector((state) => state.user.user.userType);

  return (
    <Container
      style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
    >
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{
              color: Theme.themeColor,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            {t("productDetails")}
          </TopText>
        </View>

        {userType.includes("templeShopOwner") && (
          <>
            <IconButton
              icon="trash-can-outline"
              style={{ marginLeft: "auto" }}
              onPress={deleteProduct}
            />
            <IconButton
              icon="pencil-outline"
              onPress={() =>
                navigation.navigate("EditShopProduct", {
                  productId: productData._id,
                  product: productData,
                  fetchProduct: fetchProduct,
                  setProductData,
                })
              }
            />
          </>
        )}
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
                uri: `${productData.pictures[selectedImageIndex]}`,
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
                {t("productPictures")}
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {productData.pictures.map((image, index) => (
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
                        uri: `${productData.pictures[index]}`,
                      }}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <View style={{ flexDirection: "row" }}>
              <View style={styles.qq}>
                <Text style={styles.qqtxt}>
                  {t("quantity") + ": "} {productData.quantity}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row" }}>
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
                {t("aboutProduct")}
              </Text>
              <Text>{productData.description}</Text>
            </View>
          </View>
        )
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
    backgroundColor: Theme.themeColor,
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
    color: Theme.themeColor,
    margin: "1%",
  },
  qq: {
    margin: "3%",
    backgroundColor: "#f7f1d5",
    padding: "2%",
    borderRadius: 9,
  },
  qqtxt: {
    fontSize: 12,
    color: Theme.themeColor,
  },
  eachJewelleryCardFooter: {
    backgroundColor: Theme.themeColor,
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    padding: "3%",
  },
});
