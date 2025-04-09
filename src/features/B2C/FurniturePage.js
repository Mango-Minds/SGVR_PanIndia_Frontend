import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import Theme from "../../styles/theme";
import { IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import { Ionicons } from "react-native-vector-icons";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import Banner from "./B2C.banner";
import BottomNavigation from "./BottomNavigation";
import { Row } from "../../styles/dashboard.styles";
import FilterMenu from "../../components/Jewellery/FilterMenu";
import { styles } from "../../features/jewellery/JewelleryMainScreen";
import { debounce } from "lodash";
import { decode } from "base-64";
import { BASEAPIURL, BASEIMGURL } from "../../infrastructure/constants";
import { Dimensions } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import SortMenu from "./SortMenu";
import { Video } from "expo-av";
import * as VideoThumbnails from "expo-video-thumbnails";
import { fetchAllProducts as apiFetchProducts } from "./B2CAPI";
const { width } = Dimensions.get("window");

const FurnitureScreen = ({ route, navigation }) => {
  const { category, items } = route.params;
  const isFocused = useIsFocused();
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const [products, setProducts] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedFiltersArray, setSelectedFiltersArray] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSortOption, setSelectedSortOption] = useState(null);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortOption, setSortOption] = useState(null);

  console.log("User: ", user);
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={style.card}
      onPress={() =>
        navigation.navigate("EachListing", {
          itemId: item._id,
          item: item,
          fetchProducts: fetchProducts,
        })
      }
    >
      <Image
        source={{ uri: `${item.images[0]}` }}
        style={styles.eachJewelleryCardImg}
      />

      <Text style={style.price}>{item.price}</Text>
      <Text style={style.title}>{item.name}</Text>
    </TouchableOpacity>
  );
  const toggleSortMenu = () => {
    setSortMenuVisible((prevState) => !prevState);
  };

  const sortOptions = [
    { label: "Price: High to Low", value: "high" },
    { label: "Price: Low to High", value: "low" },
  ];

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const debouncedFetchProducts = useCallback(
    debounce((searchTerm, selectedFiltersArray) => {
      fetchProducts(searchTerm, selectedFiltersArray);
    }, 1200),
    []
  );

  const handleSearch = (e) => {
    setSearchTerm(e);
  };

  const handleButtonPress = (buttonName) => {
    console.log("inside buttonpress");
    if (buttonName === "clear") {
      setSelectedOptions([]);
      setSelectedFiltersArray([]);
    }
  };
  const [activeFilter, setActiveFilter] = useState("Condition");
  const [selectedOptions, setSelectedOptions] = useState([]);

  const filters = [
    // {
    //   name: "Category",
    //   options: ["Furniture", "Electronics", "Vehicles", "Other"],
    // },
    {
      name: "Condition",
      options: ["New", "Like New", "Used", "Needs Repair"],
    },

    {
      name: "Price",
      options: ["Below 2000", "3000-5000", "5000-7000", "Above 7000"],
    },
  ];

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

  // const fetchProducts = async (
  //   searchTerm,
  //   selectedFiltersArray,
  //   sortOption
  // ) => {
  //   const queryParams = new URLSearchParams();

  //   // Include the category in the API request
  //   if (category) {
  //     queryParams.append("category", category);
  //   }

  //   selectedFiltersArray.forEach((filter) => {
  //     if (filter["Filter name"] === "Condition") {
  //       filter.Options.forEach((option) =>
  //         queryParams.append("condition", option)
  //       );
  //     } else if (filter["Filter name"] === "Price") {
  //       filter.Options.forEach((option) => {
  //         if (option.includes("Below")) {
  //           const maxPrice = option.split(" ")[1];
  //           queryParams.append("maxPrice", maxPrice);
  //         } else if (option.includes("Above")) {
  //           const minPrice = option.split(" ")[1];
  //           queryParams.append("minPrice", minPrice);
  //         } else {
  //           const [minPrice, maxPrice] = option.split("-");
  //           queryParams.append("minPrice", minPrice);
  //           queryParams.append("maxPrice", maxPrice);
  //         }
  //       });
  //     }
  //   });

  //   if (searchTerm.trim() !== "") {
  //     queryParams.append("search", searchTerm);
  //   }
  //   if (sortOption) {
  //     queryParams.append("priceSort", sortOption);
  //   }
  //   const queryString = queryParams.toString();
  //   const url = `${BASEAPIURL}/listings?${queryString}`;

  //   console.log("Fetching products with URL:", url);

  //   try {
  //     setLoadingAnimation(true);
  //     const response = await fetch(url, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log("Data:", data);

  //       setProducts(data.listings);
  //     } else {
  //       throw new Error("Failed to fetch products");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching products:", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };

  //co
  const fetchProducts = async (searchTerm, selectedFiltersArray, sortOption) => {
    try {
      let token = await AsyncStorage.getItem("token");
  
      if (!token) {
        console.error("Bearer token not found");
        Alert.alert("Error", "Authentication token is missing.");
        return;
      }
  
      const queryParams = new URLSearchParams();
  
      // Include category if available
      if (category) {
        queryParams.append("category", category.toLowerCase());
      }
  
      selectedFiltersArray.forEach((filter) => {
        if (filter["Filter name"] === "Condition") {
          filter.Options.forEach((option) =>
            queryParams.append("condition", option.toLowerCase())
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
      if (sortOption) {
        queryParams.append("priceSort", sortOption);
      }
  
      const queryString = queryParams.toString();
      console.log("Fetching products with query:", queryString);
  
      setLoadingAnimation(true);
  
      // Use `apiClient` for better error handling
      const response = await apiClient.get(`/listings?${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("Products:", response.data);
      setProducts(response.data.listings);
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert("Error", "Failed to fetch products.");
    } finally {
      setLoadingAnimation(false);
    }
  };
  // const fetchProducts = async (searchTerm = "", selectedFiltersArray = []) => {
  //     setLoadingAnimation(true);
  //     const data = await apiFetchProducts(searchTerm, selectedFiltersArray);
  //     setItems(data);
  //     setLoadingAnimation(false);
  //   };
    
  
  useEffect(() => {
    console.log("inside useEffect");
    setMenuVisible(false);
    fetchProducts(searchTerm, selectedFiltersArray, selectedSortOption);
  }, [searchTerm, selectedFiltersArray, isFocused, selectedSortOption]);

  const handleSortSelect = (option) => {
    setSelectedSortOption(option);
    setSortMenuVisible(false);
  };

  useEffect(() => {
    console.log("Updated sortOption:", sortOption);
  }, [sortOption]);

  const filteredItems = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Products: ", products);
  console.log("FilteredItems: ", filteredItems);
  const [thumbnails, setThumbnails] = useState({});
  
    useEffect(() => {
      const generateThumbnails = async () => {
        const newThumbnails = {};
  
        await Promise.all(
          products.map(async (item) => {
            if (item.videos?.length > 0) {
              try {
                const { uri } = await VideoThumbnails.getThumbnailAsync(
                  `${item.videos[0]}`,
                  { time: 15000 }
                );
                newThumbnails[item._id] = uri;
              } catch (e) {
                console.warn("Could not generate thumbnail", e);
              }
            }
          })
        );
  
        setThumbnails(newThumbnails);
      };
  
      if (products?.length > 0) {
        generateThumbnails();
      }
    }, [products]);

  return (
    <Container
      style={{
        paddingRight: 0,
        paddingLeft: 0,
        paddingBottom: 0,
        backgroundColor: "white",
      }}
    >
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{
              color: Theme.themeColor,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            {category}
          </TopText>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Ionicons
            name="options-outline"
            size={26}
            style={{ color: "grey", marginLeft: "auto" }}
            onPress={toggleSortMenu}
          />
          <IconButton
            icon="plus"
            style={{ marginRight: 15, color: "grey" }}
            onPress={() => navigation.navigate("AddProduct", { fetchProducts })}
          />
        </View>
      </RowBetween>

      <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
        <SearchField placeholder="Search" onChangeText={handleSearch} />

        <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
          <Icon name="search" size={24} />
        </View>
      </Row>

      {loadingAnimation ? (
        <ActivityIndicator
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          size={"large"}
          color={Theme.themeColor}
        />
      ) : products.length > 0 ? (
        <ScrollView>
          <View style={{ padding: "2.5%", paddingTop: "1%", flex: 1 }}>
            <View style={styles.eachJewelleryCardContainer}>
              {filteredItems.map((product, index) => (
                <View
                  key={index}
                  style={[styles.shadowProp, styles.eachJewelleryCard]}
                >
                  <Pressable
                    onPress={() =>
                      navigation.navigate("EachListing", {
                        itemId: product._id,
                        item: product,
                        fetchProducts: fetchProducts,
                      })
                    }
                  >
                    {/* <Image
                      style={styles.eachJewelleryCardImg}
                      source={{ uri: `${BASEIMGURL}${product.images[0]}` }}
                    /> */}
                    <View key={product._id}>
                      {product.images?.length > 0 ? (
                        <Image
                          style={styles.eachJewelleryCardImg}
                          source={{ uri: `${product.images[0]}` }}
                        />
                      ) : product.videos?.length > 0 ? (
                        <Pressable onPress={() => console.log("Play Video")}>
                          <Image
                            style={styles.eachJewelleryCardImg}
                            source={{
                              uri: thumbnails[product._id],
                            }}
                          />
                        </Pressable>
                      ) : (
                        <Image
                          style={styles.eachJewelleryCardImg}
                          source={{ uri: `${product.images[0]}` }}
                        />
                      )}
                    </View>
                    <View style={{ marginLeft: "2%" }}>
                      <Text
                        style={{
                          fontWeight: "700",
                          marginTop: "1%",
                          opacity: 1.5,
                          flexWrap: "nowrap",
                        }}
                      >
                        {product.name}
                      </Text>
                      <View style={{ marginTop: "3%", flexDirection: "row" }}>
                        <Text
                          style={{
                            opacity: 0.5,
                            marginLeft: "0%",
                            fontSize: 13,
                          }}
                        >
                          ₹{product.price}
                        </Text>
                      </View>
                      <Text style={{ color: Theme.themeColor, marginTop: 10 }}>
                        View Details
                      </Text>
                    </View>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 16, color: "gray" }}>No products found</Text>
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
      <SortMenu
        menuVisible={sortMenuVisible}
        toggleMenu={toggleSortMenu}
        sortOptions={sortOptions}
        activeFilter={activeFilter}
        selectedOptions={selectedOptions}
        handleFilterClick={handleFilterClick}
        handleOptionClick={handleSortSelect}
        handleButtonPress={handleButtonPress}
        selectedFiltersArray={selectedFiltersArray}
        setSelectedFiltersArray={setSelectedFiltersArray}
        selectedSortOption={selectedSortOption}
        setSelectedSortOption={setSelectedSortOption}
        fetchProducts={fetchProducts}
        handleSortSelect={handleSortSelect}
      />

      {!menuVisible && !sortMenuVisible && (
        <BottomNavigation navigation={navigation} />
      )}
    </Container>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  list: {
    paddingHorizontal: 10,
  },
  card: {
    width: width / 2 - 24, // Ensure two items fit in one row
    margin: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  title: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: Theme.themeColor,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  plus: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default FurnitureScreen;
