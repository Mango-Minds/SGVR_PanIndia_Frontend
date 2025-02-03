import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { ActivityIndicator, IconButton, Provider } from "react-native-paper";
import Theme from "../../styles/theme";
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
import { ErrorToggle, setLoadingInBtn } from "../../store/user";
import { useIsFocused } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import DatePicker from "react-native-datepicker";
import { en, registerTranslation } from "react-native-paper-dates";
import { statesData } from "../../assets/data/statesAndCities";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "react-query";
import { RowBetween } from "../../styles/common.styles";
import FormData from "form-data";
import { BASEIMGURL } from "../../infrastructure/constants";
import { BASEAPIURL } from "../../infrastructure/constants";

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

export default function EditGod({ route, navigation }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();

  const { god, templeinfo, setGodDetails, fetchTempleGods } = route.params;
  console.log("God: ", god);
  
  const token = useSelector((state) => state.user.token);

  const [selectedImage, setSelectedImage] = useState({
    uri: god.godImage ? `${BASEIMGURL}${god.godImage}` : null,
  });

  const { loadingInBtn } = useSelector((state) => state.user);
  const isFocused = useIsFocused();

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
  const [modifiedDetails, setModifiedDetails] = useState({
    godName: god.godName,
    description: god.description,
    symbol: god.symbol,
    festivals: god.festivals.join(', '), 
  relatedDeities: god.relatedDeities.join(', '), 
  });
  console.log("modified details", modifiedDetails);

  const handleUpdate = async () => {
    await dispatch(setLoadingInBtn(true));

    try {
      const formData = new FormData();

      // Append modified details
      Object.keys(modifiedDetails).forEach((key) => {
        if (modifiedDetails[key] !== god[key]) {
          formData.append(key, modifiedDetails[key]);
        }
      });

      // Append existing images without base URL
      if (selectedImage && selectedImage.uri) {
        let localUri = selectedImage.uri;
        let filename = localUri.split("/").pop();

        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;

        formData.append("godImage", {
          uri: localUri,
          name: filename,
          type,
        });
      }
      console.log("formdata--", formData);

      const response = await fetch(
        `${BASEAPIURL}/temple/${templeinfo._id}/gods/${god._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      await dispatch(setLoadingInBtn(false));

      console.log("response--", response);

      if (!response.ok) {
        throw new Error("Failed to update god");
      }
      const data = await response.json();  
      setGodDetails(data);
      fetchTempleGods();
      alert("God Updated Successfully");
      console.log("edit data: ", data);
      navigation.goBack();
    } catch (error) {
      console.error("Error updating god:", error);
    }
  };

 

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
                Edit god
              </Text>
            </View>
          </RowBetween>
          <MainContainer
            style={{ paddingBottom: 56 }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="always"
          >
            {selectedImage.uri ? (
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
                <Icon name="plus" size={35} color={Theme.themeColor} />
              </AddProfileBox>
            )}
            <FormSection style={{ paddingTop: 0 }}>
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 30,
                }}
              >
                God Name
              </Text>
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Name"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.godName}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, godName: text })
                }
              />
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                God Description
              </Text>

              <TextInput
                multiline={true}
                numberOfLines={4}
                selectionColor={Theme.themeColor}
                placeholder="god Description*"
                activeUnderlineColor={Theme.themeColor}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.description}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, description: text })
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

              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                Symbol
              </Text>
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Symbol"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.symbol}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, symbol: text })
                }
              />
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                Festivals
              </Text>

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Festivals"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                
                value={modifiedDetails.festivals}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, festivals: text })
                }
              />
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                Related Deities
              </Text>

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Related Deities"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                
                value={modifiedDetails.relatedDeities}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, relatedDeities: text })
                }
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
  );
}
