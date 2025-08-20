import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
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
import { en, registerTranslation } from "react-native-paper-dates";
import * as ImagePicker from "expo-image-picker";
import {useQueryClient } from "@tanstack/react-query";
import { RowBetween } from "../../styles/common.styles";
import { BASEAPIURL } from "../../infrastructure/constants";
import { decode } from "base-64";

const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
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
    fontSize: 18,
  },
});

export default function AssignForm({ navigation, route }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();
  const [selectedImages, setSelectedImages] = useState([]);
  const [registerDetails, setRegisterDetails] = useState({
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

  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));
  const [workers, setWorkers] = useState([]);
  const { product, fetchProduct, connectedWorkers} = route.params;

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
        console.log("Workers data: ", data);
      } else {
        throw new Error("Failed to fetch workers");
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  
  const [selectedWorker, setSelectedWorker] = useState([]);
 
  const handleSubmit = async () => {
    console.log("Submitting form...");
  
    if (!selectedWorker) {
      Alert.alert("Error", "No worker selected");
      return;
    }

    try {
      const response = await fetch(`${BASEAPIURL}/jewelry-products/assign/${product._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workerIds: [selectedWorker._id], 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign workers");
      }

      const data = await response.json();
      console.log("Workers Assigned:", data);
     
      Alert.alert(
        "Success",
        "Workers assigned successfully",
        [{ text: "OK", onPress: () => {
          fetchProduct();
          navigation.goBack(); 
        }}],
        { cancelable: false }
      );
    
    } catch (error) {
      console.error("Error assigning workers:", error);

      Alert.alert(
        "Error",
        "Failed to assign workers",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
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
                Assign Product
              </Text>
            </View>
          </RowBetween>
          <MainContainer
            style={{ paddingBottom: 56 }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="always"
          >
            <FormSection style={{ paddingTop: 0 }}>
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

              <SelectDropdown
                data={connectedWorkers && connectedWorkers.map((worker) => `${worker.owner.firstName} ${worker.owner.lastName}`)}
                buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                defaultButtonText="Select Workers"
                onSelect={(selectedItem, index) => {
                  setSelectedWorker(connectedWorkers[index]);
                 
                }}
              />

              <FormButton onPress={handleSubmit}>
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                >
                  Assign
                </Text>
              </FormButton>
            </FormSection>
          </MainContainer>
        </ScrollView>
      </Provider>
    </SafeArea>
  );
}
