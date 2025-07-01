import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import Theme from "../../styles/theme";
import { IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import Banner from "./B2C.banner";
import BottomNavigation from "./BottomNavigation";
import { useIsFocused } from "@react-navigation/native";
import { BASEAPIURL } from "../../infrastructure/constants";
import { decode } from "base-64";
import { debounce } from "lodash";
import ListingCard from "./ListingsCard";
import PageComingSoon from "./B2c.PageComingSoon";
import { fetchAllProducts as apiFetchProducts } from "./B2CAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { useTranslation } from "react-i18next";

const products = [
  // Furniture
  {
    id: 1,
    name: "Wooden Bed",
    category: "Furniture",
    image:
      "https://media.istockphoto.com/id/173586817/photo/bed-and-breakfast-bedroom.webp?a=1&b=1&s=612x612&w=0&k=20&c=xl7H33_rJLNhjmpPXr0ST19OCGKCYaeVFIW_TvqFrCE=",

    imageUrl: [
      "https://media.istockphoto.com/id/173586817/photo/bed-and-breakfast-bedroom.webp?a=1&b=1&s=612x612&w=0&k=20&c=xl7H33_rJLNhjmpPXr0ST19OCGKCYaeVFIW_TvqFrCE=",
      "https://media.istockphoto.com/id/183886814/photo/master-bedroom.jpg?s=612x612&w=0&k=20&c=VnpR639VTA-dk_bLL5mLVI46b3heDDGm0QfP3V0GluU=",
      "https://media.istockphoto.com/id/155143024/photo/modern-bedroom.jpg?s=612x612&w=0&k=20&c=GWlYl801A12TJwdnb3nYrz31hKodq7Kk3Ue_tik_PZw=",
    ],
    price: 1200,
    originalPrice: 1500,
    address: "Downtown, NY",
    number: "9876543210",
    condition: "Used",
    productUsage: "1 year",
    description:
      "A sturdy wooden bed with a classic design, perfect for a comfortable night's sleep.",
  },
  {
    id: 2,
    name: "Leather Sofa",
    category: "Furniture",
    image:
      "https://media.istockphoto.com/id/926239100/photo/black-classic-interior.webp?a=1&b=1&s=612x612&w=0&k=20&c=ONqGZphnrSF-WtqYJ2VOeg61AqcYJUuCgsuA133kKps=",
    imageUrl: [
      "https://media.istockphoto.com/id/926239100/photo/black-classic-interior.webp?a=1&b=1&s=612x612&w=0&k=20&c=ONqGZphnrSF-WtqYJ2VOeg61AqcYJUuCgsuA133kKps=",
      "https://media.istockphoto.com/id/592681584/photo/modern-luxury-black-style-apartment-with-leather-sofa.webp?a=1&b=1&s=612x612&w=0&k=20&c=DfjlqFRKl5ZKvOaqh9K19VC6EMCZQizpdHnFm4QuvJY=",
    ],
    price: 2500,
    originalPrice: 3000,
    address: "Brooklyn, NY",
    number: "9876543210",
    condition: "Like New",
    productUsage: "6 months",
    description:
      "A luxurious black leather sofa that adds elegance to any living room.",
  },

  // Food
  {
    id: 3,
    name: "Homemade Pizza",
    category: "Food",

    image:
      "https://media.istockphoto.com/id/187248625/photo/pepperoni-pizza.webp?a=1&b=1&s=612x612&w=0&k=20&c=clncU414Y_vfH-OoUqiwy5AnZRwBpeSehVqJkD9SvKU=",
    imageUrl: [],
    price: 15,
    originalPrice: 20,
    address: "Queens, NY",
    number: "9876543210",
    condition: "Fresh",
    productUsage: "Made Today",
    description:
      "Delicious homemade pizza with fresh ingredients, perfect for any meal.",
  },
  {
    id: 4,
    name: "Vegetables",
    category: "Food",
    image:
      "https://media.istockphoto.com/id/1280856062/photo/variety-of-fresh-organic-vegetables-and-fruits-in-the-garden.webp?a=1&b=1&s=612x612&w=0&k=20&c=VGOQ0nfrWgpIXzdfI6voNicGvq_SjOLgSc76-QrUEzE=",
    imageUrl: [],
    price: 10,
    originalPrice: 15,
    address: "Manhattan, NY",
    number: "9876543210",
    condition: "Fresh",
    productUsage: "Direct from farm",
    description:
      "A variety of fresh organic vegetables sourced directly from local farms.",
  },

  // Services
  {
    id: 5,
    name: "Plumbing Service",
    category: "Services",
    image: "https://example.com/plumbing.jpg",
    price: 50,
    originalPrice: 70,
    address: "Bronx, NY",
    number: "9876543210",
    condition: "Available",
    productUsage: "Professional",
    description:
      "Expert plumbing services for all types of repairs and installations.",
  },

  // Home Decor
  {
    id: 6,
    name: "Wall Painting",
    category: "Home Decor",
    image: "https://example.com/wall-painting.jpg",
    price: 100,
    originalPrice: 150,
    address: "Staten Island, NY",
    number: "9876543210",
    condition: "New",
    productUsage: "Handmade",
    description: "Beautiful handmade wall painting to enhance your home decor.",
  },

  // Appliances
  {
    id: 7,
    name: "Microwave Oven",
    category: "Appliances",
    image: "https://example.com/microwave.jpg",
    price: 200,
    originalPrice: 250,
    address: "Queens, NY",
    number: "9876543210",
    condition: "Like New",
    productUsage: "2 months",
    description:
      "A high-quality microwave oven in excellent condition, perfect for quick cooking.",
  },

  // Cars
  {
    id: 8,
    name: "Toyota Camry 2020",
    category: "Cars",
    image: "https://example.com/toyota-camry.jpg",
    price: 15000,
    originalPrice: 18000,
    address: "Manhattan, NY",
    number: "9876543210",
    condition: "Used",
    productUsage: "3 years",
    description:
      "Well-maintained Toyota Camry 2020 model with great mileage and performance.",
  },

  // Toys
  {
    id: 9,
    name: "Lego Set",
    category: "Toys",
    image: "https://example.com/lego.jpg",
    price: 30,
    originalPrice: 50,
    address: "Brooklyn, NY",
    number: "9876543210",
    condition: "New",
    productUsage: "Sealed Box",
    description:
      "Brand new Lego set in a sealed box, perfect for kids and collectors.",
  },
];

const BuySellScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const { user } = useSelector((state) => state.user);
  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const isFocused = useIsFocused();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedFiltersArray, setSelectedFiltersArray] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  //   const categories = [
  //   { name: "Furniture", icon: "chair" },
  //   { name: "Electronics", icon: "kitchen" },
  //   { name: "Vehicles", icon: "directions-car" },
  // ];
  const categories = [
  { name: "Furniture", icon: "chair", label: t("Furniture") },
  { name: "Electronics", icon: "kitchen", label: t("Electronics") },
  { name: "Vehicles", icon: "directions-car", label: t("Vehicles") },
];

 
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (e) => {
    setSearchTerm(e);
  };


  const fetchProducts = async (searchTerm = "", selectedFiltersArray = []) => {
    setLoadingAnimation(true);
    const data = await apiFetchProducts(searchTerm, selectedFiltersArray);
    setItems(data);
    setLoadingAnimation(false);
  };

  useEffect(() => {
    if (isFocused) {
      fetchProducts();
    }
  }, [isFocused]);

  const filteredItems = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : items;

  // const handleCategoryPress = (category) => {
  //   console.log(category);

  //   if (category === "Furniture") {
  //     navigation.navigate("FurnitureScreen", {
  //       category: category,
  //       filteredItems: filteredItems,
  //       items: items,
  //       fetchProducts: fetchProducts,
  //     });
  //   } else if (category === "Electronics") {
  //     navigation.navigate("FurnitureScreen", {
  //       category: category,
  //       filteredItems: filteredItems,
  //       fetchProducts: fetchProducts,
  //       items: items,
  //     });
  //   } else if (category === "Vehicles") {
  //     navigation.navigate("FurnitureScreen", {
  //       category: category,
  //       filteredItems: filteredItems,
  //       fetchProducts: fetchProducts,
  //       items: items,
  //     });
  //   }
  // };
const handleCategoryPress = (category) => {
  if (["Furniture", "Electronics", "Vehicles"].includes(category)) {
    navigation.navigate("FurnitureScreen", {
      category,
      filteredItems,
      items,
      fetchProducts,
    });
  } else {
    console.warn("Invalid category selected:", category);
  }
};

  
  const debouncedFetchProducts = useCallback(
    debounce((searchTerm, selectedFiltersArray) => {
      fetchProducts(searchTerm, selectedFiltersArray);
    }, 1200),
    []
  );

  useEffect(() => {
    console.log("inside useeffect");
    setMenuVisible(false);
    debouncedFetchProducts(searchTerm, selectedFiltersArray);
  }, [searchTerm, selectedFiltersArray, isFocused]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <View style={styles.container}>
        <View
          style={{
            paddingHorizontal: 10,
          }}
        >
          <RowBetween style={{ paddingTop: 24 }}>
            <View style={{ alignItems: "center", flexDirection: "row" }}>
              <IconButton
                icon="arrow-left"
                onPress={() => {
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                  } else {
                    navigation.navigate("MainHome");
                  }
                }}
              />
              <TopText
                style={{
                  color: Theme.themeColor,
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                {t("b2c")}
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
                onPress={() => navigation.navigate("MyB2CProfile")}
              >
                <Icon
                  name="person-outline"
                  size={24}
                  style={{ color: "grey" }}
                />
              </TouchableOpacity>
            </View>
          </RowBetween>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t("search_placeholder")}
            onChangeText={handleSearch}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.homesSection}
            onPress={() => {
              navigation.navigate("MyListingScreen", {
                category: selectedCategory,
                filteredItems: filteredItems,
                items: items,
                fetchProducts: fetchProducts,
              });
            }}
          >
            <Icon name="home" size={24} color={Theme.themeColor} />
            <Text style={styles.homesText}>{t("my_listings")}</Text>
            <Icon name="arrow-forward-ios" size={16} color="#000" />
          </TouchableOpacity>

          <Banner />

          <ScrollView contentContainerStyle={styles.categoryGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.name}
                style={styles.categoryItem}
                onPress={() => handleCategoryPress(category.name)}
              >
                <Icon name={category.icon} size={36} color={Theme.themeColor} />
                <Text style={styles.categoryText}>{category.label}</Text>
              </TouchableOpacity>
            ))}
            
          </ScrollView>

          <RowBetween style={{ paddingTop: 5, marginLeft: 10 }}>
            <View style={{ alignItems: "center", flexDirection: "row" }}>
              <TopText
                style={{
                  color: Theme.themeColor,
                  fontSize: 20,
                  fontWeight: "bold",
                  marginLeft: "15px",
                }}
              >
                {t("all_listings")}
              </TopText>
            </View>

            <TouchableOpacity
              style={{ marginRight: 5 }}
              onPress={() =>
                navigation.navigate("AllListingScreen", {
                  category: selectedCategory,
                  filteredItems: filteredItems,
                  items: items,
                  fetchProducts: fetchProducts,
                })
              }
            >
              <Text style={{ color: "black", fontSize: 18 }}> &gt;&gt; </Text>
            </TouchableOpacity>
          </RowBetween>
          <ListingCard
            items={items}
            fetchProducts={fetchProducts}
            loadingAnimation={loadingAnimation}
          />
        </ScrollView>

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() =>
            navigation.navigate("AddProduct", { fetchProducts: fetchProducts })
          }
        >
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
      </View>

      <BottomNavigation navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    // marginTop: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Theme.themeColor,
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconSpacing: {
    marginHorizontal: 10,
  },
  searchContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  searchInput: {
    fontSize: 16,
  },
  homesSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
  },
  homesText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
  },
  banner: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 10,
  },
  bannerImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  bannerTextContainer: {
    padding: 10,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bannerSubtitle: {
    fontSize: 14,
    marginVertical: 5,
  },
  bannerButton: {
    backgroundColor: "#000",
    padding: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  categoryItem: {
    width: "30%",
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    padding: 10,
  },
  categoryText: {
    marginTop: 8,
    fontSize: 14,
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

  selectedCategory: { backgroundColor: "#ddd" },
  productGrid: {
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  productImage: { width: "100%", height: 100, borderRadius: 10 },
  productTitle: { fontSize: 16, fontWeight: "bold", marginVertical: 5 },
  productPrice: { color: "green", fontWeight: "bold" },
  productCondition: { fontSize: 12, color: "gray" },
  noItemsText: { textAlign: "center", marginTop: 20 },

  page: {
    flex: 1, // Make the page take up the full screen
    marginTop: 20,
  },
  coming: {
    flex: 1, // Make the coming view take up the remaining space
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
  },
  text: {
    fontWeight: "bold",
    fontSize: 20,
    color: Theme.themeColor,
  },
});

export default BuySellScreen;
