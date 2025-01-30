import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import { IconButton } from "react-native-paper";
import { Ionicons } from "react-native-vector-icons";
import { TopText } from "../../styles/social.styles";
import Profile from "../../assets/images/B2b/profile.png";
import SelectDropdown from "react-native-select-dropdown";

import { Row } from "../../styles/dashboard.styles";
import CustomCarousel from "../../components/dashboard/CustomCarousel";
import FilterMenu from "../../components/Jewellery/FilterMenu";
import { debounce } from "lodash";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ScrollView } from "react-native-gesture-handler";
import Shop from "../../assets/images/Store/shop.png";
import Retailer from "../../assets/images/Store/retailer.png";
import Gems from "../../assets/images/Store/gems.png";
import Tool from "../../assets/images/Store/tool.png";
import Worker from "../../assets/images/Store/worker.png";
import Bullions from "../../assets/images/Store/bullion.png";
import J1 from "../../assets/images/Store/avatar.png";
import J2 from "../../assets/images/Store/avatar1.png";
import EachShopAllProductsScreen from "./EachShopAllProductsScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import EachWorker from "./EachWorker";
import Banner from "./Banner";
import { useIsFocused } from "@react-navigation/native";
import { BASEAPIURL } from "../../infrastructure/constants";
import { BASEIMGURL } from "../../infrastructure/constants";
import { useSelector } from "react-redux";
import UserImg from "../../assets/images/general/user.png";
import axios from "axios";

const Tab = createBottomTabNavigator();

const SuperAdminHome = ({ navigation }) => {
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
  const [selectedTab, setSelectedTab] = useState("Vendors");

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
  };
  const navigateToVendorProfile = () => {
    // navigation.navigate('VendorProfile');
    navigation.navigate("OtherVendorProfile");
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

  const [imageVisible, setImageVisible] = useState(true);

  const toggleImageVisibility = () => {
    setImageVisible(!imageVisible);
  };

  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };
  const [activeButton, setActiveButton] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("Pending");

  const statusOptions = [
    { title: "Accepted", icon: "checkmark-circle", color: "#7AB163" }, // Green color
    { title: "Rejected", icon: "close-circle", color: "#ff0000" }, // Red color
    { title: "Pending", icon: "time-outline", color: "#ffa500" }, // Orange color
  ];

  const [activeFilter, setActiveFilter] = useState("Category");
  const [selectedOptions, setSelectedOptions] = useState([]);

  const filters = [
    { name: "Category", options: ["Gold", "Silver", "Diamond"] },
    { name: "Type", options: ["Ring", "Necklace", "Earings"] },
    
    {
      name: "Price",
      options: ["Below 20000", "30000-50000", "50000-70000", "Above 70000"],
    },
   
  ];

  const handleFilterClick = (filterName) => {
    setActiveFilter(filterName);
  };

  const handleOptionClick = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleButtonPress = (buttonName) => {
    setActiveButton(buttonName);
    if (buttonName === "clear") {
      setSelectedOptions([]);
      console.log("Clear Filters");
    }
  };

  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Pending");
  const options = ["Rejected", "Approved", "Pending"];
  const [dropdownStates, setDropdownStates] = useState({});

  const handleDropdownPress = (event, vendorId) => {
    event.stopPropagation();
    setDropdownStates((prevState) => ({
      ...prevState,
      [vendorId]: !prevState[vendorId], // Toggle dropdown state for the selected vendor
    }));
  };

  const handleOptionSelect = (event, option) => {
    event.stopPropagation();
    setSelectedOption(option);
    setDropdownVisible(false); // Close dropdown after selection
  };

  // Filter out the selected option from the list of options
  const remainingOptions = options.filter(
    (option) => option !== selectedOption
  );

  const token = useSelector((state) => state.user.token);
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const isFocused = useIsFocused();

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
        console.log("vendors data:",data)
        setVendors(data);
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
        console.log("Workers Data: ", data);
        setWorkers(data);
      } else {
        console.error("Failed to fetch workers. Status:", response.status);

        const errorMessage = await response.text();
        console.error("Error message from server:", errorMessage);

        throw new Error("Failed to fetch workers");
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  const fetchShops = async () => {
    try {
      const response = await fetch(`${BASEAPIURL}/shop`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Shops Data: ", data);

        setShops(data);
      } else {
        throw new Error("Failed to fetch workers");
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  const [vendors, setVendors] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [shops, setShops] = useState([]);

  useEffect(() => {
    if (isFocused) {
      if (selectedTab === "Vendors") {
        fetchVendors();
      } else if (selectedTab === "Shops") {
        fetchShops();
      } else if (selectedTab === "Workers") {
        fetchWorkers();
      }
    }
  }, [isFocused, selectedTab]);

  const handleVendorStatusChange = async (vendorId, selectedItem) => {
    try {
      const response = await fetch(`${BASEAPIURL}/vendor/update/${vendorId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: selectedItem.title.toLowerCase(),
        }),
      });
      console.log(response);

      if (!response.ok) {
        throw new Error("Failed to update vendor status");
      }
      fetchVendors();
    } catch (error) {
      console.error("Failed to update vendor status:", error);
    }
  };

  const handleShopStatusChange = async (shopId, selectedItem) => {
    try {
      const response = await fetch(`${BASEAPIURL}/shop/update/${shopId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: selectedItem.title.toLowerCase(),
        }),
      });
      console.log(response);

      if (!response.ok) {
        throw new Error("Failed to update shop status");
      }

      // Fetch updated vendors list
      fetchVendors();
    } catch (error) {
      console.error("Failed to update shop status:", error);
    }
  };

  const handleWorkerStatusChange = async (workerId, selectedItem) => {
    try {
      const response = await fetch(`${BASEAPIURL}/worker/update/${workerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: selectedItem.title.toLowerCase(),
        }),
      });
      console.log(response);

      if (!response.ok) {
        throw new Error("Failed to update worker status");
      }

      // Fetch updated vendors list
      fetchVendors();
    } catch (error) {
      console.error("Failed to update worker status:", error);
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
            <Icon
              name="search"
              size={24}
              style={{ marginRight: 15, color: "grey" }}
              onPress={toggleSearch}
            />
            {/* <TouchableOpacity onPress={() => navigation.navigate("MyProfile")}>
              <Image
                source={Profile}
                style={{ width: 35, height: 35, marginRight: 10 }}
              />
            </TouchableOpacity>

            <IconButton
              icon="bell-outline"
              style={{ marginLeft: "auto" }}
            ></IconButton> */}
          </View>
        </RowBetween>
      </View>
      {isSearchVisible && (
        <View
          style={{
            alignItems: "center",
            marginLeft: 16,
            marginRight: 16,
            marginBottom: 10,
          }}
        >
          <SearchField placeholder="Search" onChangeText={handleSearch} />
        </View>
      )}
      {/* <Banner /> */}
      <View style={styles.tabsContainer}>
        {["Vendors", "Workers", "Shops"].map((tab) => (
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

      {/*  Vendors  */}

      {selectedTab === "Vendors" && (
        <View
          style={[
            // styles.shadowProp,
            {
              // backgroundColor: "#e6f9ff",
              padding: "2%",
              margin: "2%",
              display: "flex",
              flexDirection: "row",
              flex: 1,
            },
          ]}
        >
          <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
            {vendors.map((vendor, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  navigation.navigate("EachVendor", {
                    vendor: vendor,
                    vendorId: vendor.owner._id,
                  });
                }}
              >
                <View
                  style={[
                    {
                      padding: "4%",
                      display: "flex",
                      flexDirection: "row",
                      borderBottomWidth: 0.5,
                      borderBottomColor: "grey",
                    },
                  ]}
                >
                  <Image
                    style={{
                      width: 75,
                      height: 84,
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
                  <View
                    style={{
                      flexDirection: "column",
                      marginLeft: "5%",
                      width: "38%",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        opacity: 0.7,
                        marginTop: "2%",
                        fontSize: 17,
                        maxWidth: 170,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {vendor.owner.firstName} {vendor.owner.lastName}
                    </Text>
                    <Text
                      style={{
                        fontWeight: "600",
                        marginTop: "2%",
                        opacity: 0.4,
                        maxWidth: 170,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {vendor.owner.city}
                    </Text>
                    <Text
                      style={{
                        fontWeight: "600",
                        marginTop: "2%",
                        opacity: 1,
                        maxWidth: 170,
                        color: "grey",
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {vendor.owner.phone}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "column",
                      marginLeft: "5%",
                      marginTop: "2%",
                    }}
                  >
                    <Text
                      style={{
                        opacity: 0.6,
                        color: "#d966ff",
                        marginTop: "2%",
                        marginBottom: "5%",
                        fontSize: 14,
                      }}
                    >
                      Status
                    </Text>
                    <SelectDropdown
                      data={statusOptions}
                      onSelect={(selectedItem) =>
                        handleVendorStatusChange(vendor._id, selectedItem)
                      }
                      defaultValueByIndex={statusOptions.findIndex(
                        (option) =>
                          option.title.toLowerCase() ===
                          vendor.status.toLowerCase()
                      )}
                      renderDropdownIcon={(isOpened) => (
                        <Icon
                          name={isOpened ? "chevron-up" : "chevron-down"}
                          size={16}
                          color="#000"
                        />
                      )}
                      buttonTextAfterSelection={(selectedItem) =>
                        selectedItem.title
                      }
                      rowTextForSelection={(item) => item.title}
                      buttonStyle={{
                        width: 105,
                        height: 35,
                        backgroundColor: "white",
                        borderRadius: 8,
                        paddingHorizontal: 4,
                        margin: 0,
                        marginBottom: 0,
                        borderColor: "lightgrey",
                        borderWidth: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      buttonTextStyle={{
                        fontSize: 14,
                        color: "#000",
                        textAlign: "center",
                        paddingHorizontal: 0,
                      }}
                      dropdownStyle={{
                        borderRadius: 8,
                        marginTop: -20,
                      }}
                      rowStyle={{
                        height: 40,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#E9ECEF",
                        paddingHorizontal: 4,
                      }}
                      rowTextStyle={{
                        fontSize: 14,
                        color: "#000",
                        textAlign: "center",
                        paddingHorizontal: 0,
                      }}
                      renderCustomizedRowChild={(item) => (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Icon
                            name={item.icon}
                            size={16}
                            color={item.color}
                            style={{ marginRight: 5 }}
                          />
                          <Text>{item.title}</Text>
                        </View>
                      )}
                      renderCustomizedButtonChild={(selectedItem) => (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Icon
                            name={
                              selectedItem ? selectedItem.icon : "time-outline"
                            }
                            size={16}
                            color={
                              selectedItem ? selectedItem.color : "#ffa500"
                            }
                            style={{ marginRight: 5 }}
                          />
                          <Text>
                            {selectedItem ? selectedItem.title : "Pending"}
                          </Text>
                        </View>
                      )}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 120,
          right: 20,
          backgroundColor: "#1B1212",
          borderRadius: 30,
          width: 55,
          height: 55,
          justifyContent: "center",
          alignItems: "center",
          elevation:10,
        }}
        onPress={toggleMenu}
      >
        <Ionicons name="square" size={24} color="grey" />
        <View style={{ position: "absolute", top: 10, left: 10 }}>
          <Ionicons name="funnel" size={20} color="white" />
        </View>
      </TouchableOpacity>

      <FilterMenu
        menuVisible={menuVisible}
        toggleMenu={toggleMenu}
        filters={filters}
        activeFilter={activeFilter}
        selectedOptions={selectedOptions}
        handleFilterClick={handleFilterClick}
        handleOptionClick={handleOptionClick}
        handleButtonPress={handleButtonPress}
      /> */}

      {selectedTab === "Shops" && (
        <View
          style={[
            // styles.shadowProp,
            {
              // backgroundColor: "#e6f9ff",
              padding: "2%",
              margin: "2%",
              display: "flex",
              flexDirection: "row",
              flex: 1,
            },
          ]}
        >
          <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
            {shops.map((shop, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  navigation.navigate("EachShopProfile", {
                    shop: shop,
                    shopId: shop.owner._id,
                  });
                }}
              >
                <View
                  style={[
                    {
                      padding: "4%",
                      display: "flex",
                      flexDirection: "row",
                      borderBottomWidth: 0.5,
                      borderBottomColor: "grey",
                    },
                  ]}
                >
                  <Image
                    style={{
                      width: 75,
                      height: 84,
                      borderRadius: 8,
                      opacity: 1,
                    }}
                    source={
                      shop.owner && shop.owner.image
                        ? {
                            uri: `${BASEIMGURL}${shop.owner.image}`,
                          }
                        : UserImg
                    }
                  />
                  <View
                    style={{
                      flexDirection: "column",
                      marginLeft: "5%",
                      width: "38%",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        opacity: 0.7,
                        marginTop: "2%",
                        fontSize: 17,
                        maxWidth: 170,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {shop.owner.firstName} {shop.owner.lastName}
                    </Text>
                    <Text
                      style={{
                        fontWeight: "600",
                        marginTop: "2%",
                        opacity: 0.4,
                        maxWidth: 170,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {shop.owner.city}
                    </Text>
                    <Text
                      style={{
                        fontWeight: "600",
                        marginTop: "2%",
                        opacity: 1,
                        maxWidth: 170,
                        color: "grey",
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {shop.owner.phone}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "column",
                      marginLeft: "5%",
                      marginTop: "2%",
                    }}
                  >
                    <Text
                      style={{
                        opacity: 0.6,
                        color: "#d966ff",
                        marginTop: "2%",
                        marginBottom: "5%",
                        fontSize: 14,
                      }}
                    >
                      Status
                    </Text>
                    <SelectDropdown
                      data={statusOptions}
                      onSelect={(selectedItem) =>
                        handleShopStatusChange(shop._id, selectedItem)
                      }
                      defaultValueByIndex={statusOptions.findIndex(
                        (option) =>
                          option.title.toLowerCase() ===
                          shop.status.toLowerCase()
                      )}
                      renderDropdownIcon={(isOpened) => (
                        <Icon
                          name={isOpened ? "chevron-up" : "chevron-down"}
                          size={16}
                          color="#000"
                        />
                      )}
                      buttonTextAfterSelection={(selectedItem) =>
                        selectedItem.title
                      }
                      rowTextForSelection={(item) => item.title}
                      buttonStyle={{
                        width: 105,
                        height: 35,
                        backgroundColor: "white",
                        borderRadius: 8,
                        paddingHorizontal: 4,
                        margin: 0,
                        marginBottom: 0,
                        borderColor: "lightgrey",
                        borderWidth: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      buttonTextStyle={{
                        fontSize: 14,
                        color: "#000",
                        textAlign: "center",
                        paddingHorizontal: 0,
                      }}
                      dropdownStyle={{
                        borderRadius: 8,
                        marginTop: -20,
                      }}
                      rowStyle={{
                        height: 40,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#E9ECEF",
                        paddingHorizontal: 4,
                      }}
                      rowTextStyle={{
                        fontSize: 14,
                        color: "#000",
                        textAlign: "center",
                        paddingHorizontal: 0,
                      }}
                      renderCustomizedRowChild={(item) => (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Icon
                            name={item.icon}
                            size={16}
                            color={item.color}
                            style={{ marginRight: 5 }}
                          />
                          <Text>{item.title}</Text>
                        </View>
                      )}
                      renderCustomizedButtonChild={(selectedItem) => (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Icon
                            name={
                              selectedItem ? selectedItem.icon : "time-outline"
                            }
                            size={16}
                            color={
                              selectedItem ? selectedItem.color : "#ffa500"
                            }
                            style={{ marginRight: 5 }}
                          />
                          <Text>
                            {selectedItem ? selectedItem.title : "Pending"}
                          </Text>
                        </View>
                      )}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedTab === "Workers" && (
        <View
          style={[
            // styles.shadowProp,
            {
              // backgroundColor: "#e6f9ff",
              padding: "2%",
              margin: "2%",
              display: "flex",
              flexDirection: "row",
              flex: 1,
            },
          ]}
        >
          <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
            {workers.map((worker, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  navigation.navigate("EachWorker", {
                    worker: worker,
                    workerId: worker.owner._id,
                  });
                }}
              >
                <View
                  style={[
                    {
                      padding: "4%",
                      display: "flex",
                      flexDirection: "row",
                      borderBottomWidth: 0.5,
                      borderBottomColor: "grey",
                    },
                  ]}
                >
                  <Image
                    style={{
                      width: 75,
                      height: 84,
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
                    style={{
                      flexDirection: "column",
                      marginLeft: "5%",
                      width: "38%",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        opacity: 0.7,
                        marginTop: "2%",
                        fontSize: 17,
                        maxWidth: 170,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {worker.owner.firstName} {worker.owner.lastName}
                    </Text>
                    <Text
                      style={{
                        fontWeight: "600",
                        marginTop: "2%",
                        opacity: 0.4,
                        maxWidth: 170,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {worker.owner.city}
                    </Text>
                    <Text
                      style={{
                        fontWeight: "600",
                        marginTop: "2%",
                        opacity: 1,
                        maxWidth: 170,
                        color: "grey",
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {worker.owner.phone}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "column",
                      marginLeft: "5%",
                      marginTop: "2%",
                    }}
                  >
                    <Text
                      style={{
                        opacity: 0.6,
                        color: "#d966ff",
                        marginTop: "2%",
                        marginBottom: "5%",
                        fontSize: 14,
                      }}
                    >
                      Status
                    </Text>
                    <SelectDropdown
                      data={statusOptions}
                      onSelect={(selectedItem) =>
                        handleWorkerStatusChange(worker._id, selectedItem)
                      }
                      defaultValueByIndex={statusOptions.findIndex(
                        (option) =>
                          option.title.toLowerCase() ===
                          worker.status.toLowerCase()
                      )}
                      renderDropdownIcon={(isOpened) => (
                        <Icon
                          name={isOpened ? "chevron-up" : "chevron-down"}
                          size={16}
                          color="#000"
                        />
                      )}
                      buttonTextAfterSelection={(selectedItem) =>
                        selectedItem.title
                      }
                      rowTextForSelection={(item) => item.title}
                      buttonStyle={{
                        width: 105,
                        height: 35,
                        backgroundColor: "white",
                        borderRadius: 8,
                        paddingHorizontal: 4,
                        margin: 0,
                        marginBottom: 0,
                        borderColor: "lightgrey",
                        borderWidth: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      buttonTextStyle={{
                        fontSize: 14,
                        color: "#000",
                        textAlign: "center",
                        paddingHorizontal: 0,
                      }}
                      dropdownStyle={{
                        borderRadius: 8,
                        marginTop: -20,
                      }}
                      rowStyle={{
                        height: 40,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#E9ECEF",
                        paddingHorizontal: 4,
                      }}
                      rowTextStyle={{
                        fontSize: 14,
                        color: "#000",
                        textAlign: "center",
                        paddingHorizontal: 0,
                      }}
                      renderCustomizedRowChild={(item) => (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Icon
                            name={item.icon}
                            size={16}
                            color={item.color}
                            style={{ marginRight: 5 }}
                          />
                          <Text>{item.title}</Text>
                        </View>
                      )}
                      renderCustomizedButtonChild={(selectedItem) => (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Icon
                            name={
                              selectedItem ? selectedItem.icon : "time-outline"
                            }
                            size={16}
                            color={
                              selectedItem ? selectedItem.color : "#ffa500"
                            }
                            style={{ marginRight: 5 }}
                          />
                          <Text>
                            {selectedItem ? selectedItem.title : "Pending"}
                          </Text>
                        </View>
                      )}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {!menuVisible && (
        <View style={styles.bottomBarContainer}>
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.iconContainer}>
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
      )}
    </SafeAreaView>
  );
};

export default SuperAdminHome;
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
