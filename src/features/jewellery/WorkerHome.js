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

const WorkerHome = ({ navigation }) => {
  
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
  const [selectedTab, setSelectedTab] = useState("Workers");
  
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
  const [workers, setWorkers] = useState([]);
  const [workerProducts, setWorkerProducts] = useState([]);
  
  const fetchWorkerProducts = async () => {
    try {
      const response = await fetch(`${BASEAPIURL}/jewelry-products?workers=["${fromWorkerId}"]`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to fetch products: ${errorMessage}`);
      }
      const data = await response.json();
      const limitedProducts = data.data.slice(0, 4);
      setWorkerProducts(limitedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  
  
  useEffect(() => {
    fetchWorkerProducts(); 
  }, []);
  
  const token = useSelector((state) => state.user.token);
  const isFocused = useIsFocused();
  const tokenPayload = token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));
  const workerId = decodedPayload.id;
  const user = useSelector((state) => state.user.user);
  const fromWorkerId = useSelector((state) => state.user.user.roleData._id);

  const fromVendorId = user?.roleData?._id;


  const loggedInUserId = decodedPayload.id;
  console.log("Logged in user id: ", loggedInUserId);


  const userType = decodedPayload.userType;
  console.log("User Type: ", userType);

  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [isRequestSent, setIsRequestSent] = useState(false);

  
  

  const handleVendorConnect = async (toVendorId) => {
    try {
      console.log("Connecting to vendor with ID:", toVendorId);
      console.log("Vendor idd: ", selectedVendorId);
      console.log("WId: ", fromWorkerId);
      console.log("usertype: ", userType);

      const response = await fetch(
        `${BASEAPIURL}/vendorWorkerOperations/create-worker-vendor-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            vendorId: toVendorId,
            workerId: fromWorkerId,
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
    fetchWorkers();
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
            vendor.connectedWorkers && vendor.connectedWorkers.includes(userId)
        );
        const otherVendors = data.filter(
          (vendor) =>
            !vendor.connectedWorkers ||
            !vendor.connectedWorkers.includes(userId)
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
        const filteredWorkers = data.filter(
          (worker) => worker.owner._id !== loggedInUserId
        );
        setWorkers(filteredWorkers);
        
      } else {
        throw new Error("Failed to fetch workers");
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
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
            <TouchableOpacity onPress={() => navigation.navigate("MyProfile")}>
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
                  workerId,
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
        {["Workers", "Vendors"].map((tab) => (
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={connectedVendors.length > 2}>
              <View style={{ flexDirection: "row" }}>
                {connectedVendors.map((vendor, index) => (
                  <View
                    key={vendor.id}
                    style={{ alignItems: "center", marginRight: 18 }}
                  >
                    <TouchableOpacity
                      key={index}
                      onPress={() =>
                        navigation.navigate("EachVendor", { vendor: vendor,  vendorId: vendor._id })
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
                  handleVendorConnect(selectedVendorId, workerId, userType);
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
        {selectedTab === "Workers" && (
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
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 10,
                left: 20,
                color: "grey",
                fontSize: 14,
              }}
              onPress={() => {
                navigation.navigate("EachShopAllProducts", {
                  userType: user.userType,
                  ownerId: user.roleData._id,
                });
              }}
            >
              <Text>My Products{" >"}</Text>
            </TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={workerProducts.length > 2}>
              <View style={{ flexDirection: "row" }}>
                {workerProducts.map((product, index) => (
                  <View
                    key={product.id}
                    style={{ alignItems: "center", marginRight: 18 }}
                  >
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        navigation.navigate("EachProduct", {
                          productId: product._id,
                          product: product,
                        });
                      }}
                      style={{ position: "relative" }}
                    >
                      <Image
                        style={{
                          width: 90,
                          height: 100,
                          borderRadius: 8,
                          marginBottom: 4,
                        }}
                        source={{ uri: `${BASEIMGURL}${product.images[0]}` }}
                      />
                      <Text
                        style={{
                          fontWeight: "600",
                          opacity: 0.4,
                          textAlign: "center",
                        }}
                      >
                        {product.name.length > 15
                          ? `${product.name.substring(0, 15)}...`
                          : product.name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {selectedTab === "Workers" && (
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
              {workers.map((worker) => (
                <TouchableOpacity
                  key={worker._id}
                  onPress={() =>
                    navigation.navigate("EachWorker", { worker: worker, workerId: worker._id })
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
                        worker.owner && worker.owner.image
                          ? {
                              uri: `${BASEIMGURL}${worker.owner.image}`,
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
                        {worker.owner.firstName} {worker.owner.lastName}
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
                          {worker.owner.address}
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

export default WorkerHome;
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
