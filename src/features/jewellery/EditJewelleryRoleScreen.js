import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { IconButton, Provider } from "react-native-paper";
import { SafeArea } from "../../components/utility/safe-area.component";
import {
  FormButton,
  FormSection,
  MainContainer,
  LoginInputField,
  AddProfileBox,
} from "../../styles/prelogin.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { decode } from "base-64";
import { en, registerTranslation } from "react-native-paper-dates";
import * as ImagePicker from "expo-image-picker";
import { RowBetween } from "../../styles/common.styles";
import { BASEAPIURL } from "../../infrastructure/constants";
import { BASEIMGURL } from "../../infrastructure/constants";
import UserImg from "../../assets/images/general/user.png";
import { setLoadingInBtn } from "../../store/user";
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

export default function JewelleryEditRoleRegisterScreen({ navigation, route }) {
  registerTranslation("en", en);

  const {
    userData,
    fetchUser,
    userId,
    fetchShops,
    fetchVendors,
    fetchWorkers,
    workerId,
    shopId,
    vendorId,
    vendors,
    setVendors,
    loggedInVendor,
    loggedInWorker,
    loggedInShop,
    gemologists,
    loggedInGemologist,
    fetchGemologists,
    loggedInDesigner,
    designers,
    fetchDesigners,
  } = route.params;

  const { loadingInBtn } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const userType = useSelector((state) => state.user.user.userType);
  const tokenPayload = token.split(".")[1];
  const user = useSelector((state) => state.user.user);
  console.log("ROle user: ", user);
  const loggedInUserId = user?.roleData?._id;
  console.log("ROle Logged in user id: ", loggedInUserId);

  const [initialWorkerName, setInitialWorkerName] = useState("");

  const [initialShopName, setInitialShopName] = useState("");

  const [initialUserName, setInitialUserName] = useState("");

  const [initialusername, setInitialusername] = useState("");
  const [initialDesignerUsername, setInitialDesignerUsername] = useState("");

  const [workerName, setWorkerName] = useState(() => {
    if (userType === "worker" && loggedInWorker) {
      return loggedInWorker.worker_name;
    } else {
      return "";
    }
  });

  const [gemologistName, setGemologistName] = useState(() => {
    if (userType === "gemologist" && loggedInGemologist) {
      return loggedInGemologist.username;
    } else {
      return "";
    }
  });

  const [designerName, setDesignerName] = useState(() => {
    if (userType === "jewelryDesigner" && loggedInDesigner) {
      return loggedInDesigner.username;
    } else {
      return "";
    }
  });

  const [shopName, setShopName] = useState(() => {
    if (userType === "shop" && loggedInShop) {
      return loggedInShop.shopName;
    } else {
      return "";
    }
  });

  const [userName, setUserName] = useState(() => {
    if (userType === "vendor" && loggedInVendor) {
      return loggedInVendor.username;
    } else {
      return "";
    }
  });

  const [about, setAbout] = useState(() => {
    if (userType === "vendor" && loggedInVendor) {
      return loggedInVendor.about;
    } else if (userType === "worker" && loggedInWorker) {
      return loggedInWorker.description;
    } else if (userType === "shop" && loggedInShop) {
      return loggedInShop.description;
    } else if (userType === "gemologist" && loggedInGemologist) {
      return loggedInGemologist.certifications;
    } else if (userType === "jewelryDesigner" && loggedInDesigner) {
      return loggedInDesigner.specialty;
    }
  });

  const [initialAbout, setInitialAbout] = useState("");
  const heading =
    userType === "vendor"
      ? "Edit Vendor Profile"
      : userType === "worker"
      ? "Edit Worker Profile"
      : userType === "gemologist"
      ? "Edit Gemologist Profile"
      : userType === "jewelryDesigner"
      ? "Edit Jewelry Designer Profile"
      : "Edit Shop  Profile";

  const [selectedImage, setSelectedImage] = useState(() => {
    if (
      userType === "vendor" &&
      loggedInVendor &&
      loggedInVendor.profileimages
    ) {
      return { uri: `${BASEIMGURL}${loggedInVendor.profileimages}` };
    } else if (
      userType === "worker" &&
      loggedInWorker &&
      loggedInWorker.profileimages
    ) {
      return { uri: `${BASEIMGURL}${loggedInWorker.profileimages}` };
    } else if (
      userType === "shop" &&
      loggedInShop &&
      loggedInShop.profileimages
    ) {
      return { uri: `${BASEIMGURL}${loggedInShop.profileimages}` };
    } else if (
      userType === "gemologist" &&
      loggedInGemologist &&
      loggedInGemologist.profileImage
    ) {
      return { uri: `${BASEIMGURL}${loggedInGemologist.profileImage}` };
    } else if (
      userType === "jewelryDesigner" &&
      loggedInDesigner &&
      loggedInDesigner.profileImage
    ) {
      return { uri: `${BASEIMGURL}${loggedInDesigner.profileImage}` };
    } else {
      return UserImg;
    }
  });

  useEffect(() => {
    if (
      userType === "vendor" &&
      loggedInVendor &&
      loggedInVendor.profileimages
    ) {
      setSelectedImage({ uri: `${BASEIMGURL}${loggedInVendor.profileimages}` });
    } else if (
      userType === "worker" &&
      loggedInWorker &&
      loggedInWorker.profileimages
    ) {
      setSelectedImage({ uri: `${BASEIMGURL}${loggedInWorker.profileimages}` });
    } else if (
      userType === "shop" &&
      loggedInShop &&
      loggedInShop.profileimages
    ) {
      setSelectedImage({ uri: `${BASEIMGURL}${loggedInShop.profileimages}` });
    } else if (
      userType === "gemologist" &&
      loggedInGemologist &&
      loggedInGemologist.profileImage
    ) {
      setSelectedImage({
        uri: `${BASEIMGURL}${loggedInGemologist.profileImage}`,
      });
    } else if (
      userType === "jewelryDesigner" &&
      loggedInDesigner &&
      loggedInDesigner.profileImage
    ) {
      setSelectedImage({
        uri: `${BASEIMGURL}${loggedInDesigner.profileImage}`,
      });
    } else {
      setSelectedImage(UserImg);
    }
  }, [
    userType,
    loggedInVendor,
    loggedInWorker,
    loggedInShop,
    loggedInGemologist,
    loggedInDesigner,
  ]);

  const _pickDocument = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      crop: true,
    });

    if (result.canceled === true) return;
    setSelectedImage(result.assets[0]);
  };

  const fetchUserDetails = async () => {
    const initialData = await fetchInitialData();
    setInitialWorkerName(initialData.workerName);
    setInitialShopName(initialData.shopName);
    setInitialUserName(initialData.userName);
    setInitialusername(initialData.username);
    setInitialDesignerUsername(initialData.designerName);
    setInitialAbout(initialData.about);
    setWorkerName(initialData.workerName);
    setShopName(initialData.shopName);
    setUserName(initialData.userName);
    setAbout(initialData.about);
    setGemologistName(initialData.gemologistName);
    setDesignerName(initialData.designerName);
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleSubmit = async () => {
    try {
      let apiUrl;
      let fetchFunction;

      // Set API URL and fetch function based on user type
      if (userType === "worker") {
        apiUrl = `${BASEAPIURL}/worker/update/${loggedInUserId}`;
        fetchFunction = fetchWorkers;
      } else if (userType === "vendor") {
        apiUrl = `${BASEAPIURL}/vendor/update/${loggedInUserId}`;
        fetchFunction = fetchVendors;
      } else if (userType === "shop") {
        apiUrl = `${BASEAPIURL}/shop/update/${loggedInUserId}`;
        fetchFunction = fetchShops;
      } else if (userType === "gemologist") {
        apiUrl = `${BASEAPIURL}/gemologist/update/${loggedInUserId}`;
        fetchFunction = fetchGemologists;
      } else if (userType === "jewelryDesigner") {
        apiUrl = `${BASEAPIURL}/jewelryDesigner/update/${loggedInUserId}`;
        fetchFunction = fetchDesigners;
      }

      const requestBody = {};
      if (userType === "worker") {
        if (workerName !== initialWorkerName) {
          requestBody.worker_name = workerName;
        }
        if (about !== initialAbout) {
          requestBody.description = about;
        }
      } else if (userType === "shop") {
        if (shopName !== initialShopName) {
          requestBody.shopName = shopName;
        }
        if (about !== initialAbout) {
          requestBody.description = about;
        }
      } else if (userType === "vendor") {
        if (userName !== initialUserName) {
          requestBody.username = userName;
        }
        if (about !== initialAbout) {
          requestBody.about = about;
        }
      } else if (userType === "gemologist") {
        if (gemologistName !== initialusername) {
          requestBody.username = gemologistName;
        }
        if (about !== initialAbout) {
          requestBody.certifications = about;
        }
      } else if (userType === "jewelryDesigner") {
        if (designerName !== initialDesignerUsername) {
          requestBody.username = designerName;
        }
        if (about !== initialAbout) {
          requestBody.specialty = about;
        }
      }

      console.log("Request Body:", requestBody);

      const formData = new FormData();
      for (const key in requestBody) {
        formData.append(key, requestBody[key]);
      }

      // Only process selectedImage if it is defined
      if (selectedImage && selectedImage.uri) {
        let localUri = selectedImage.uri;
        let filename = localUri.split("/").pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;

        formData.append("profileImage", {
          uri: localUri,
          name: filename,
          type,
        });
      }

      await dispatch(setLoadingInBtn(true));
      console.log("Form Data:", formData);

      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      console.log('user edit response', response);

      await dispatch(setLoadingInBtn(false));

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      Alert.alert("Information Updated Successfully");

      if (fetchFunction) {
        fetchFunction();
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <SafeArea>
      <Provider>
        <ScrollView>
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
                  fontWeight: "bold",
                  color: "#000",
                  letterSpacing: 0.5,
                }}
              >
                {heading}
              </Text>
            </View>
          </RowBetween>
          <MainContainer
            style={{ paddingBottom: 56 }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="always"
          >
            {selectedImage ? (
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: "red",
                  marginTop: "10%",
                  alignSelf: "center",
                }}
              >
                <Image
                  style={styles.logo}
                  source={{ uri: selectedImage.uri }}
                />
                <TouchableOpacity onPress={_pickDocument}>
                  <View
                    style={{
                      position: "absolute",
                      right: 0,
                      bottom: 0,

                      backgroundColor: "lightgrey",
                      display: "flex",
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      // width: 20,
                      // height: 20,
                      borderRadius: 60,
                      padding: 8,
                    }}
                  >
                    <Image
                      source={require("../../assets/images/matrimony/camera.png")}
                      style={{ width: 15, height: 15 }}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <AddProfileBox
                onPress={_pickDocument}
                style={{ ...styles.logo, marginTop: "10%" }}
              >
                <Icon name="plus" size={35} color="#d4af37" />
              </AddProfileBox>
            )}
            <FormSection style={{ paddingTop: 0 }}>
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Name *"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={
                  userType === "worker"
                    ? workerName
                    : userType === "shop"
                    ? shopName
                    : userType === "vendor"
                    ? userName
                    : userType === "gemologist"
                    ? gemologistName
                    : userType === "jewelryDesigner"
                    ? designerName
                    : ""
                }
                onChangeText={(text) => {
                  if (userType === "worker") {
                    setWorkerName(text);
                  } else if (userType === "shop") {
                    setShopName(text);
                  } else if (userType === "vendor") {
                    setUserName(text);
                  } else if (userType === "gemologist") {
                    setGemologistName(text);
                  } else if (userType === "jewelryDesigner") {
                    setDesignerName(text);
                  }
                }}
              />
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Description *"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={
                  userType === "worker"
                    ? about
                    : userType === "shop"
                    ? about
                    : userType === "vendor"
                    ? about
                    : userType === "gemologist"
                    ? about
                    : userType === "jewelryDesigner"
                    ? about
                    : ""
                }
                onChangeText={(text) => {
                  if (userType === "worker") {
                    setAbout(text);
                  } else if (userType === "shop") {
                    setAbout(text);
                  } else if (userType === "vendor") {
                    setAbout(text);
                  } else if (userType === "gemologist") {
                    setAbout(text);
                  } else if (userType === "jewelryDesigner") {
                    setAbout(text);
                  }
                }}
              />

              <FormButton onPress={handleSubmit}>
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
                    "Update Profile"
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
