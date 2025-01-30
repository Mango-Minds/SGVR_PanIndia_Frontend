import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Calendar } from "react-native-calendars";
import moment from "moment";
import {
  IconButton,
  Provider,
  RadioButton,
  ActivityIndicator,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  Image,
  Text,
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Dimensions,
  ScrollView,
  Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  FormButton,
  FormSection,
  MainContainer,
  Row,
  LoginInputField,
  AddProfileBox,
} from "../../styles/prelogin.styles";
import { SafeArea } from "../../components/utility/safe-area.component";
import SelectDropdown from "react-native-select-dropdown";
import { useDispatch } from "react-redux";
import { RowBetween } from "../../styles/common.styles";
import FormData from "form-data";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

import {
  BASEIMGURL,
  BASEAPIURL,
  RENDERMEDIAURL,
} from "../../infrastructure/constants";
import { en, registerTranslation } from "react-native-paper-dates";
import { ErrorToggle, setLoadingInBtn } from "../../store/user";
import { decode } from "base-64";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

const MatrimonyShopProfileEdit = ({ navigation, route }) => {
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user);

  registerTranslation("en", en);
  const dispatch = useDispatch();
  const user_details = route.params;
  const { loadingInBtn } = useSelector((state) => state.user);
  const ownerId = user_details.user_details._id;
  ownerRole = user.user.userType;
  const [userRoleData, setUserRoleData] = useState(user_details.user_details);
  const [modifiedDetails, setModifiedDetails] = useState({});

  const initialImages =
    userRoleData && userRoleData?.images
      ? userRoleData?.images?.map(
          (image) => `${BASEIMGURL}` + image.replace(/\\/g, "/")
        )
      : [];

  const [selectedImages, setSelectedImages] = useState(initialImages);
  const [uploadedImages, setUploadedImages] = useState([]);

  const updateModifiedDetails = () => {
    setModifiedDetails({
      name: userRoleData?.name ?? "",
      businessName: userRoleData?.businessName ?? "",
      address: userRoleData?.address ?? "",
      description: userRoleData?.description ?? "",
      contactInfo: userRoleData?.contactInfo ?? "",
    });
  };

  useEffect(() => {
    updateModifiedDetails();
  }, [userRoleData]);

  // Function to handle media selection
  const _pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
    });

    if (result.canceled) return;

    setUploadedImages((prev) => [...prev, result.assets[0]]);
  };

  const removeProfileImage = (index, isUploadedImage) => {
    if (isUploadedImage) {
      setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    } else {
      setSelectedImages(selectedImages.filter((_, i) => i !== index));
    }
  };

  const FILE_SIZE_LIMIT = 5 * 1024 * 1024; //5mb

  const handleUpdate = async () => {
    const formData = new FormData();

    // image checks :)
    console.log("Uploaded Images:", uploadedImages);
    uploadedImages.forEach((file, index) => {
      if (file.size > FILE_SIZE_LIMIT) {
        Alert.alert("Size Limit Reached", `Image ${index+1} is exceeding the size limit.`, [
          { text: "OK" },
        ]);
        return;
      }
    });

    if (selectedImages.length + uploadedImages.length > 5) {
      Alert.alert("Limit Reached", "You can only upload up to 5 images.", [
        { text: "OK" },
      ]);
      return;
    }

    selectedImages.forEach((image, index) => {
      if (image.startsWith(BASEIMGURL)) {
        formData.append("images", image.replace(BASEIMGURL, ""));
      }
    });

    uploadedImages.forEach((image, index) => {
      formData.append("images", {
        uri: image.uri,
        name: `image_${index}.jpg`,
        type: "image/jpeg",
      });
    });

    formData.append("name", modifiedDetails.name);
    formData.append("businessName", modifiedDetails.businessName);
    formData.append("address", modifiedDetails.address);
    formData.append("description", modifiedDetails.description);
    formData.append("contactInfo", modifiedDetails.contactInfo);

    await dispatch(setLoadingInBtn(true));

    let editUrl = "";

    if (ownerRole === "matrimonyVendor") {
      editUrl = `${BASEAPIURL}/matrimony/matrimonyVendor/matrimonyVendors/edit/${ownerId}`;
    } else if (ownerRole === "decorator") {
      editUrl = `${BASEAPIURL}/matrimony/decorator/decorators/edit/${ownerId}`;
    } else if (ownerRole === "caterer") {
      editUrl = `${BASEAPIURL}/matrimony/caterer/caterers/edit/${ownerId}`;
    } else if (ownerRole === "planner") {
      editUrl = `${BASEAPIURL}/matrimony/planner/planners/edit/${ownerId}`;
    } else if (ownerRole === "venue") {
      editUrl = `${BASEAPIURL}/matrimony/venue/venues/edit/${ownerId}`;
    }

    try {
      const response = await fetch(editUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update matrimony shop details");
      }

      alert("Matrimony shop details updated successfully");
      navigation.goBack();
      await dispatch(setLoadingInBtn(false));
    } catch (error) {
      console.error("Error updating matrimony shop details:", error);
      await dispatch(setLoadingInBtn(false));
    }
  };

  const shopImage = BASEIMGURL + modifiedDetails.image;

  return (
    <>
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
                  Edit Shop Details
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
                  marginLeft: 25,
                  color: "#000000",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                Edit Your Images
              </Text>
              <Row style={{ marginLeft: 24, flexWrap: "wrap" }}>
                {selectedImages.map((image, index) => (
                  <View
                    key={`selected-${index}`}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: "red",
                      // marginTop: "10%",
                      marginRight: 12,
                      alignSelf: "center",
                    }}
                  >
                    <Image style={styles.profileImg} source={{ uri: image }} />
                    <TouchableOpacity
                      onPress={() => removeProfileImage(index, false)}
                    >
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
                {uploadedImages.map((image, index) => (
                  <View
                    key={`uploaded-${index}`}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: "red",
                      // marginTop: "10%",
                      marginRight: 12,
                      alignSelf: "center",
                    }}
                  >
                    <Image
                      style={styles.profileImg}
                      source={{ uri: image.uri }}
                    />
                    <TouchableOpacity
                      onPress={() => removeProfileImage(index, true)}
                    >
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
                {selectedImages.length + uploadedImages.length < 6 && (
                  <AddProfileBox onPress={_pickDocument}>
                    <Icon name="plus" size={35} color="#d4af37" />
                  </AddProfileBox>
                )}
              </Row>
              <FormSection style={{ paddingTop: 0 }}>
                <Text
                  style={{
                    fontSize: 16,
                    marginLeft: 4,
                    color: "grey",
                    fontWeight: "600",
                  }}
                >
                  Name
                </Text>
                <LoginInputField
                  selectionColor="#d4af37"
                  placeholder="Name*"
                  activeUnderlineColor="#d4af37"
                  style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  value={modifiedDetails.name}
                  onChangeText={(text) =>
                    setModifiedDetails({ ...modifiedDetails, name: text })
                  }
                />
                <Text
                  style={{
                    fontSize: 16,
                    marginLeft: 4,
                    color: "grey",
                    fontWeight: "600",
                  }}
                >
                  Business Name
                </Text>
                <LoginInputField
                  selectionColor="#d4af37"
                  placeholder="Business Name*"
                  activeUnderlineColor="#d4af37"
                  style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  value={modifiedDetails.businessName}
                  onChangeText={(text) =>
                    setModifiedDetails({
                      ...modifiedDetails,
                      businessName: text,
                    })
                  }
                />
                <Text
                  style={{
                    fontSize: 16,
                    marginLeft: 4,
                    color: "grey",
                    fontWeight: "600",
                  }}
                >
                  Address
                </Text>
                <LoginInputField
                  selectionColor="#d4af37"
                  multiline={true}
                  placeholder="Address*"
                  activeUnderlineColor="#d4af37"
                  style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  value={modifiedDetails.address}
                  onChangeText={(text) =>
                    setModifiedDetails({ ...modifiedDetails, address: text })
                  }
                />
                <Text
                  style={{
                    fontSize: 16,
                    marginLeft: 4,
                    color: "grey",
                    fontWeight: "600",
                  }}
                >
                  Description
                </Text>
                <LoginInputField
                  selectionColor="#d4af37"
                  placeholder="Description*"
                  activeUnderlineColor="#d4af37"
                  style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  value={modifiedDetails.description}
                  onChangeText={(text) =>
                    setModifiedDetails({
                      ...modifiedDetails,
                      description: text,
                    })
                  }
                />
                <Text
                  style={{
                    fontSize: 16,
                    marginLeft: 4,
                    color: "grey",
                    fontWeight: "600",
                  }}
                >
                  Contact Info
                </Text>
                <LoginInputField
                  keyboardType="numeric" // Ensures the numeric keyboard is shown
                  selectionColor="#d4af37"
                  activeUnderlineColor="#d4af37"
                  style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
                  placeholder="Contact Info*"
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  value={modifiedDetails.contactInfo?.toString() ?? ""} // Ensure it's a string for the input
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, ""); // Allow only numbers
                    setModifiedDetails({
                      ...modifiedDetails,
                      contactInfo: numericValue
                        ? parseInt(numericValue, 10)
                        : "", // Convert to number if not empty
                    });
                  }}
                />
                <FormButton onPress={handleUpdate}>
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
    </>
  );
};

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
  mediaContainer: {
    flexDirection: "row",
    marginTop: 20,
    height: "auto",
  },
  mediaPreviewWrapper: {
    position: "relative",
    marginRight: 10,
    marginVertical: 10,
    height: 60,
    width: 60,
  },
  removeButton: {
    position: "absolute",
    top: -5,
    right: -35,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 2,
  },
  mediaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d4af37",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginLeft: 25,
    width: "30%",
  },
  mediaText: {
    color: "white",
    marginLeft: 10,
  },
});
export default MatrimonyShopProfileEdit;
