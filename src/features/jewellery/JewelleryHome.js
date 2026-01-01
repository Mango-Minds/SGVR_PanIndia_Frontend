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
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import Checkbox from "expo-checkbox";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import { IconButton } from "react-native-paper";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TopText } from "../../styles/social.styles";
import Profile from "../../assets/images/B2b/profile.png";
import { Row } from "../../styles/dashboard.styles";
import CustomCarousel from "../../components/dashboard/CustomCarousel";
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
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Banner from "./Banner";
import { BASEAPIURL } from "../../infrastructure/constants";
import { decode } from "base-64";
import { BASEIMGURL } from "../../infrastructure/constants";
import UserImg from "../../assets/images/general/user.png";
import FilterMenu from "../../components/Jewellery/FilterMenu";
import BottomNavigation from "../../components/Jewellery/BottomNavigation";

const Tab = createBottomTabNavigator();

const JewelleryHome = ({ navigation }) => {
  const SearchWorker = async ({ searchTerm }) => {
    setSearch(searchTerm);
  };

  const searchDebounce = useCallback(debounce(SearchWorker, 1200), []);

  const [selectedTab, setSelectedTab] = useState("Products");

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
  };

  const [activeButton, setActiveButton] = useState(null);

  const handleButtonPress = (buttonName) => {
    console.log("inside buttonpress");
    setActiveButton(buttonName);
    if (buttonName === "clear") {
      setSelectedOptions([]);
      setSelectedFiltersArray([]);
    }
  };

  const [checkboxes, setCheckboxes] = useState([
    { label: "Diamond", isChecked: false },
    { label: "Gold", isChecked: false },
    { label: "Silver", isChecked: false },
  ]);

  const handleCheckBoxToggle = (index) => {
    setCheckboxes((prevState) => {
      const updatedCheckboxes = [...prevState];
      updatedCheckboxes[index].isChecked = !updatedCheckboxes[index].isChecked;
      return updatedCheckboxes;
    });
  };

  const [activeFilter, setActiveFilter] = useState("Category");
  const [selectedOptions, setSelectedOptions] = useState([]);

  const filters = [
    { name: "Category", options: ["Gold", "Silver", "Diamond"] },
    { name: "Type", options: ["Ring", "Necklace", "Earings"] },
    // { name: "Weight", options: ["500gm", "250gm"] },
    {
      name: "Price",
      options: ["Below 20000", "30000-50000", "50000-70000", "Above 70000"],
    },
  ];
  const isFocused = useIsFocused();

  const handleFilterClick = (filterName) => {
    setActiveFilter(filterName);
  };

  const handleOptionClick = (option) => {
    if (activeFilter === "Price") {
      // For the "Price" filter, toggle the selection
      setSelectedOptions((prevSelectedOptions) => {
        const priceFilter = filters.find((filter) => filter.name === "Price");

        if (priceFilter.options.includes(option)) {
          // Check if the clicked option is already selected
          const isSelected = prevSelectedOptions.includes(option);

          // Remove other price filters and add the current one if it's not already selected
          const updatedOptions = isSelected
            ? prevSelectedOptions.filter((item) => item !== option) // Remove the selected option
            : [
                ...prevSelectedOptions.filter(
                  (item) => !priceFilter.options.includes(item)
                ), // Remove other price options
                option, // Add the selected option
              ];

          return updatedOptions;
        }

        return prevSelectedOptions;
      });
    } else {
      // For other filters, toggle options as usual
      setSelectedOptions((prevSelectedOptions) => {
        const updatedOptions = prevSelectedOptions.includes(option)
          ? prevSelectedOptions.filter((item) => item !== option)
          : [...prevSelectedOptions, option];

        return updatedOptions;
      });
    }
  };

  const toggleFilter = (filterName) => {
    setActiveFilter(filterName === activeFilter ? null : filterName);
  };

  const toggleOption = (filterName, option) => {
    const index = selectedOptions.indexOf(option);
    if (index === -1) {
      setSelectedOptions([...selectedOptions, option]);
    } else {
      setSelectedOptions([
        ...selectedOptions.slice(0, index),
        ...selectedOptions.slice(index + 1),
      ]);
    }
  };

  const isOptionSelected = (filterName, option) => {
    return selectedOptions.includes(option) && activeFilter === filterName;
  };

  const clearFilters = () => {
    setActiveFilter(null);
    setSelectedOptions([]);
  };

  const applyFilters = () => {
    // Implement your logic to apply filters
  };

  const otherProducts = [
    {
      id: 1,
      name: "Diamond Neclace",
      image:
        "https://i.pinimg.com/originals/2b/34/28/2b34288a1b2db4ec39c3e0f56495573e.jpg",
      vendor: "Diamond Emporium",
      category: "Necklace",
      material: "Gold",
      pieces: "100 pieces",
      address: "106 MIG, KHB Colony, 5 Block",
      city: "Bangalore",
      about:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      email: "gj1@gmail.com",
      phone: "987654321",
    },
    {
      id: 2,
      name: "Gold Pendant",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSArFqNg55nsoCswo9fBNilIfZefylFT5RZkO-TrlWm5WfDa3ZouddpvLLQJZYz-2dxc3U&usqp=CAU",
      vendor: "Gold Crafters",
      category: "Ring",
      material: "Gold",
      pieces: "100 pieces",
      address: "206 MIG, KHB Colony, 5 Block",
      city: "Pune",
      about:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      email: "gj1@gmail.com",
      phone: "987654321",
    },
    {
      id: 3,
      name: "Stone Earrings",
      image:
        "https://mcstaging-blog.astteria.com/wp-content/uploads/2021/08/11-1.jpg",
      vendor: "Stone Crafters",
      category: "Pendant",
      material: "Silver",
      pieces: "100 pieces",
      address: "206 MIG, KHB Colony, 5 Block",
      city: "Indore",
      about:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      email: "gj1@gmail.com",
      phone: "987654321",
    },
    {
      id: 4,
      name: "Silver Set",
      image:
        "https://m.media-amazon.com/images/I/510nvXdiOpL._AC_UF1000,1000_QL80_.jpg",
      vendor: "Silver Crafters",
      category: "Ring",
      material: "Silver",
      pieces: "100 pieces",
      address: "206 MIG, KHB Colony, 5 Block",
      city: "Hyderabad",
      about:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      email: "gj1@gmail.com",
      phone: "987654321",
    },
    {
      id: 5,
      name: "Bracelets",
      image:
        "https://zoom.jewelryimages.net/edge/geraldsjewelry/images/edge/100-01426.jpg",
      vendor: "Solitaire Creations",
      category: "Necklace",
      material: "Platinum",
      pieces: "100 pieces",
      address: "206 MIG, KHB Colony, 5 Block",
      city: "Chennai",
      about:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      email: "gj1@gmail.com",
      phone: "987654321",
    },
    {
      id: 6,
      name: "Blue Diamond",
      image:
        "https://michaelrose.com/cdn/shop/products/1.04ct-Emerald-Cut-Aquamarine-And-Diamond-Cluster-Earrings_4dc97ad0-de12-4f1c-9b18-a0df1bbbb025.jpg?v=1625824303",
      vendor: "Blue Diamond Creations",
      category: "Earrings",
      material: "Diamond",
      pieces: "100 pieces",
      address: "206 MIG, KHB Colony, 5 Block",
      city: "Kolkata",
      about:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      email: "gj1@gmail.com",
      phone: "987654321",
    },
    {
      id: 7,
      name: "Pearl Jewellery",
      image:
        "https://i.pinimg.com/736x/be/61/a1/be61a11b777c19bd9b5f27324e818aa3.jpg",
      vendor: "Pearl Creations",
      category: "Bracelet",
      material: "Pearl",
      pieces: "100 pieces",
      address: "206 MIG, KHB Colony, 5 Block",
      city: "Kolkata",
      about:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      email: "gj1@gmail.com",
      phone: "987654321",
    },
  ];

  const [isModalVisible, setModalVisible] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const [loadingAnimation, setLoadingAnimation] = useState(true);

  const fromShopId = useSelector((state) => state.user.user.roleData._id);
  console.log("Log", fromShopId);

  const handleConnect = async (fromShopId, toShopId) => {
    try {
      console.log("From shop id: ", fromShopId);
      console.log("To shop Id: ", toShopId);

      if (fromShopId === toShopId) {
        Alert.alert("Error", "You cannot send a request to yourself");
        return; // Exit the function
      }

      const response = await fetch(
        `${BASEAPIURL}/shopToShopOperations/create-shop-to-shop-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fromShopId: fromShopId,
            toShopId,
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

  const handleChat = () => {
    toggleModal();
    navigation.navigate("ChatScreen");
  };

  const [selectedFiltersArray, setSelectedFiltersArray] = useState([]);

  const debouncedFetchProducts = useCallback(
    debounce((searchTerm, selectedFiltersArray) => {
      fetchProducts(searchTerm, selectedFiltersArray);
    }, 1200),
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (e) => {
    setSearchTerm(e);
  };

  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  useEffect(() => {
    console.log("inside useeffect");
    setMenuVisible(false);
    debouncedFetchProducts(searchTerm, selectedFiltersArray);
  }, [searchTerm, selectedFiltersArray]);

  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const [selectedVendorId, setSelectedVendorId] = useState(null);

  const token = useSelector((state) => state.user.token);

  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));

  const shopId = decodedPayload.id;
  const user = useSelector((state) => state.user.user);
  // const shopId = user?.roleData?._id;

  const userType = decodedPayload.userType;
  console.log("User Type: ", userType);
  console.log("shop id: ", shopId);
  const [selectedShopId, setSelectedShopId] = useState(null);

  const handleVendorConnect = async (toVendorId, fromShopId, userType) => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/vendorShopOperations/create-shop-vendor-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shopId: fromShopId,
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

  // const user = useSelector((state) => state.user.user);
  // console.log("User: ", user);

  const [vendors, setVendors] = useState([]);

  const [shops, setShops] = useState([]);

  useEffect(() => {
    fetchVendors();
    fetchShops();
  }, [isFocused]);

  const fetchProducts = async (searchTerm, selectedFiltersArray) => {
    // Construct the query parameters from selectedFiltersArray
    const queryParams = new URLSearchParams();

    selectedFiltersArray.forEach((filter) => {
      if (filter["Filter name"] === "Category") {
        filter.Options.forEach((option) =>
          queryParams.append("category", option.toLowerCase())
        );
      } else if (filter["Filter name"] === "Type") {
        filter.Options.forEach((option) =>
          queryParams.append("type", option.toLowerCase())
        );
      } else if (filter["Filter name"] === "Price") {
        filter.Options.forEach((option) => {
          if (option.includes("Below")) {
            const maxPrice = option.split(" ")[1];
            queryParams.append("maxPrice", maxPrice);
          } else if (option.includes("Above")) {
            const minPrice = option.split(" ")[1];
            queryParams.append("minPrice", minPrice);
          } else {
            const [minPrice, maxPrice] = option.split("-");
            queryParams.append("minPrice", minPrice);
            queryParams.append("maxPrice", maxPrice);
          }
        });
      }
    });

    if (searchTerm.trim() !== "") {
      queryParams.append("search", searchTerm);
    }

    const queryString = queryParams.toString();
    const url = `${BASEAPIURL}/jewelry-products?${queryString}`;

    console.log("Fetching products with URL:", url);

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
        console.log("Filter Products Data:", data);

        setProducts(data.data);
      } else {
        throw new Error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingAnimation(false); // End loading
    }
  };

  const userId = useSelector(
    (state) =>
      state.user.user &&
      state.user.user.roleData &&
      state.user.user.roleData._id
  );

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
          (vendor) => vendor.listOfShops && vendor.listOfShops.includes(userId)
        );

        const otherVendors = data.filter(
          (vendor) =>
            !vendor.listOfShops || !vendor.listOfShops.includes(userId)
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
        const filteredShops = data.filter((shop) => shop.owner._id !== shopId);
        setShops(filteredShops);
      } else {
        throw new Error("Failed to fetch workers");
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  const [shopProducts, setShopProducts] = useState([]);
  const [products, setProducts] = useState([]);

  const loggedInUserId = decodedPayload.id;
  console.log("Logged in user id: ", loggedInUserId);

  useEffect(() => {
    const fetchShopProducts = async () => {
      try {
        const response = await fetch(
          `${BASEAPIURL}/jewelry-products?shops=["${fromShopId}"]`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Failed to fetch products: ${errorMessage}`);
        }
        const data = await response.json();
        setShopProducts(data.data);
        console.log("Products for logged-in shop: ", shopProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchShopProducts();
  }, [token]);

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
            <TouchableOpacity onPress={() => navigation.navigate("MyProfile")}>
              <Image
                source={Profile}
                style={{ width: 35, height: 35, marginRight: 10 }}
              />
            </TouchableOpacity>
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
      <Banner />

      <View style={styles.tabsContainer}>
        {["Products", "Shops", "Vendors"].map((tab) => (
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

      {selectedTab === "Products" && (
        <View style={{ flex: 1 }}>
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
          ) : (
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
              {products.length === 0 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 18, color: "grey" }}>
                    No data found
                  </Text>
                </View>
              ) : (
                <ScrollView
                  vertical={true}
                  showsVerticalScrollIndicator={false}
                >
                  {products.map((product, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        console.log("To id each: ", product.createdBy);
                        navigation.navigate("EachProduct", {
                          productId: product._id,
                          product: product,
                          handleVendorConnect: handleVendorConnect,
                          toId: product.createdBy,
                        });
                      }}
                    >
                      <View
                        style={[
                          {
                            // margin: "2%",
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
                            width: 80,
                            height: 80,
                            borderRadius: 8,
                            opacity: 1,
                          }}
                          source={{ uri: `${BASEIMGURL}${product.images[0]}` }}
                        />
                        <View
                          style={{
                            flexDirection: "column",
                            marginLeft: "10%",
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
                            {product.name}
                          </Text>
                          {/* <Text
                      style={{
                        fontWeight: "600",
                        marginTop: "2%",
                        opacity: 0.4,
                        maxWidth: 170,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {product.vendor}
                    </Text> */}
                          <Text
                            style={{
                              fontWeight: "600",
                              marginTop: "2%",
                              opacity: 1,
                              maxWidth: 170,
                              color: "#D4AF37",
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {product.price}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "column",
                            marginLeft: "10%",
                            marginTop: "2%",
                          }}
                        >
                          {/* <Text
                      style={{
                        opacity: 0.6,
                        color: "#d966ff",
                        marginTop: "2%",
                        fontSize: 14,
                      }}
                    >
                      {product.category}
                    </Text> */}
                          <Text
                            style={{
                              fontWeight: "600",
                              marginTop: "10%",
                              right: 0,
                              opacity: 0.4,
                            }}
                          >
                            {product.category}
                          </Text>
                          <Text
                            style={{
                              fontWeight: "600",
                              marginTop: "2%",
                              right: 0,
                              opacity: 0.5,
                              color: "#804000",
                            }}
                          >
                            {product.weightPerProduct + "g"}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
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
          elevation: 10,
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
        selectedFiltersArray={selectedFiltersArray}
        setSelectedFiltersArray={setSelectedFiltersArray}
      />

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
                          handleVendorConnect: handleVendorConnect,
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
                    handleVendorConnect: handleVendorConnect,
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
                    {/* <View style={{ flexDirection: "column", marginTop: "5%" }}>
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
                    </View> */}
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
                  console.log("Ids: ", selectedVendorId, fromShopId, userType);
                  handleVendorConnect(selectedVendorId, fromShopId, userType);
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
        {selectedTab === "Shops" && (
          // <TouchableOpacity>
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
                  handleVendorConnect: handleVendorConnect,
                });
              }}
            >
              <Text>My Products{" >"}</Text>
            </TouchableOpacity>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={shopProducts.length > 2}
            >
              <View style={{ flexDirection: "row" }}>
                {shopProducts.map((product, index) => (
                  <View
                    key={product.id}
                    style={{ alignItems: "center", marginRight: 18 }}
                  >
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        console.log("To id each: ", product.createdBy);
                        navigation.navigate("EachProduct", {
                          productId: product._id,
                          product: product,
                          handleVendorConnect: handleVendorConnect,
                          toId: product.createdBy,
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
          // </TouchableOpacity>
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible && selectedTab === "Shops"}
        onRequestClose={toggleModal}
      >
        <TouchableOpacity style={styles.modalBackground} onPress={toggleModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                onPress={() => {
                  handleConnect(fromShopId, selectedShopId);
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
      {selectedTab === "Shops" && (
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
            {shops.map((shop) => (
              <TouchableOpacity
                key={shop._id}
                onPress={() => {
                  navigation.navigate("EachShopProfile", {
                    shop: shop,
                    shopId: shop._id,
                    handleVendorConnect: handleVendorConnect,
                  });
                }}
              >
                <View
                  style={{
                    margin: "4%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Image
                    style={{
                      width: 60,
                      height: 65,
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
                  <View style={{ flexDirection: "column", marginLeft: "10%" }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        opacity: 0.7,
                        marginTop: "2%",
                        fontSize: 17,
                      }}
                    >
                      {shop.shopName}
                    </Text>
                    <View style={{ flexDirection: "column", marginTop: "5%" }}>
                      <Text
                        style={{
                          fontWeight: "600",
                          marginTop: "0%",
                          opacity: 0.4,
                        }}
                      >
                        {shop.owner.address}
                      </Text>
                    </View>
                  </View>

                  {/* <TouchableOpacity
                    onPress={() => {
                      setSelectedShopId(shop._id);
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
                  </TouchableOpacity> */}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {!menuVisible && (
        // <View style={styles.bottomBarContainer}>
        //   <View style={styles.bottomBar}>
        //     <TouchableOpacity
        //       style={styles.iconContainer}
        //       onPress={() => navigation.navigate("Main")}
        //     >
        //       <Ionicons name="home-outline" size={24} color="#b98c13" />
        //       <Text style={[styles.iconText, { color: "#b98c13" }]}>Home</Text>
        //     </TouchableOpacity>
        //     <TouchableOpacity style={styles.iconContainer}>
        //       <Ionicons name="list-outline" size={24} color="gray" />
        //       <Text style={[styles.iconText, { color: "gray" }]}>Details</Text>
        //     </TouchableOpacity>
        //     <TouchableOpacity style={styles.iconContainer}>
        //       <Ionicons name="settings-outline" size={24} color="gray" />
        //       <Text style={[styles.iconText, { color: "gray" }]}>Settings</Text>
        //     </TouchableOpacity>
        //   </View>
        // </View>
        <BottomNavigation navigation={navigation} />
      )}
    </SafeAreaView>
  );
};

export default JewelleryHome;

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
  icon: {
    marginRight: 10,
    marginTop: 3,
    marginLeft: 20,
  },
  iconText: {
    marginTop: 4,
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
