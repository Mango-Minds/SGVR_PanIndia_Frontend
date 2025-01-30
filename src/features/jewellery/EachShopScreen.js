import {
  StyleSheet,
  Text,
  Image,
  View,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { styles } from "./JewelleryMainScreen";
import React, { useState } from "react";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { Divider, IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import { useNavigation } from "@react-navigation/native";
import { getEachShopData } from "../../services/jewellery.services";

const EachShopScreen = ({ route }) => {
  const navigation = useNavigation();
  const [screen, setScreen] = useState("Product");

  
  const{user } = route.params;


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
            {/* {name} */}
            Store Details
          </TopText>
        </View>
        
        {/* <IconButton
          icon="bell-outline"
          style={{ marginRight:"0px" }}
        ></IconButton> */}
      </RowBetween>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{ padding: "3%", marginTop: "2%", flexDirection: "column" }}
        >
          <Image
            style={{
              margin: "0.5%",
              borderRadius: 4,
              width: 385,
              height: 260,
            }}
            // source={require("../../assets/images/B2b/download.jpeg")}
            source={{ uri: user.image }}
          ></Image>
          <View style={{ flexDirection: "column" }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                opacity: 0.8,
                marginTop: "3%",
              }}
            >
               {user.firstName} {user.lastName}
            </Text>
            <View
              style={{
                flexDirection: "column",
                marginTop: 20,
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#D4AF37",
                }}
              >
                About Us :
              </Text>
              <Text style={style.description}>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s,
              </Text>
            </View>
            <View>
              <View style={style.contactDetails}>
                <MaterialIcon name="email" size={18} color="#D4AF37" />
                <Text style={style.contact}>{user.email}</Text>
              </View>
              <View style={style.contactDetails}>
                <MaterialIcon name="phone" size={18} color="#D4AF37" />
                <Text style={style.contact}>{user.phone}</Text>
              </View>
              <View style={[style.contactDetails, { marginBottom: 20 }]}>
                <MaterialIcon name="location-on" size={18} color="#D4AF37" />
                <Text style={style.contact}>
                  Omax Garden City, Bangalore Highway , Bangalore , Karnataka -
                  560102
                </Text>
              </View>
              <Divider />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 10,
                marginBottom: 10,
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={{
                  borderBottomColor:
                    screen === "Product" ? "#D4AF37" : "transparent",
                  borderBottomWidth: screen === "Product" ? 2 : 0,
                  paddingVertical: 10,
                  width: "50%",
                }}
                onPress={() => setScreen("Product")}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "600",
                    letterSpacing: 0.5,
                    color: screen === "Product" ? "#D4AF37" : "#C5C5C5",
                  }}
                >
                  Product
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  borderBottomColor:
                    screen === "Stock" ? "#D4AF37" : "transparent",
                  borderBottomWidth: screen === "Stock" ? 2 : 0,
                  paddingVertical: 10,
                  width: "50%",
                }}
                onPress={() => setScreen("Stock")}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "600",
                    letterSpacing: 0.5,
                    color: screen === "Stock" ? "#D4AF37" : "#C5C5C5",
                  }}
                >
                  Stock for Sale
                </Text>
              </TouchableOpacity>
            </View>
            {screen === "Product" ? (
              <View style={{ marginTop: "0%" }}>
                <View style={styles.eachJewelleryCardContainer}>
                  <Pressable onPress={() => navigation.navigate("EachProduct")}>
                    <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{
                          uri: "https://cdn0.weddingwire.in/vendor/7377/3_2/960/jpg/52498680-10157051016053491-5369689626673938432-n-15-197011-1553579689_15_167377-1553583793.jpeg",
                        }}
                      ></Image>
                      <View style={{ marginLeft: "2%", marginTop: "5%" }}>
                        <Text style={{ fontWeight: "700", fontSize: 14 }}>
                          Hazratgan
                        </Text>
                        <View style={{ marginTop: "3%", flexDirection: "row" }}>
                          <Text
                            style={{
                              opacity: 0.5,
                              marginLeft: "0%",
                              fontSize: 13,
                            }}
                          >
                            ₹48000
                          </Text>
                        </View>
                        <Text style={{ color: "#b58904", marginTop: 10 }}>
                          View Details
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => navigation.navigate("EachProduct")}>
                    <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{
                          uri: "https://cdn0.weddingwire.in/vendor/7377/3_2/960/jpg/52498680-10157051016053491-5369689626673938432-n-15-197011-1553579689_15_167377-1553583793.jpeg",
                        }}
                      ></Image>
                      <View style={{ marginLeft: "2%", marginTop: "5%" }}>
                        <Text style={{ fontWeight: "700", fontSize: 14 }}>
                          Hazratgan
                        </Text>
                        <View style={{ marginTop: "3%", flexDirection: "row" }}>
                          <Text
                            style={{
                              opacity: 0.5,
                              marginLeft: "0%",
                              fontSize: 13,
                            }}
                          >
                            ₹48000
                          </Text>
                        </View>
                        <Text style={{ color: "#b58904", marginTop: 10 }}>
                          View Details
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => navigation.navigate("EachProduct")}>
                    <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{
                          uri: "https://cdn0.weddingwire.in/vendor/7377/3_2/960/jpg/52498680-10157051016053491-5369689626673938432-n-15-197011-1553579689_15_167377-1553583793.jpeg",
                        }}
                      ></Image>
                      <View style={{ marginLeft: "2%", marginTop: "5%" }}>
                        <Text style={{ fontWeight: "700", fontSize: 14 }}>
                          Hazratgan
                        </Text>
                        <View style={{ marginTop: "3%", flexDirection: "row" }}>
                          <Text
                            style={{
                              opacity: 0.5,
                              marginLeft: "0%",
                              fontSize: 13,
                            }}
                          >
                            ₹48000
                          </Text>
                        </View>
                        <Text style={{ color: "#b58904", marginTop: 10 }}>
                          View Details
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => navigation.navigate("EachProduct")}>
                    <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{
                          uri: "https://cdn0.weddingwire.in/vendor/7377/3_2/960/jpg/52498680-10157051016053491-5369689626673938432-n-15-197011-1553579689_15_167377-1553583793.jpeg",
                        }}
                      ></Image>
                      <View style={{ marginLeft: "2%", marginTop: "5%" }}>
                        <Text style={{ fontWeight: "700", fontSize: 14 }}>
                          Hazratgan
                        </Text>
                        <View style={{ marginTop: "3%", flexDirection: "row" }}>
                          <Text
                            style={{
                              opacity: 0.5,
                              marginLeft: "0%",
                              fontSize: 13,
                            }}
                          >
                            ₹48000
                          </Text>
                        </View>
                        <Text style={{ color: "#b58904", marginTop: 10 }}>
                          View Details
                        </Text>
                      </View>
                    </View>
                  </Pressable>

                  <TouchableOpacity
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "5%",
                      width: "100%",
                      marginBottom: "15%",
                    }}
                  >
                    <Pressable
                      onPress={() => navigation.navigate("EachShopAllProducts")}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          letterSpacing: 0.5,
                          color: "#D4AF37",
                          textAlign: "center",
                          textDecorationLine: "underline",
                        }}
                      >
                        View More Products
                      </Text>
                    </Pressable>
                  </TouchableOpacity>
                </View>
              </View>
            ) : screen === "Stock" ? (
              <View style={{ marginTop: "0%" }}>
                <View style={styles.eachJewelleryCardContainer}>
                  <Pressable onPress={() => navigation.navigate("EachProduct")}>
                    <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{
                          uri: "https://cdn0.weddingwire.in/vendor/7377/3_2/960/jpg/52498680-10157051016053491-5369689626673938432-n-15-197011-1553579689_15_167377-1553583793.jpeg",
                        }}
                      ></Image>
                      <View style={{ marginLeft: "2%", marginTop: "5%" }}>
                        <Text style={{ fontWeight: "700", fontSize: 14 }}>
                          Hazratgan
                        </Text>
                        <View style={{ marginTop: "3%", flexDirection: "row" }}>
                          <Text
                            style={{
                              opacity: 0.5,
                              marginLeft: "0%",
                              fontSize: 13,
                            }}
                          >
                            ₹48000
                          </Text>
                        </View>
                        <Text style={{ color: "#b58904", marginTop: 10 }}>
                          View Details
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => navigation.navigate("EachProduct")}>
                    <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{
                          uri: "https://cdn0.weddingwire.in/vendor/7377/3_2/960/jpg/52498680-10157051016053491-5369689626673938432-n-15-197011-1553579689_15_167377-1553583793.jpeg",
                        }}
                      ></Image>
                      <View style={{ marginLeft: "2%", marginTop: "5%" }}>
                        <Text style={{ fontWeight: "700", fontSize: 14 }}>
                          Hazratgan
                        </Text>
                        <View style={{ marginTop: "3%", flexDirection: "row" }}>
                          <Text
                            style={{
                              opacity: 0.5,
                              marginLeft: "0%",
                              fontSize: 13,
                            }}
                          >
                            ₹48000
                          </Text>
                        </View>
                        <Text style={{ color: "#b58904", marginTop: 10 }}>
                          View Details
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => navigation.navigate("EachProduct")}>
                    <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{
                          uri: "https://cdn0.weddingwire.in/vendor/7377/3_2/960/jpg/52498680-10157051016053491-5369689626673938432-n-15-197011-1553579689_15_167377-1553583793.jpeg",
                        }}
                      ></Image>
                      <View style={{ marginLeft: "2%", marginTop: "5%" }}>
                        <Text style={{ fontWeight: "700", fontSize: 14 }}>
                          Hazratgan
                        </Text>
                        <View style={{ marginTop: "3%", flexDirection: "row" }}>
                          <Text
                            style={{
                              opacity: 0.5,
                              marginLeft: "0%",
                              fontSize: 13,
                            }}
                          >
                            ₹48000
                          </Text>
                        </View>
                        <Text style={{ color: "#b58904", marginTop: 10 }}>
                          View Details
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => navigation.navigate("EachProduct")}>
                    <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{
                          uri: "https://cdn0.weddingwire.in/vendor/7377/3_2/960/jpg/52498680-10157051016053491-5369689626673938432-n-15-197011-1553579689_15_167377-1553583793.jpeg",
                        }}
                      ></Image>
                      <View style={{ marginLeft: "2%", marginTop: "5%" }}>
                        <Text style={{ fontWeight: "700", fontSize: 14 }}>
                          Hazratgan
                        </Text>
                        <View style={{ marginTop: "3%", flexDirection: "row" }}>
                          <Text
                            style={{
                              opacity: 0.5,
                              marginLeft: "0%",
                              fontSize: 13,
                            }}
                          >
                            ₹48000
                          </Text>
                        </View>
                        <Text style={{ color: "#b58904", marginTop: 10 }}>
                          View Details
                        </Text>
                      </View>
                    </View>
                  </Pressable>

                  <TouchableOpacity
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "5%",
                      width: "100%",
                      marginBottom: "15%",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        letterSpacing: 0.5,
                        color: "#D4AF37",
                        textAlign: "center",
                        textDecorationLine: "underline",
                      }}
                    >
                      View More in Stocks
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

export default EachShopScreen;

const style = StyleSheet.create({
  Aboutus: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
    color: "#141414",
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
    marginTop: 5,
    marginBottom: 5,
    color: "#7E7E7E",
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  contactDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 15,
  },
  contact: {
    fontSize: 13,
    fontWeight: "400",
    color: "#1C1C1C",
    marginLeft: 10,
    lineHeight: 20,
    width: "95%",
  },
});
