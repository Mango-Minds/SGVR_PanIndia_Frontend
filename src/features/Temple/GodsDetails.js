import React, { useState, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import Theme from "../../styles/theme";
import { IconButton } from "react-native-paper";
import { RowBetween, SearchField } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import Icon from "react-native-vector-icons/Ionicons";
import { ScrollView } from "react-native-gesture-handler";
import BottomNavigation from "./BottomNavigation";
import { decode } from "base-64";
import { BASEAPIURL } from "../../infrastructure/constants";
import { useSelector } from "react-redux";
import UserImg from "../../assets/images/general/user.png";
import { useIsFocused } from "@react-navigation/native";
import apiClient from "../../store/apiClient";
const DetailsScreen = ({ route, navigation }) => {
  const { god, userType, templeinfo, godId, setGods } = route.params;

  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];
  const isFocused = useIsFocused();
  const [godDetails, setGodDetails] = useState(
    templeinfo ? templeinfo.gods : []
  );

  // const fetchTempleGods = async () => {
  //   console.log("Temple id: ", templeinfo._id);
  //   console.log("God id in details: ", godId);
  //   try {
  //     const response = await fetch(
  //       `${BASEAPIURL}/temple/${templeinfo._id}/gods/${godId}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch gods");
  //     }
  //     const data = await response.json();
  //     console.log("gods response data", data);
  //     setGodDetails(data);
  //   } catch (error) {
  //     console.error("Error fetching gods:", error);
  //   }
  // };
  const fetchTempleGods = async () => {
    console.log("Temple id: ", templeinfo._id);
    console.log("God id in details: ", godId);
  
    try {
      const response = await apiClient.get(`/temple/${templeinfo._id}/gods/${godId}`);
  
      if (response.status === 200) {
        console.log("Gods response data", response.data);
        setGodDetails(response.data);
      } else {
        throw new Error("Failed to fetch gods");
      }
    } catch (error) {
      console.error("Error fetching gods:", error);
    }
  };
  
  useEffect(() => {
    if (isFocused) {
      fetchTempleGods();
    }
  }, [isFocused]);
  console.log("God details in detail page: ", godDetails);

  // const deleteGod = async () => {
  //   try {
  //     const response = await fetch(
  //       `${BASEAPIURL}/temple/${templeinfo._id}/gods/${godId}`,
  //       {
  //         method: "DELETE",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     console.log("God deletion response", response);
  //     if (!response.ok) {
  //       throw new Error("Failed to delete god");
  //     }
  //     fetchTempleGods();

  //     Alert.alert(
  //       "Success",
  //       "God deleted successfully",
  //       [
  //         {
  //           text: "OK",
  //           onPress: () => {
  //             navigation.goBack();
  //           },
  //         },
  //       ],
  //       { cancelable: false }
  //     );
  //   } catch (error) {
  //     console.error("Error deleting God:", error);
  //   }
  // };
  const deleteGod = async () => {
    try {
      const response = await apiClient.delete(`/temple/${templeinfo._id}/gods/${godId}`);
  
      console.log("God deletion response", response);
  
      if (response.status === 200) {
        fetchTempleGods();
  
        Alert.alert("Success", "God deleted successfully", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        throw new Error("Failed to delete god");
      }
    } catch (error) {
      console.error("Error deleting God:", error);
    }
  };
  
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <View
        style={{
          paddingHorizontal: 10,
        }}
      >
        <RowBetween style={{ paddingTop: 24 }}>
          <View style={{ alignItems: "center", flexDirection: "row" }}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
            <TopText
              style={{ color: Theme.themeColor, fontSize: 20, fontWeight: "bold" }}
            >
              God Details
            </TopText>
          </View>
          {userType === "templeAdmin" && (
            <>
              <IconButton
                icon="trash-can-outline"
                style={{ marginLeft: "auto" }}
                onPress={deleteGod}
              />
              <IconButton
                icon="pencil-outline"
                onPress={() =>
                  navigation.navigate("EditGod", {
                    god: godDetails,
                    templeinfo: templeinfo,
                    fetchTempleGods: fetchTempleGods,
                    setGodDetails: setGodDetails,
                  })
                }
              />
            </>
          )}
        </RowBetween>
      </View>
      <ScrollView style={styles.container}>
        {/* <Image source={{ uri: imageUrl }} style={styles.godImage} /> */}
        <Image
          source={
            godDetails?.godImage
              ? {
                  uri: `${godDetails.godImage}`,
                }
              : UserImg
          }
          style={styles.godImage}
        />
        <Text style={styles.godName}>{godDetails.godName}</Text>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.sectionText}>{godDetails.description}</Text>
        <Text style={styles.sectionTitle}>Symbols</Text>
        <Text style={styles.sectionText}>{godDetails.symbol}</Text>
        <Text style={styles.sectionTitle}>Festivals</Text>
        <Text style={styles.sectionText}>
          {Array.isArray(godDetails.festivals)
            ? godDetails.festivals.join(", ")
            : "No festivals available"}
        </Text>
        <Text style={styles.sectionTitle}>Related Deities</Text>
        <Text style={styles.sectionText}>
          {Array.isArray(godDetails.relatedDeities)
            ? godDetails.relatedDeities.join(", ")
            : "No related deities available"}
        </Text>
      </ScrollView>
      <BottomNavigation navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  godImage: {
    width: "100%",
    height: 260,
    borderRadius: 10,
  },
  godName: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    color:Theme.themeColor,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  sectionText: {
    fontSize: 15,
    marginBottom: 10,
    color: "#898E92",
  },
  templeCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  templeImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
  },
  templeName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  templeLocation: {
    fontSize: 14,
    color: "#777",
  },
});

export default DetailsScreen;
