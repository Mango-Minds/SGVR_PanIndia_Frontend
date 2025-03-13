import React, { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import {
  View,
  ImageBackground,
  FlatList,
  Text,
  RefreshControl,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { TopText } from "../../styles/social.styles";
import Theme from "../../styles/theme";
import { Card, IconButton } from "react-native-paper";
import { TouchableOpacity, ScrollView } from "react-native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Profile from "../../assets/images/B2b/profile.png";
import Icon from "react-native-vector-icons/Ionicons";
import { useIsFocused } from "@react-navigation/native";

import {
  TempleHomeCard,
  MatrimonyHomeCardSubTitle,
  MatrimonyHomeCardTitle,
} from "../../styles/matrimony.styles";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "react-query";
import { UpdateTemple } from "../../store/Handlers/Reducer.Handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASEAPIURL, BASEIMGURL } from "../../infrastructure/constants";
import FilterMenu from "./FilterMenu";

const PanditSpecificTempleList = ({ navigation }) => {
  const { user } = useSelector((state) => state.user);
  const token = useSelector((state) => state.user.token);
  const userType = useSelector((state) => state.user.user.userType);
  const user_pandit_id = user.roleData._id;
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const [panditTemples, setPanditTemples] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const fetchPanditTemples = async () => {
    const queryParams = new URLSearchParams();
    queryParams.append("panditId", user.roleData._id);
    const queryString = queryParams.toString();
    const url = `${BASEAPIURL}/temple?${queryString}`;

    console.log("Fetching temples with URL:", url);
    try {
      setLoadingAnimation(true);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Temples data :", data);

        setPanditTemples(data);
      } else {
        throw new Error("Failed to fetch temples");
      }
    } catch (error) {
      console.error("Error fetching temples:", error);
    } finally {
      setLoadingAnimation(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchPanditTemples();
    }
  }, [isFocused]);
  return (
    <ScrollView>
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{ color: Theme.themeColor, fontSize: 20, fontWeight: "bold" }}
          >
            Your Temples
          </TopText>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("MyProfile");
            }}
          >
            <Image
              source={Profile}
              style={{ width: 35, height: 35, marginRight: 10 }}
            />
          </TouchableOpacity>
        </View>
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
      ) : panditTemples.connectedTemples.length > 0 ? (
        <View style={{ flex: 1 }}>
          <FlatList
            style={{
              marginTop: 16,
              marginLeft: 16,
              marginRight: 16,
              flex: 1,
            }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            data={panditTemples.connectedTemples}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={async () => {
                  setRefreshing(true);
                  fetchTemples();
                  setRefreshing(false);
                }}
              />
            }
            renderItem={({ item, index }) => {
              // if (item.status === "accepted") {
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("TempleDetails", { templeinfo: item })
                  }
                  key={index}
                >
                  <TempleHomeCard>
                    <ImageBackground
                      source={
                        item.images.length > 0
                          ? { uri: `${item.images[0]}` }
                          : ""
                      }
                      resizeMode="cover"
                      imageStyle={{
                        borderRadius: 16,
                      }}
                      style={{
                        height: 400,
                      }}
                    >
                      <LinearGradient
                        colors={["#00000000", "#545454"]}
                        style={{
                          height: "100%",
                          width: "100%",
                          borderBottomLeftRadius: 16,
                          borderBottomRightRadius: 16,
                        }}
                      ></LinearGradient>
                    </ImageBackground>

                    <Card.Content
                      style={{
                        position: "absolute",
                        bottom: 10,
                        borderRadius: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <View>
                        <MatrimonyHomeCardTitle>
                          {item.templeName}
                        </MatrimonyHomeCardTitle>
                        {/* <MatrimonyHomeCardSubTitle> */}
                        <View style={{ display: "flex", flexDirection: "row" }}>
                          <Ionicons name="location" color="#F9C620" size={20} />
                          <Text
                            style={{
                              fontSize: 16,
                              color: "white",
                              marginLeft: 10,
                              textTransform: "uppercase",
                            }}
                          >
                            {item.city}
                          </Text>
                        </View>
                        {/* </MatrimonyHomeCardSubTitle> */}
                      </View>
                    </Card.Content>
                  </TempleHomeCard>
                </TouchableOpacity>
              );
              // }
            }}
          />
        </View>
      ) : (
        <ScrollView>
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center",
                width: "100%",
                marginTop: 50,
              }}
            >
              You are not Connected To Any Temple
            </Text>
          </View>
        </ScrollView>
      )}
    </ScrollView>
  );
};

export default PanditSpecificTempleList;
