import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Pressable,
  } from "react-native";
  import React from "react";
  import { Row } from "../../styles/dashboard.styles";
  import { Ionicons } from "react-native-vector-icons";
  import Icon from "react-native-vector-icons/Ionicons";
  import { Divider, IconButton } from "react-native-paper";
  import { TopText } from "../../styles/social.styles";
  import { useNavigation } from "@react-navigation/native";
  import { Container, RowBetween, SearchField } from "../../styles/common.styles";
  import { styles } from "./JewelleryMainScreen";
  import AsyncStorageLib from "@react-native-async-storage/async-storage";
  const VendorsAllProductsScreen = ({ route }) => {
    // const { name } = route.params;
  
    const navigation = useNavigation();
    const [isloading, setIsloading] = React.useState(false);
  
    if (isloading) {
      return <ActivityIndicator style={{ display: "flex", flex: 1 }} />;
    } else {
      return (
        <Container
          style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
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
            <IconButton
            icon="plus"
            style={{ marginLeft: "auto" }}
            onPress={() => navigation.navigate("AddRetailProduct")}
          ></IconButton>
            <IconButton
              icon="bell-outline"
            
            ></IconButton>
          </RowBetween>
          <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
            <SearchField placeholder="Search" />
            <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
              <Icon name="search" size={24} />
            </View>
          </Row>
  
          <ScrollView>
            <View style={{ padding: "2.5%", paddingTop: "1%" }}>
              <View style={styles.eachJewelleryCardContainer}>
                <Pressable onPress={() => navigation.navigate("RetailProduct")}>
                  <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                    <Image
                      style={styles.eachJewelleryCardImg}
                      source={{
                        uri: "https://hatton-garden-jewellers.co.uk/wp-content/uploads/2023/06/blueFblue2blue1.jpg",
                      }}
                    ></Image>
                    <View style={{ marginLeft: "2%" }}>
                      <Text style={{ fontWeight: "700", marginTop: "1%" }}>
                        Products
                      </Text>
                      <View style={{ marginTop: "1%", flexDirection: "row" }}>
                        <Text style={styles.oldPrice}>₹52000</Text>
                        <Text
                          style={{ opacity: 0.5, marginLeft: "3%", fontSize: 13 }}
                        >
                          ₹48000
                        </Text>
                      </View>
                      <Text style={{ color: "#b58904" }}>View Details</Text>
                    </View>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() =>
                    navigation.navigate("RetailProduct", {
                      name: name,
                    })
                  }
                >
                  <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                    <Image
                      style={styles.eachJewelleryCardImg}
                      source={{
                        uri: "https://hatton-garden-jewellers.co.uk/wp-content/uploads/2023/06/blueFblue2blue1.jpg",
                      }}
                    ></Image>
                    <View style={{ marginLeft: "2%" }}>
                      <Text style={{ fontWeight: "700", marginTop: "1%" }}>
                        Products
                      </Text>
                      <View style={{ marginTop: "1%", flexDirection: "row" }}>
                        <Text style={styles.oldPrice}>₹52000</Text>
                        <Text
                          style={{ opacity: 0.5, marginLeft: "3%", fontSize: 13 }}
                        >
                          ₹48000
                        </Text>
                      </View>
                      <Text style={{ color: "#b58904" }}>View Details</Text>
                    </View>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() =>
                    navigation.navigate("RetailProduct", {
                      name: name,
                    })
                  }
                >
                  <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                    <Image
                      style={styles.eachJewelleryCardImg}
                      source={{
                        uri: "https://hatton-garden-jewellers.co.uk/wp-content/uploads/2023/06/blueFblue2blue1.jpg",
                      }}
                    ></Image>
                    <View style={{ marginLeft: "2%" }}>
                      <Text style={{ fontWeight: "700", marginTop: "1%" }}>
                        Products
                      </Text>
                      <View style={{ marginTop: "1%", flexDirection: "row" }}>
                        <Text style={styles.oldPrice}>₹52000</Text>
                        <Text
                          style={{ opacity: 0.5, marginLeft: "3%", fontSize: 13 }}
                        >
                          ₹48000
                        </Text>
                      </View>
                      <Text style={{ color: "#b58904" }}>View Details</Text>
                    </View>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() =>
                    navigation.navigate("RetailProduct", {
                      name: name,
                    })
                  }
                >
                  <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                    <Image
                      style={styles.eachJewelleryCardImg}
                      source={{
                        uri: "https://hatton-garden-jewellers.co.uk/wp-content/uploads/2023/06/blueFblue2blue1.jpg",
                      }}
                    ></Image>
                    <View style={{ marginLeft: "2%" }}>
                      <Text style={{ fontWeight: "700", marginTop: "1%" }}>
                        Products
                      </Text>
                      <View style={{ marginTop: "1%", flexDirection: "row" }}>
                        <Text style={styles.oldPrice}>₹52000</Text>
                        <Text
                          style={{ opacity: 0.5, marginLeft: "3%", fontSize: 13 }}
                        >
                          ₹48000
                        </Text>
                      </View>
                      <Text style={{ color: "#b58904" }}>View Details</Text>
                    </View>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() =>
                    navigation.navigate("RetailProduct", {
                      name: name,
                    })
                  }
                >
                  <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                    <Image
                      style={styles.eachJewelleryCardImg}
                      source={{
                        uri: "https://hatton-garden-jewellers.co.uk/wp-content/uploads/2023/06/blueFblue2blue1.jpg",
                      }}
                    ></Image>
                    <View style={{ marginLeft: "2%" }}>
                      <Text style={{ fontWeight: "700", marginTop: "1%" }}>
                        Products
                      </Text>
                      <View style={{ marginTop: "1%", flexDirection: "row" }}>
                        <Text style={styles.oldPrice}>₹52000</Text>
                        <Text
                          style={{ opacity: 0.5, marginLeft: "3%", fontSize: 13 }}
                        >
                          ₹48000
                        </Text>
                      </View>
                      <Text style={{ color: "#b58904" }}>View Details</Text>
                    </View>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() =>
                    navigation.navigate("RetailProduct", {
                      name: name,
                    })
                  }
                >
                  <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                    <Image
                      style={styles.eachJewelleryCardImg}
                      source={{
                        uri: "https://hatton-garden-jewellers.co.uk/wp-content/uploads/2023/06/blueFblue2blue1.jpg",
                      }}
                    ></Image>
                    <View style={{ marginLeft: "2%" }}>
                      <Text style={{ fontWeight: "700", marginTop: "1%" }}>
                        Products
                      </Text>
                      <View style={{ marginTop: "1%", flexDirection: "row" }}>
                        <Text style={styles.oldPrice}>₹52000</Text>
                        <Text
                          style={{ opacity: 0.5, marginLeft: "3%", fontSize: 13 }}
                        >
                          ₹48000
                        </Text>
                      </View>
                      <Text style={{ color: "#b58904" }}>View Details</Text>
                    </View>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() =>
                    navigation.navigate("RetailProduct", {
                      name: name,
                    })
                  }
                >
                  <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                    <Image
                      style={styles.eachJewelleryCardImg}
                      source={{
                        uri: "https://hatton-garden-jewellers.co.uk/wp-content/uploads/2023/06/blueFblue2blue1.jpg",
                      }}
                    ></Image>
                    <View style={{ marginLeft: "2%" }}>
                      <Text style={{ fontWeight: "700", marginTop: "1%" }}>
                        Products
                      </Text>
                      <View style={{ marginTop: "1%", flexDirection: "row" }}>
                        <Text style={styles.oldPrice}>₹52000</Text>
                        <Text
                          style={{ opacity: 0.5, marginLeft: "3%", fontSize: 13 }}
                        >
                          ₹48000
                        </Text>
                      </View>
                      <Text style={{ color: "#b58904" }}>View Details</Text>
                    </View>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() =>
                    navigation.navigate("RetailProduct", {
                      name: name,
                    })
                  }
                >
                  <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                    <Image
                      style={styles.eachJewelleryCardImg}
                      source={{
                        uri: "https://hatton-garden-jewellers.co.uk/wp-content/uploads/2023/06/blueFblue2blue1.jpg",
                      }}
                    ></Image>
                    <View style={{ marginLeft: "2%" }}>
                      <Text style={{ fontWeight: "700", marginTop: "1%" }}>
                        Products
                      </Text>
                      <View style={{ marginTop: "1%", flexDirection: "row" }}>
                        <Text style={styles.oldPrice}>₹52000</Text>
                        <Text
                          style={{ opacity: 0.5, marginLeft: "3%", fontSize: 13 }}
                        >
                          ₹48000
                        </Text>
                      </View>
                      <Text style={{ color: "#b58904" }}>View Details</Text>
                    </View>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() =>
                    navigation.navigate("RetailProduct", {
                      name: name,
                    })
                  }
                >
                  <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                    <Image
                      style={styles.eachJewelleryCardImg}
                      source={{
                        uri: "https://hatton-garden-jewellers.co.uk/wp-content/uploads/2023/06/blueFblue2blue1.jpg",
                      }}
                    ></Image>
                    <View style={{ marginLeft: "2%" }}>
                      <Text style={{ fontWeight: "700", marginTop: "1%" }}>
                        Products
                      </Text>
                      <View style={{ marginTop: "1%", flexDirection: "row" }}>
                        <Text style={styles.oldPrice}>₹52000</Text>
                        <Text
                          style={{ opacity: 0.5, marginLeft: "3%", fontSize: 13 }}
                        >
                          ₹48000
                        </Text>
                      </View>
                      <Text style={{ color: "#b58904" }}>View Details</Text>
                    </View>
                  </View>
                </Pressable>
              </View>
            </View>
            
          </ScrollView>
          
        </Container>
       
      );
    }
  };
  
  export default VendorsAllProductsScreen;
  