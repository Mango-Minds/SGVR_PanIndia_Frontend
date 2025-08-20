import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import { IconButton } from "react-native-paper";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TopText } from "../../styles/social.styles";
import Profile from "../../assets/images/B2b/profile.png";
import { Row } from "../../styles/dashboard.styles";
import { debounce } from "lodash";
import Icon from "react-native-vector-icons/Ionicons";
import { BASEIMGURL } from "../../infrastructure/constants";
import UserImg from "../../assets/images/general/user.png";
import { ScrollView } from "react-native-gesture-handler";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useIsFocused } from "@react-navigation/native";
import { decode } from "base-64";
import { BASEAPIURL } from "../../infrastructure/constants";

const Tab = createBottomTabNavigator();

const DesignerHome = ({ navigation }) => {
  const SearchWorker = async ({ searchTerm }) => {
    setSearch(searchTerm);
  };

  const navigateToAllProducts = () => {
    navigation.navigate("EachShopAllProductsScreen");
  };

  const searchDebounce = useCallback(debounce(SearchWorker, 1200), []);

  const handleSearch = (e) => {
    searchDebounce({ searchTerm: e });
  };
  const [selectedTab, setSelectedTab] = useState("Designers");

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
  };
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleConnect = () => {
    toggleModal();
  };

  const handleChat = () => {
    console.log("Chat");
    toggleModal();
  };

  const [vendors, setVendors] = useState([]);
  const [designers, setDesigners] = useState([]);

  const token = useSelector((state) => state.user.token);
  const isFocused = useIsFocused();
  const tokenPayload = token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));
  const designerId = decodedPayload.id;
  const user = useSelector((state) => state.user.user);
  const fromDesignerId = useSelector((state) => state.user.user.roleData._id);

  const fromVendorId = user?.roleData?._id;

  const loggedInUserId = decodedPayload.id;
  console.log("Logged in user id: ", loggedInUserId);

  const userType = decodedPayload.userType;
  console.log("User Type: ", userType);

  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [selectedDesignerId, setSelectedDesignerId] = useState(null);
  const [isRequestSent, setIsRequestSent] = useState(false);

  const handleVendorConnect = async (toVendorId) => {
    try {
      console.log("Connecting to vendor with ID:", toVendorId);
      console.log("Vendor idd: ", selectedVendorId);
      console.log("DesignerId: ", fromDesignerId);
      console.log("usertype: ", userType);

      const response = await fetch(
        `${BASEAPIURL}/vendorjewelrydesigneroperations/create-jewelrydesigner-vendor-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            jewelryDesignerId: fromDesignerId,
            vendorId: toVendorId,
            createdBy: userType,
          }),
        }
      );

      if (response.ok) {
        setIsRequestSent(true);
        Alert.alert("Success", "Connection request sent successfully", [
          {
            text: "OK",
            onPress: () => {
              toggleModal();
            },
          },
        ]);
      } else {
        console.error("Failed to send connection request");
      }
    } catch (error) {
      console.error("Error connecting to user:", error);
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchDesigners();
  }, [isFocused]);

  const userId = useSelector(
    (state) =>
      state.user.user &&
      state.user.user.roleData &&
      state.user.user.roleData._id
  );
  console.log("User id: ", userId);
  const [connectedVendors, setConnectedVendors] = useState([]);

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${BASEAPIURL}/vendor`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userVendors = data.filter(
          (vendor) =>
            vendor.connectedJewelryDesigners &&
            vendor.connectedJewelryDesigners.includes(userId)
        );
        const otherVendors = data.filter(
          (vendor) =>
            !vendor.connectedJewelryDesigners ||
            !vendor.connectedJewelryDesigners.includes(userId)
        );
        setConnectedVendors(userVendors);
        setVendors(otherVendors);
      } else {
        throw new Error("Failed to fetch vendors");
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const fetchDesigners = async () => {
    try {
      const response = await fetch(`${BASEAPIURL}/jewelryDesigner`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetch Designers Data: ", data);
        const filteredDesigners = data.filter(
          (designer) => designer._id !== userId
        );
        console.log("Filtered Designers Data: ", filteredDesigners);
        setDesigners(filteredDesigners);
      } else {
        throw new Error("Failed to fetch Designers");
      }
    } catch (error) {
      console.error("Error fetching Designers:", error);
    }
  };

  const jeweleryTools = [
    {
      id: 1,
      name: "Jewelry Pliers",
      image:
        "data:image/jpeg;base64,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",
      product_price: "Rs. 1000",
      about: "These pliers are essential for bending and shaping wire.",
      category: "Tools",
      dimensions: {
        length: "6 inches",
        weight: "0.5 lbs",
      },
      material: "Steel",
      available: true,

      specifications: {
        handle_type: "Rubberized",
        color: "Black",
      },
    },
    {
      id: 2,
      name: "Wire Cutters",
      image:
        "https://media.istockphoto.com/id/1152789207/photo/close-up-of-senior-woman-making-jewellery-earrings-at-home.webp?a=1&b=1&s=612x612&w=0&k=20&c=de05S5ttJM71_SfUQVPrRsH4QCP0-Rnjm6wRjYbpDFQ=",

      product_price: "Rs. 1000",
      about: "These pliers are essential for bending and shaping wire.",
      category: "Tools",
      dimensions: {
        length: "6 inches",
        weight: "0.5 lbs",
      },
      material: "Steel",
      available: true,

      specifications: {
        handle_type: "Rubberized",
        color: "Black",
      },
    },
    {
      id: 3,
      name: "Staple Wire",
      image:
        "https://media.istockphoto.com/id/1003612070/photo/different-goldsmiths-tools-on-the-jewelry-workplace-jeweler-at-work-in-jewelry.webp?a=1&b=1&s=612x612&w=0&k=20&c=G-rgPtRRh4L05rdPR_y0T5_kRngMLD4T8Fm5vZ_AbPo=",

      product_price: "Rs. 1000",
      about: "These pliers are essential for bending and shaping wire.",
      category: "Tools",
      dimensions: {
        length: "6 inches",
        weight: "0.5 lbs",
      },
      material: "Steel",
      available: true,

      specifications: {
        handle_type: "Rubberized",
        color: "Black",
      },
    },
    {
      id: 4,
      name: "Stone Picker",
      image:
        "https://images.unsplash.com/photo-1609619742069-f5e18afeef17?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amV3ZWxyeSUyMG1ha2luZ3xlbnwwfHwwfHx8MA%3D%3D",
      about:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",

      product_price: "Rs. 1000",
    },
  ];
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
              style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
            >
              Jewellery
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
                console.log("Designers before navigation:", designers);
                navigation.navigate("MyProfile");
              }}
            >
              <Image
                source={Profile}
                style={{ width: 35, height: 35, marginRight: 10 }}
              />
            </TouchableOpacity>

            <IconButton
              icon="bell-outline"
              style={{ marginLeft: "auto" }}
              onPress={() => {
                navigation.navigate("JewelleryNotifications", {
                  designerId,
                });
              }}
            />
          </View>
        </RowBetween>
      </View>

      <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
        <SearchField placeholder="Search" onChangeText={handleSearch} />
        <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
          <Icon name="search" size={24} />
        </View>
      </Row>

      <View style={styles.tabsContainer}>
        {["Designers", "Vendors"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabPress(tab)}
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

      <View>
        {selectedTab === "Vendors" && (
          <View
            style={[
              styles.shadowProp,
              {
                padding: "4%",
                paddingTop: "10%",
                margin: "4%",
                marginBottom: "0%",
              },
            ]}
          >
            <Text
              style={{
                position: "absolute",
                top: 10,
                left: 20,
                color: "grey",
                fontSize: 14,
              }}
            >
              My Vendors{" >"}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={connectedVendors.length > 2}
            >
              <View style={{ flexDirection: "row" }}>
                {console.log("Connected Vendors: ", connectedVendors)}
                {connectedVendors.map((vendor, index) => (
                  <View
                    key={vendor.id}
                    style={{ alignItems: "center", marginRight: 18 }}
                  >
                    <TouchableOpacity
                      key={index}
                      onPress={() =>
                        navigation.navigate("EachVendor", {
                          vendor: vendor,
                          vendorId: vendor._id,
                        })
                      }
                      style={{ position: "relative" }}
                    >
                      <Image
                        style={{
                          width: 90,
                          height: 100,
                          borderRadius: 8,
                          marginBottom: 4,
                        }}
                        source={
                          vendor.owner && vendor.owner.image
                            ? {
                                uri: `${BASEIMGURL}${vendor.owner.image}`,
                              }
                            : UserImg
                        }
                      />
                      <Text style={{ fontWeight: "600", opacity: 0.4 }}>
                        {console.log("Name: ", vendor.username)}
                        {vendor.username.length > 15
                          ? `${vendor.username.substring(0, 15)}...`
                          : vendor.username}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {selectedTab === "Vendors" && (
        <View
          style={[
            styles.shadowProp,
            {
              backgroundColor: "#e6f9ff",
              padding: "2%",
              margin: "4%",
              display: "flex",
              flexDirection: "row",
              flex: 1,
            },
          ]}
        >
          <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
            {vendors.map((vendor) => (
              <TouchableOpacity
                key={vendor._id}
                onPress={() => {
                  navigation.navigate("EachVendor", {
                    vendor: vendor,
                    vendorId: vendor._id,
                  });
                }}
              >
                <View
                  style={[
                    {
                      margin: "4%",
                      display: "flex",
                      flexDirection: "row",
                    },
                  ]}
                >
                  <Image
                    style={{
                      width: 60,
                      height: 65,
                      borderRadius: 8,
                      opacity: 1,
                    }}
                    source={
                      vendor.owner && vendor.owner.image
                        ? {
                            uri: `${BASEIMGURL}${vendor.owner.image}`,
                          }
                        : UserImg
                    }
                  />
                  <View style={{ flexDirection: "column", marginLeft: "10%" }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        opacity: 0.7,
                        // marginLeft: "10%",
                        marginTop: "2%",
                        fontSize: 17,
                      }}
                    >
                      {vendor.username}
                    </Text>
                    <View style={{ flexDirection: "column", marginTop: "5%" }}>
                      {/* <View style={{ marginTop: "0%", flexDirection: "row" }}> */}
                      <Text
                        style={{
                          fontWeight: "600",
                          marginTop: "0%",
                          // marginLeft: "10%",
                          opacity: 0.4,
                        }}
                      >
                        {vendor.owner.address
                          ? vendor.owner.address
                          : "No Address"}
                      </Text>
                      {/* </View> */}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedVendorId(vendor._id);
                      toggleModal();
                    }}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      zIndex: 999,
                    }}
                  >
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={24}
                      color="gray"
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible && selectedTab === "Vendors"}
        onRequestClose={toggleModal}
      >
        <TouchableOpacity style={styles.modalBackground} onPress={toggleModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                onPress={() => {
                  handleVendorConnect(selectedVendorId, designerId, userType);
                }}
                style={styles.option}
              >
                <Ionicons
                  name="person-add-outline"
                  size={24}
                  color="black"
                  style={styles.icon}
                />
                <Text style={styles.optionText}>Connect</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleChat} style={styles.option}>
                <Ionicons
                  name="chatbox-outline"
                  size={24}
                  color="black"
                  style={styles.icon}
                />
                <Text style={styles.optionText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <View>
        {selectedTab === "Designers" && (
          <View
            style={[
              styles.shadowProp,
              {
                padding: "6%",
                paddingTop: "10%",
                margin: "4%",
                marginBottom: "0%",
                display: "flex",
                flexDirection: "row",
              },
            ]}
          >
            <Text
              style={{
                position: "absolute",
                top: 10,
                left: 20,
                color: "grey",
                fontSize: 14,
              }}
            >
              My Tools{" >"}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={jeweleryTools.length > 2}
            >
              <View style={{ flexDirection: "row" }}>
                {jeweleryTools.map((item, index) => (
                  <View
                    key={index}
                    style={{ alignItems: "center", marginRight: 18 }}
                  >
                    <TouchableOpacity
                      key={index}
                      onPress={() =>
                        navigation.navigate("ToolsProduct", {
                          tool: item,
                        })
                      }
                      style={{ position: "relative" }}
                    >
                      <Image
                        style={{
                          width: 90,
                          height: 100,
                          borderRadius: 8,
                          marginBottom: 4,
                        }}
                        source={{ uri: item.image }}
                      />
                      <Text style={{ fontWeight: "600", opacity: 0.4 }}>
                        {item.name.length > 15
                          ? `${item.name.substring(0, 15)}...`
                          : item.name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {selectedTab === "Designers" && (
        <>
          <View
            style={[
              styles.shadowProp,
              {
                backgroundColor: "#e6f9ff",
                padding: "2%",
                margin: "4%",
                display: "flex",
                flexDirection: "row",
                flex: 1,
              },
            ]}
          >
            <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
              {designers.map((designer) => (
                <TouchableOpacity
                  key={designer._id}
                  onPress={() =>
                    navigation.navigate("EachDesigner", {
                      designer: designer,
                      designerId: designer._id,
                    })
                  }
                  style={{ position: "relative" }}
                >
                  <View
                    style={[
                      {
                        margin: "4%",
                        display: "flex",
                        flexDirection: "row",
                      },
                    ]}
                  >
                    <Image
                      style={{
                        width: 60,
                        height: 65,
                        borderRadius: 8,
                        opacity: 1,
                      }}
                      source={
                        designer.owner && designer.profileImage
                          ? {
                              uri: `${BASEIMGURL}${designer.profileImage}`,
                            }
                          : UserImg
                      }
                    />
                    <View
                      style={{ flexDirection: "column", marginLeft: "10%" }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          opacity: 0.7,

                          marginTop: "2%",
                          fontSize: 17,
                        }}
                      >
                        {designer.owner.firstName} {designer.owner.lastName}
                      </Text>
                      <View
                        style={{ flexDirection: "column", marginTop: "5%" }}
                      >
                        <Text
                          style={{
                            fontWeight: "600",
                            marginTop: "0%",

                            opacity: 0.4,
                          }}
                        >
                          {designer.owner.address
                            ? designer.owner.address
                            : "No Address"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible && selectedTab === "Workers"}
        onRequestClose={toggleModal}
      >
        <TouchableOpacity style={styles.modalBackground} onPress={toggleModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={handleConnect} style={styles.option}>
                <Ionicons
                  name="person-add-outline"
                  size={24}
                  color="black"
                  style={styles.icon}
                />
                <Text style={styles.optionText}>Connect</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleChat} style={styles.option}>
                <Ionicons
                  name="chatbox-outline"
                  size={24}
                  color="black"
                  style={styles.icon}
                />
                <Text style={styles.optionText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.bottomBarContainer}>
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => navigation.navigate("Main")}
          >
            <Ionicons name="home-outline" size={24} color="#b98c13" />
            <Text style={[styles.iconText, { color: "#b98c13" }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconContainer}>
            <Ionicons name="list-outline" size={24} color="gray" />
            <Text style={[styles.iconText, { color: "gray" }]}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconContainer}>
            <Ionicons name="settings-outline" size={24} color="gray" />
            <Text style={[styles.iconText, { color: "gray" }]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DesignerHome;
const styles = StyleSheet.create({
  Catagory: {
    marginHorizontal: 10,
    marginVertical: 15,
  },
  CatagoryText: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 10,
    textAlign: "center",
    color: "#616161",
  },
  StockCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 5,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 2,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  stockImage: {
    width: 90,
    height: 90,
    marginRight: 10,
  },
  stockName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#141414",
    marginBottom: 10,
  },
  stockspecs: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "73%",
  },
  stockdetails: {
    fontSize: 13,
    fontWeight: "600",
    color: "#616161",
    opacity: 0.5,
  },
  stocklocation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  stockloacaiontext: {
    fontSize: 13,
    fontWeight: "600",
    color: "#616161",
    opacity: 0.8,
  },
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

  shadowProp: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1.41,
    elevation: 2,
  },

  bottomBarContainer: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
  },

  iconText: {
    marginTop: 4,
  },
  icon: {
    marginRight: 10,
    marginTop: 3,
    marginLeft: 20,
  },
  circleImage: {
    width: 50,
    height: 50,
    borderRadius: 45,
    overflow: "hidden",
    marginBottom: 5,
    borderWidth: 0.1,
    borderColor: "gray",
  },
  chatIconBackground: {
    width: 60,
    height: 30,
    borderRadius: 22,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "lightgray",
    borderRadius: 10,
    width: 250,
    opacity: 1.5,
    height: 40,
    fontWeight: "bold",
  },
  optionText: {
    fontSize: 18,
  },
  closeButton: {
    position: "absolute",
    top: 1,
    right: 8,
  },
});
