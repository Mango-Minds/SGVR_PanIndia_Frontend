import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useSelector } from "react-redux";
import React, { useCallback, useState, useEffect } from "react";
import { Row } from "../../styles/dashboard.styles";
import { Ionicons } from "react-native-vector-icons";
import { BASEIMGURL } from "../../infrastructure/constants";
import { debounce } from "lodash";
import Icon from "react-native-vector-icons/Ionicons";
import { Divider, IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import { useNavigation } from "@react-navigation/native";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import { styles } from "./JewelleryMainScreen";
import { BASEAPIURL } from "../../infrastructure/constants";
import { decode } from "base-64";
import { useIsFocused } from "@react-navigation/native";
import FilterMenu from "../../components/Jewellery/FilterMenu";
import BottomNavigation from "../../components/Jewellery/BottomNavigation";

const EachShopAllProductsScreen = ({ route }) => {
  const { userType, ownerId, handleVendorConnect  } = route.params;

  const isFocused = useIsFocused();
  const connectedWorkers = route.params?.connectedWorkers || [];
  const connectedShops = route.params?.connectedShops || [];

  const user = useSelector((state) => state.user.user);
  console.log("user in all products page", user)

  const navigation = useNavigation();
  const [isloading, setIsloading] = React.useState(true);

  const [products, setProducts] = useState([]);

  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));
  const vendorOwnerId = decodedPayload.id;

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

  const handleButtonPress = (buttonName) => {
    console.log("inside buttonpress");
    if (buttonName === "clear") {
      setSelectedOptions([]);
      setSelectedFiltersArray([]);
    }
  };

  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
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

  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     try {
  //       let apiUrl = `${BASEAPIURL}/jewelry-products?`;

  //       if (userType === 'vendor') {
  //         apiUrl += `vendors=["${ownerId}"]`;
  //       } else if (userType === 'shop') {
  //         apiUrl += `shops=["${ownerId}"]`;
  //       } else if (userType === 'worker') {
  //         apiUrl += `workers=["${ownerId}"]`;
  //       }
  //       const response = await fetch(apiUrl,
  //         {
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       if (!response.ok) {
  //         const errorMessage = await response.text();
  //         throw new Error(`Failed to fetch products: ${errorMessage}`);
  //       }

  //       const data = await response.json();
  //       setProducts(data.data);
  //     } catch (error) {
  //       console.error("Error fetching products:", error);
  //     }
  //   };

  //   fetchProducts();
  // }, [ownerId]);

  const fetchProducts = async (searchTerm, selectedFiltersArray) => {
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
    setIsloading(true);

    try {
      let apiUrl = `${BASEAPIURL}/jewelry-products?${queryString}`;

      if (userType === "vendor") {
        apiUrl += `&vendors=["${ownerId}"]`;
      } else if (userType === "shop") {
        apiUrl += `&shops=["${ownerId}"]`;
      } else if (userType === "worker") {
        apiUrl += `&workers=["${ownerId}"]`;
      }
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setIsloading(false);

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to fetch products: ${errorMessage}`);
      }

      const data = await response.json();
      setProducts(data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    console.log("inside useeffect");
    setMenuVisible(false);
    debouncedFetchProducts(searchTerm, selectedFiltersArray);
  }, [searchTerm, selectedFiltersArray, isFocused]);

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
            style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
          >
            All Products
          </TopText>
        </View>
        {user.userType === "vendor" && user.roleData._id === ownerId && (

          <IconButton
            icon="plus"
            style={{ marginLeft: "auto", marginRight: "auto" }}
            onPress={() => navigation.navigate("AddRetailProduct")}
          ></IconButton>
        )}
      </RowBetween>
      <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
        <SearchField placeholder="Search" onChangeText={handleSearch} />

        <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
          <Icon name="search" size={24} />
        </View>
      </Row>
      {isloading === true ? (
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
        <ScrollView>
          <View style={{ padding: "2.5%", paddingTop: "1%", flex: 1 }}>
            <View style={styles.eachJewelleryCardContainer}>
              {products.map((product, index) => (
                <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                  <Pressable
                    key={index}
                    onPress={() => {
                      navigation.navigate("EachProduct", {
                        productId: product._id,
                        product: product,
                        connectedWorkers: connectedWorkers,
                        connectedShops: connectedShops,
                        handleVendorConnect :handleVendorConnect ,
                      });
                    }}
                  >
                    <Image
                      style={styles.eachJewelleryCardImg}
                      source={{ uri: `${BASEIMGURL}${product.images[0]}` }}
                    />
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
                      <Text style={{ color: "#b58904", marginTop: 10 }}>
                        View Details
                      </Text>
                    </View>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
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

      {!menuVisible && <BottomNavigation navigation={navigation} />}
    </Container>
  );
};

export default EachShopAllProductsScreen;

const style = StyleSheet.create({
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
});
