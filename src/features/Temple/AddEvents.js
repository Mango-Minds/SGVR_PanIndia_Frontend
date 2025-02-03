import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import Theme from "../../styles/theme";
import { Picker } from "@react-native-picker/picker";
import { IconButton, Provider } from "react-native-paper";
import {
  FormButton,
  FormSection,
  MainContainer,
  Row,
  LoginInputField,
  LoginInputAreaField,
  AddProfileBox,
} from "../../styles/prelogin.styles";
import { SafeArea } from "../../components/utility/safe-area.component";
import SelectDropdown from "react-native-select-dropdown";
import { useDispatch } from "react-redux";
import { ErrorToggle, setLoadingInBtn } from "../../store/user";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { en, registerTranslation } from "react-native-paper-dates";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "react-query";
import { RowBetween } from "../../styles/common.styles";
import FormData from "form-data";
import { BASEAPIURL } from "../../infrastructure/constants";
import { decode } from "base-64";
// import DateTimePicker from "@react-native-community/datetimepicker";

const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
    // marginTop: "10%",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  input: {
    marginTop: 24,
    backgroundColor: "#F0F0F0",
    borderColor: "#E6E6E6",
    borderRadius: 4,
  },
  profileImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    resizeMode: "cover",
    marginBottom: 24,
  },
  dateView: {
    marginTop: 24,
    backgroundColor: "#f0f0f0",
    borderColor: "#e6e6e6",
    borderRadius: 4,
    height: 50,
    textTransform: "capitalize",
    width: "100%",
    // color:"black"
    fontSize: 18,
  },
});

export default function AddEvents({ navigation }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();
  const { loadingInBtn } = useSelector((state) => state.user);
  const [selectedImages, setSelectedImages] = React.useState([]);
  const [registerDetails, setRegisterDetails] = React.useState({
    productName: "",
    productPrice: "",
    productCategory: "",
    productCondition: "",
    productQuantity: "",
    productDescription: "",
    productQuality: "",
    pieces: "",
    productweight: "",
    goldAvailable: "",
  });

  console.log(registerDetails, "registerDetails");

  // const _pickDocument = async () => {
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 1,
  //     crop: true,
  //   });
  //   if (result.canceled === true) return;
  //   console.log(result, "sel");
  //   setSelectedImages((prev) => [...prev, result.assets[0]]);
  // };

  const _pickDocument = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (result.canceled === true) return;
    setSelectedImages((prev) => [...prev, result.assets[0]]);
  };

  const removeProfileImage = (index) => {
    let newArray = [...selectedImages];
    newArray.splice(index, 1);
    setSelectedImages(newArray);
  };
  const query = new useQueryClient();

  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));

  const userType = decodedPayload.userType;

  // const addProduct = async () => {
  //   try {
  //     if (!token) {
  //       console.error("Bearer token not found");
  //       return;
  //     }

  //     const response = await fetch(`${BASEAPIURL}/jewelry-products/`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         name: registerDetails.productName,
  //         price: parseFloat(registerDetails.productPrice),
  //         images: selectedImages.map((image) => image.uri),
  //         category: registerDetails.productCategory,
  //         description: registerDetails.productDescription,
  //         condition: registerDetails.productCondition,
  //         quantity: parseInt(registerDetails.productQuantity),
  //         quality: registerDetails.productQuality,
  //         weightPerProduct: parseFloat(registerDetails.productweight),
  //         goldAvailable: registerDetails.goldAvailable,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to add product");
  //     }

  //     setRegisterDetails({
  //       productName: "",
  //       productPrice: "",
  //       productCategory: "",
  //       productDescription: "",
  //       productCondition: "",
  //       productQuantity: "",
  //       productQuality: "",
  //       productweight: "",
  //       goldAvailable: "",
  //     });

  //     const data = await response.json();
  //     console.log("Added Product:", data);

  //     fetchData();

  //     Alert.alert(
  //       "Success",
  //       "Product Created successfully",
  //       [
  //         {
  //           text: "OK",
  //           onPress: () => {
  //             fetchData();
  //             navigation.goBack();
  //           },
  //         },
  //       ],
  //       { cancelable: false }
  //     );
  //   } catch (error) {
  //     console.error("Error adding product:", error);

  //     Alert.alert(
  //       "Error",
  //       "Failed to add jewelry product",
  //       [{ text: "OK", onPress: () => console.log("OK Pressed") }],
  //       { cancelable: false }
  //     );
  //   }
  // };

  const addProduct = async () => {
    try {
      if (!token) {
        console.error("Bearer token not found");
        return;
      }

      const formData = new FormData();
      formData.append("name", registerDetails.productName);
      formData.append("price", parseFloat(registerDetails.productPrice));
      formData.append("category", registerDetails.productCategory);
      formData.append("description", registerDetails.productDescription);
      formData.append("condition", registerDetails.productCondition);
      formData.append("quantity", parseInt(registerDetails.productQuantity));
      formData.append("quality", registerDetails.productQuality);
      formData.append(
        "weightPerProduct",
        parseFloat(registerDetails.productweight)
      );
      formData.append("goldAvailable", registerDetails.goldAvailable);

      selectedImages.forEach((image, index) => {
        formData.append("images", {
          uri: image.uri,
          name: `image_${index}.jpg`,
          type: "image/jpeg",
        });
      });

      console.log("formdata add product", formData);
      await dispatch(setLoadingInBtn(true));

      const response = await fetch(`${BASEAPIURL}/jewelry-products/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Required for file uploads
        },
        body: formData,
      });
      await dispatch(setLoadingInBtn(false));

      console.log("response", response);

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      setRegisterDetails({
        productName: "",
        productPrice: "",
        productCategory: "",
        productDescription: "",
        productCondition: "",
        productQuantity: "",
        productQuality: "",
        productweight: "",
        goldAvailable: "",
      });

      const data = await response.json();
      console.log("Added Product:", data);

      // fetchData();

      Alert.alert(
        "Success",
        "Product Created successfully",
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
      console.error("Error adding product:", error);

      Alert.alert(
        "Error",
        "Failed to add jewelry product",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
    }
  };

  // const fetchData = async () => {
  //   try {
  //     console.log("Token: ", token);
  //     if (!token) {
  //       console.error("Bearer token not found");
  //       return;
  //     }

  //     const response = await fetch(`${BASEAPIURL}/jewelry-products/`, {
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
  //     console.log("Fetched Products:", data);
  //   } catch (error) {
  //     console.error("Error fetching products:", error);
  //   }
  // };

  const CategoryData = ["gold", "silver", "diamond"];
  const ConditionData = ["old", "new"];
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  return (
    <SafeArea>
      <Provider>
        <ScrollView showsVerticalScrollIndicator={false}>
          <RowBetween style={{ paddingTop: 24, paddingRight: 16 }}>
            <View style={{ alignItems: "center", flexDirection: "row" }}>
              <IconButton
                icon="arrow-left"
                size={28}
                onPress={() => navigation.goBack()}
              />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "500",
                  color: "#000",
                }}
              >
                Add Event
              </Text>
            </View>
          </RowBetween>
          <MainContainer
            style={{ paddingBottom: 56 }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="always"
          >
            <Text
              style={{
                fontSize: 16,
                marginLeft: 24,
                color: "#000000",
                fontWeight: "600",
                marginTop: 50,
              }}
            >
              Add Event Image
            </Text>
            <Row style={{ marginLeft: 24, flexWrap: "wrap" }}>
              {selectedImages &&
                selectedImages.map((image, index) => (
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: "red",

                      marginRight: 12,
                      alignSelf: "center",
                    }}
                  >
                    <Image
                      key={index}
                      style={styles.profileImg}
                      source={{
                        uri: image.uri,
                      }}
                    />
                    <TouchableOpacity onPress={() => removeProfileImage(index)}>
                      <View
                        style={{
                          position: "absolute",
                          right: 3,
                          bottom: 22,
                        }}
                      >
                        <Image
                          source={require("../../assets/images/general/cross.png")}
                          style={{ width: 17, height: 17 }}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}

              {selectedImages.length < 6 && (
                <AddProfileBox onPress={_pickDocument}>
                  <Icon name="plus" size={35} color={Theme.themeColor} />
                </AddProfileBox>
              )}
            </Row>
            <FormSection style={{ paddingTop: 0 }}>
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Event Name*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.productName}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, productName: text })
                }
              />
              <TextInput
                multiline={true}
                numberOfLines={4}
                selectionColor={Theme.themeColor}
                placeholder="Event Description*"
                activeUnderlineColor={Theme.themeColor}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.productDescription}
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    productDescription: text,
                  })
                }
                style={[
                  styles.input,
                  {
                    padding: 15,
                    borderRadius: 5,
                    fontSize: 16,
                    height: 100,
                    color: "black",
                    fontWeight: "400",
                    backgroundColor: "#F0F0F0",
                    marginTop: 20,
                    paddingTop: 15,
                    borderColor: "#e6e6e6",
                    textTransform: "capitalize",
                  },
                ]}
              />
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Event Type*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.productPrice}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, productPrice: text })
                }
              />

              <SelectDropdown
                buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={CategoryData}
                defaultButtonText="Select Temple"
                value={registerDetails.productCategory}
                onSelect={(selectedItem) => {
                  setRegisterDetails({
                    ...registerDetails,
                    productCategory: selectedItem,
                  });
                }}
              />
              
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Event Time*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.productPrice}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, productPrice: text })
                }
              />

              {/* <SelectDropdown
                buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={ConditionData}
                defaultButtonText="Select Condition"
                value={registerDetails.productCondition}
                onSelect={(selectedItem) => {
                  setRegisterDetails({
                    ...registerDetails,
                    productCondition: selectedItem,
                  });
                }}
              />
             

              <LoginInputField
                color
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Product Quantity*"
                underlineColor="transparent"
                keyboardType="numeric"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    productQuantity: text,
                  })
                }
                value={registerDetails.productQuantity}
              />
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Product Quality*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.productQuality}
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    productQuality: text,
                  })
                }
              />
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Gold Available*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.goldAvailable}
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    goldAvailable: text,
                  })
                }
              />
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Weight (Each Product)*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                value={registerDetails.productweight}
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    productweight: text,
                  })
                }
              /> */}

              <FormButton onPress={addProduct}>
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                >
                  {loadingInBtn === true ? (
                    <ActivityIndicator
                      style={{
                        display: "flex",
                        alignSelf: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                      }}
                      // size={"large"}
                      color={"white"}
                    />
                  ) : (
                    "Submit"
                  )}
                </Text>
              </FormButton>
            </FormSection>
          </MainContainer>
        </ScrollView>
      </Provider>
    </SafeArea>
  );
}
