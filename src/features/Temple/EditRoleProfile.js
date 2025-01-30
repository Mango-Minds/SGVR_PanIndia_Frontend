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

export default function TempleEditRoleRegisterScreen({ navigation, route }) {
  registerTranslation("en", en);
  

  const { fetchShops, shopId, shopData, loggedInShop, templeId } =
    route.params;
    
  const { loadingInBtn } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const userType = useSelector((state) => state.user.user.userType);

  const tokenPayload = token.split(".")[1];
  const user = useSelector((state) => state.user.user);

  const loggedInUserId = user?.roleData?._id;

  const [initialUserName, setInitialUserName] = useState("");

  const [shopName, setShopName] = useState(loggedInShop?.name || "");

  const [initialAbout, setInitialAbout] = useState("");

  const heading =
    userType === "templeAdmin"
      ? "Edit Temple Admin Profile"
      : userType === "templeShopOwner"
      ? "Edit Shop Profile"
      : "Edit Profile";

  const [selectedImage, setSelectedImage] = useState(() => {
    if (userType === "templeShopOwner" && loggedInShop && loggedInShop.image) {
      return { uri: `${BASEIMGURL}${loggedInShop.image}` };
    } else {
      return null;
    }
  });

  useEffect(() => {
    if (userType === "templeShopOwner" && loggedInShop && loggedInShop.image) {
      setSelectedImage({ uri: `${BASEIMGURL}${loggedInShop.image}` });
    } else {
      setSelectedImage(null);
    }
  }, [userType, loggedInShop]);

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

    setInitialUserName(initialData.userName);
    setInitialAbout(initialData.about);
    setUserName(initialData.userName);
    setAbout(initialData.about);
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleSubmit = async () => {
    try {
      let apiUrl;
      let fetchFunction;

      if (userType === "templeShopOwner") {
        apiUrl = `${BASEAPIURL}/templeShops/${shopId}`;
        fetchFunction = fetchShops;
      }

      const requestBody = {};
      if (userType === "templeShopOwner") {
        if (shopName !== initialUserName) {
          requestBody.name = shopName;
        }

        if (selectedImage && selectedImage.uri) {
          requestBody.image = selectedImage.uri;
        }
        if (templeId) {
          requestBody.temple = templeId;
        }

        if (loggedInShop?.owner?.id?._id) {
          requestBody.owner = loggedInShop?.owner?.id?._id;
        } else if (loggedInShop?.owner) {
          requestBody.owner = loggedInShop.owner;
        }
      }

      console.log("Request Body:", requestBody);

      const formData = new FormData();
      for (const key in requestBody) {
        formData.append(key, requestBody[key]);
      }

      if (selectedImage) {
        let localUri = selectedImage.uri;
        let filename = localUri.split("/").pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;

        formData.append("image", {
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
                value={shopName}
                onChangeText={(text) => setShopName(text)}
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
