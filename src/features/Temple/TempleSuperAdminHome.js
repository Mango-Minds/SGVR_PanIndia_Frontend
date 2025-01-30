import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ImageBackground,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import { Container, RowBetween } from "../../styles/common.styles";
import { IconButton } from "react-native-paper";
import { Ionicons } from "react-native-vector-icons";
import { TopText } from "../../styles/social.styles";
import { BASEAPIURL, BASEIMGURL } from "../../infrastructure/constants";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import {
  TempleHomeCard,
  MatrimonyHomeCardTitle,
} from "../../styles/matrimony.styles"; // Adjust import paths as necessary
import { Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const TempleSuperAdminHome = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState("Temples");
  const [temples, setTemples] = useState([]);
  const [shops, setShops] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTempleData = async () => {
    try {
      const response = await axios.get(`${BASEAPIURL}/temple`);
      setTemples(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching temple data:", error);
      setTemples([]);
    }
  };

  const fetchShops = async () => {
    try {
      const response = await axios.get(`${BASEAPIURL}/templeShops`);
      setShops(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching shops data:", error);
      setShops([]);
    }
  };

  useEffect(() => {
    if (selectedTab === "Temples") {
      fetchTempleData();
    } else if (selectedTab === "Shops") {
      fetchShops();
    }
  }, [selectedTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedTab === "Temples") {
      await fetchTempleData();
    } else if (selectedTab === "Shops") {
      await fetchShops();
    }
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ paddingHorizontal: 10 }}>
        <RowBetween style={{ paddingTop: 24 }}>
          <View style={{ alignItems: "center", flexDirection: "row" }}>
            <IconButton
              icon="arrow-left"
              onPress={() => navigation.goBack()}
            />
            <TopText
              style={{
                color: "#D4AF37",
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              Temple
            </TopText>
          </View>
        </RowBetween>
      </View>

      <View style={styles.tabsContainer}>
        {["Temples", "Shops", "Events"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[styles.tab, selectedTab === tab ? styles.selectedTab : {}]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab ? styles.selectedTabText : {},
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conditional rendering based on selectedTab */}
      {selectedTab === "Temples" && (
        <ScrollView
          vertical={true}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {temples.length > 0 ? (
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
                data={temples}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate("TempleDetails", {
                        templeinfo: item,
                      })
                    }
                    key={index}
                  >
                    <TempleHomeCard>
                      <ImageBackground
                        source={
                          item.images.length > 0
                            ? { uri: `${BASEIMGURL}${item.images[0]}` }
                            : ""
                        }
                        resizeMode="cover"
                        imageStyle={{ borderRadius: 16 }}
                        style={{ height: 400 }}
                      >
                        <LinearGradient
                          colors={["#00000000", "#545454"]}
                          style={{
                            height: "100%",
                            width: "100%",
                            borderBottomLeftRadius: 16,
                            borderBottomRightRadius: 16,
                          }}
                        />
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

                          <View style={{ flexDirection: "row" }}>
                            <Ionicons
                              name="location"
                              color="#F9C620"
                              size={20}
                            />
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
                        </View>
                      </Card.Content>
                    </TempleHomeCard>
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : (
            <View style={{ marginTop: 50, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                No Temple Found
              </Text>
            </View>
          )}
        </ScrollView>
      )}
      {selectedTab === "Shops" && (
        <ScrollView
          vertical={true}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {shops.length > 0 ? (
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
                data={shops}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate("EachShopProfile", {
                        shop: item,
                        shopId: item._id,
                      })
                    }
                    key={index}
                  >
                    <View
                      style={{
                        marginVertical: "4%",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        style={{
                          width: 60,
                          height: 65,
                          borderRadius: 8,
                          marginRight: "10%",
                        }}
                        source={
                          item.image
                            ? { uri: `${BASEIMGURL}${item.image}` }
                            : require("../../assets/images/general/user.png")
                        }
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontWeight: "bold",
                            opacity: 0.7,
                            fontSize: 17,
                          }}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={{
                            fontWeight: "600",
                            opacity: 0.4,
                            marginTop: "2%",
                          }}
                        >
                          {item.address}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : (
            <View style={{ marginTop: 50, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                No Shops Found
              </Text>
            </View>
          )}
        </ScrollView>
      )}
      {selectedTab === "Events" && (
        <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
          {/* Events UI components */}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  selectedTab: {
    backgroundColor: "#D4AF37",
  },
  tabText: {
    color: "black",
  },
  selectedTabText: {
    color: "white",
  },
});

export default TempleSuperAdminHome;
