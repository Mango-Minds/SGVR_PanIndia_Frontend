import { React, useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import { Ionicons } from "react-native-vector-icons";
import Profile from "../../assets/images/B2b/profile.png";
import { useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import {
  BASEIMGURL,
  BASEAPIURL,
  RENDERMEDIAURL,
} from "../../infrastructure/constants";

import {
  HallDetailsContainer,
  HallImageContainer,
  Heading,
  JobLocation,
  Row,
  TopHeader,
  ViewDetails,
} from "../../styles/dashboard.styles";

const matrimonyVendors = [
  {
    id: 1,
    name: "Rakesh",
    image: [
      require("../../assets/images/matrimony/catering.jpeg"),
      require("../../assets/images/matrimony/banquet.jpeg"),
      require("../../assets/images/matrimony/decorations.jpg"),
      require("../../assets/images/matrimony/photography.jpg"),
      require("../../assets/images/matrimony/music.jpg"),
      require("../../assets/images/matrimony/makeup.jpg"),
      require("../../assets/images/matrimony/transportation.jpg"),
      require("../../assets/images/matrimony/invitation.jpg"),
      require("../../assets/images/matrimony/planning.jpg"),
      require("../../assets/images/matrimony/cake.jpg"),
    ],
    vendor: "Food Fab Catering",
    category: "Catering Services",
    material: "Manpower",
    address: "106 MIG, KHB Colony, 5 Block",
    city: "Bangalore",
    state: "Karnataka",
    about:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    email: "gj1@gmail.com",
    phone: "987654321",
  },
  {
    id: 2,
    name: "Shiva",
    image: [
      require("../../assets/images/matrimony/banquet.jpeg"),
      require("../../assets/images/matrimony/decorations.jpg"),
    ],
    vendor: "Orion-Belt Pvt Ltd",
    category: "Banquet Halls / Garden",
    material: "Buildings",
    address: "106 MIG, KHB Colony, 5 Block",
    city: "Bangalore",
    state: "Karnataka",
    about:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    email: "gj1@gmail.com",
    phone: "987654321",
  },
  {
    id: 3,
    name: "Rakesh",
    image: [require("../../assets/images/matrimony/decorations.jpg")],
    vendor: "Temptations",
    category: "Wedding Decorations",
    material: "Flowers, Raw Materials",
    address: "106 MIG, KHB Colony, 5 Block",
    city: "Bangalore",
    state: "Karnataka",
    about:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    email: "gj1@gmail.com",
    phone: "987654321",
  },
  {
    id: 4,
    name: "Priya",
    image: [require("../../assets/images/matrimony/photography.jpg")],
    vendor: "Memories Forever Photography",
    category: "Photography Services",
    material: "Camera equipment, Props",
    address: "22-A, Richmond Street",
    city: "Mumbai",
    state: "Maharashtra",
    about:
      "Capturing memories that last a lifetime. We specialize in wedding and pre-wedding photography, ensuring every moment is beautifully preserved.",
    email: "memoriesforever@gmail.com",
    phone: "9876543210",
  },
  {
    id: 5,
    name: "Amit",
    image: [require("../../assets/images/matrimony/music.jpg")],
    vendor: "Harmony Sounds",
    category: "Music & Entertainment",
    material: "Sound system, Musical instruments",
    address: "31-B, Garden Street",
    city: "Delhi",
    state: "Delhi",
    about:
      "Bringing rhythm and joy to your special day! From live bands to DJs, we offer a wide range of musical entertainment options tailored to your preferences.",
    email: "harmonysounds@gmail.com",
    phone: "9876543221",
  },
  {
    id: 6,
    name: "Anita",
    image: [require("../../assets/images/matrimony/makeup.jpg")],
    vendor: "Glamour Glow Makeup Artists",
    category: "Makeup & Beauty",
    material: "Cosmetics, Beauty tools",
    address: "15-C, Park Avenue",
    city: "Kolkata",
    state: "West Bengal",
    about:
      "Enhancing your natural beauty on your special day. Our team of skilled makeup artists ensures you look and feel your best, from bridal makeup to hairstyling.",
    email: "glamourglow@gmail.com",
    phone: "9876543232",
  },
  {
    id: 7,
    name: "Rajesh",
    image: [require("../../assets/images/matrimony/transportation.jpg")],
    vendor: "Royal Rides Wedding Car Rentals",
    category: "Transportation Services",
    material: "Luxury cars, Chauffeurs",
    address: "8-D, Palace Road",
    city: "Jaipur",
    state: "Rajasthan",
    about:
      "Arrive in style on your special day! We offer a fleet of luxury cars and professional chauffeurs to make your wedding transportation memorable and hassle-free.",
    email: "royalrides@gmail.com",
    phone: "9876543243",
  },
  {
    id: 8,
    name: "Sneha",
    image: [require("../../assets/images/matrimony/invitation.jpg")],
    vendor: "Elegant Expressions Wedding Invitations",
    category: "Invitation Design",
    material: "Paper, Printing materials",
    address: "5-E, Crescent Lane",
    city: "Chennai",
    state: "Tamil Nadu",
    about:
      "Setting the tone for your big day with beautifully crafted invitations. From traditional to contemporary designs, we create invitations that reflect your unique style.",
    email: "elegantexpressions@gmail.com",
    phone: "9876543254",
  },
  {
    id: 9,
    name: "Sanjay",
    image: [require("../../assets/images/matrimony/planning.jpg")],
    vendor: "Dream Day Wedding Planners",
    category: "Event Planning",
    material: "Planning tools, Decor",
    address: "12-F, Dream Avenue",
    city: "Hyderabad",
    state: "Telangana",
    about:
      "Turning your wedding dreams into reality. Our experienced planners handle every detail, from venue selection to décor, ensuring a seamless and stress-free celebration.",
    email: "dreamdayplanners@gmail.com",
    phone: "9876543265",
  },
  {
    id: 10,
    name: "Meena",
    image: [require("../../assets/images/matrimony/cake.jpg")],
    vendor: "Sweet Indulgence Wedding Cakes",
    category: "Cake Design & Bakery",
    material: "Ingredients, Baking equipment",
    address: "25-G, Baker Street",
    city: "Pune",
    state: "Maharashtra",
    about:
      "Adding sweetness to your special day with exquisite wedding cakes. From classic tiers to custom designs, we create cakes that are as delicious as they are beautiful.",
    email: "sweetindulgence@gmail.com",
    phone: "9876543276",
  },
];

const NewMatrimony = ({ navigation }) => {
  //user data
  const { user } = useSelector((state) => state.user);
  const user_gender = user.roleData.gender;
  const isFocused = useIsFocused();
  const [selectedFiltersArray, setSelectedFiltersArray] = useState([]);
  const token = useSelector((state) => state.user.token);

  //for tab
  const [selectedTab, setSelectedTab] = useState(
    user_gender === "male" ? "Brides" : "Grooms"
  );
  const handleTabPress = (tab) => setSelectedTab(tab);
  const matrimonyManMenu = ["Brides", "Vendors"];
  const matrimonyFemaleMenu = ["Grooms", "Vendors"];
  const displayMenu =
    user_gender === "male" ? matrimonyManMenu : matrimonyFemaleMenu;

  //searchbar
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (e) => {
    setSearchTerm(e);
  };
  const toggleSearch = () => setIsSearchVisible(!isSearchVisible);

  //filter menu?
  const [menuVisible, setMenuVisible] = useState(false);
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  //to fetch matrimony data
  const [matrimonyData, setMatrimonyData] = useState([]);
  const [bridesData, setBridesData] = useState([]);
  const [groomsData, setGroomsData] = useState([]);


  const fetchMatrimonyData = async () => {
    const url = `${BASEAPIURL}/matrimony/matrimonyUsers/`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        Authorization: `Bearer ${token}`,
      });


      if (response.ok) {
        const data = await response.json();

        setMatrimonyData(data.data); // Update state with fetched data
        setBridesData(data.data.filter((matrimony) => matrimony.gender === "female"));
        setGroomsData(data.data.filter((matrimony) => matrimony.gender === "male"));
      } else {
        throw new Error("Failed to fetch matrimony data");
      }
    } catch (error) {
      console.error("Error fetching matrimony data:", error);
    } finally {
    }
  };

  useEffect(() => {
    fetchMatrimonyData();
  }, []);

  return (
    <Container style={{ backgroundColor: "white", paddingBottom: 0 }}>
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
          >
            Matrimony
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
          <TouchableOpacity
            onPress={() => navigation.navigate("MyMatrimonyProfile")}
          >
            <Image
              source={Profile}
              style={{ width: 35, height: 35, marginRight: 10 }}
            />
          </TouchableOpacity>

          {/* <IconButton
              icon="bell-outline"
              style={{ marginLeft: "auto" }}
            ></IconButton> */}
        </View>
      </RowBetween>
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

      <View style={styles.tabsContainer}>
        {displayMenu.map((tab) => (
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
      {selectedTab === "Brides" && (
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
            {bridesData.map((product, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 16,
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: "#ccc",
                  backgroundColor: "#fff",
                }}
              >
                <HallImageContainer>
                  <Image
                    source={product.image}
                    style={{ width: 120, height: 120, borderRadius: 8 }}
                  />
                </HallImageContainer>
                <HallDetailsContainer
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    justifyContent: "space-between",
                  }}
                >
                  <TopHeader style={{ marginBottom: 8 }}>
                    <Heading>{product.name}</Heading>
                  </TopHeader>
                  <Row style={{ marginBottom: 8 }}>
                    <JobLocation>{product.occupation}</JobLocation>
                  </Row>
                  <Row style={{ marginBottom: 8 }}>
                    <JobLocation>{product.homeTown}</JobLocation>
                  </Row>
                  <TouchableOpacity onPress={() => console.log("Check")}>
                    <ViewDetails>View Details</ViewDetails>
                  </TouchableOpacity>
                </HallDetailsContainer>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {selectedTab === "Grooms" && (
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
            {groomsData.map((product, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 16,
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: "#ccc",
                  backgroundColor: "#fff",
                }}
              >
                <HallImageContainer>
                  <Image
                    source={product.image}
                    style={{ width: 120, height: 120, borderRadius: 8 }}
                  />
                </HallImageContainer>
                <HallDetailsContainer
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    justifyContent: "space-between",
                  }}
                >
                  <TopHeader style={{ marginBottom: 8 }}>
                    <Heading>{product.name}</Heading>
                  </TopHeader>
                  <Row style={{ marginBottom: 4 }}>
                    <JobLocation>{product.occupation}</JobLocation>
                  </Row>
                  <Row style={{ marginBottom: 4 }}>
                    <JobLocation>{product.city}</JobLocation>
                  </Row>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("MatrimonyProfileNew", {
                        matrimonyData: groomsData[index],
                      })
                    }
                  >
                    <ViewDetails>View Details</ViewDetails>
                  </TouchableOpacity>
                </HallDetailsContainer>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {selectedTab === "Vendors" && (
        <View
          style={{
            padding: "2%",
            margin: "2%",
            display: "flex",
            flexDirection: "row",
            flex: 1,
          }}
        >
          <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
            {matrimonyVendors.map((product, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 16,
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: "#ccc",
                  backgroundColor: "#fff",
                  width: "100%", // Ensuring each item takes the full width of the ScrollView
                }}
              >
                <HallImageContainer>
                  <Image
                    source={
                      Array.isArray(product.image)
                        ? product.image[0]
                        : product.image
                    }
                    style={{ width: 120, height: 120, borderRadius: 8 }}
                  />
                </HallImageContainer>
                <HallDetailsContainer
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    justifyContent: "space-between",
                  }}
                >
                  <TopHeader style={{ marginBottom: 8 }}>
                    <Heading>{product.vendor}</Heading>
                  </TopHeader>
                  <Row style={{ marginBottom: 4 }}>
                    <JobLocation>{product.category}</JobLocation>
                  </Row>
                  <Row style={{ marginBottom: 4 }}>
                    <JobLocation>
                      {product.city}, {product.state}
                    </JobLocation>
                  </Row>

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("MatrimonyProfileVendorNew", {
                        vendorData: matrimonyVendors[index],
                      })
                    }
                  >
                    <ViewDetails>View Details</ViewDetails>
                  </TouchableOpacity>
                </HallDetailsContainer>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={{
                position: "absolute",
                bottom: 50,
                right: 50,
                backgroundColor: "#000000",
                borderRadius: 30,
                width: 55,
                height: 55,
                justifyContent: "center",
                alignItems: "center",
                elevation: 10,
              }}
            >
              <Ionicons name="square" size={24} color="grey" />
              <View style={{ position: "absolute", top: 10, left: 10 }}>
                <Ionicons name="funnel" size={20} color="white" />
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
      {/* <View style={styles.bottomBarContainer}>
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => navigation.navigate("MainHome")}
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
      </View> */}
    </Container>
  );
};

export default NewMatrimony;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingBottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  headerText: {
    color: "#D4AF37",
    fontSize: 20,
    fontWeight: "bold",
  },
  profileImage: {
    width: 35,
    height: 35,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 15,
    color: "grey",
  },
  searchContainer: {
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  searchField: {
    // Define styles for search field
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
  scrollView: {
    padding: "2%",
    margin: "2%",
    display: "flex",
    flexDirection: "row",
    flex: 1,
  },
  cardContainer: {
    padding: 16,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
  },
  cardImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  cardHeader: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  cardText: {
    marginBottom: 8,
    fontSize: 14,
  },
  viewDetails: {
    color: "#D4AF37",
    fontWeight: "bold",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    paddingVertical: 10,
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
  },
  iconText: {
    marginTop: 4,
  },
});
