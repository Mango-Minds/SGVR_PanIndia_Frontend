import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    Pressable,
    Dimensions,
  } from "react-native";
  import React from "react";
  import { Row } from "../../styles/dashboard.styles";
  import { Divider, IconButton } from "react-native-paper";
  import { TopText } from "../../styles/social.styles";
  import { useNavigation } from "@react-navigation/native";
  import MaterialIcons from "react-native-vector-icons/MaterialIcons";
  import Chair from '../../assets/images/B2b/prop1.png';

  
  import { Container, RowBetween, SearchField } from "../../styles/common.styles";
  
  const WINDOW_WIDTH = Dimensions.get("window").width;
  const WINDOW_HEIGHT = Dimensions.get("window").height;
  
  const ProductDetails = () => {
    const navigation = useNavigation();
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
              Property Details
            </TopText>
          </View>
          <IconButton
            icon="bell-outline"
            style={{ marginLeft: "auto" }}
          ></IconButton>
        </RowBetween>
        <ScrollView showsVerticalScrollIndicator={false} enable>
        <View style={{ padding: "4%" }}>
          <Text style={{ fontWeight: "700", fontSize: 22, opacity: 0.8 }}>
            Goenka Villa & Resort
          </Text>
          <Image
            style={{
              width: "100%",
              height: 240,
              marginTop: "4%",
              borderRadius: 5,
            }}
            source={Chair}
          ></Image>
          <View style={{ marginTop: "4%" }}>
            <Text
              style={{
                fontWeight: "700",
                opacity: 1,
                fontSize: 16,
                marginBottom: "2%",
              }}
            >
              Property Pictures
            </Text>
          </View>
          {/* <View style={{ flexDirection: "row" }}> */}
           <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            {[0, 1, 2, 3, 4, 5].map((item, index) => (
              <View style={{ margin: "3%",flex:1,marginHorizontal:6 }} key={index}>
                <Image
                  style={{ width: 60, height: 60, borderRadius: 5 }}
                  source={Chair}
                />
              </View>
            ))}
          </ScrollView>
          {/* </View> */}
          
          <View>
            <Text style={{
               marginVertical : 12,
            }}>
                <Text style={{
                    fontWeight: "700",
                    opacity: 1,
                    fontSize: 14,
                    marginBottom: "2%",
                }}>Property type : </Text>
                <Text style={{
                    fontWeight: "500",
                    opacity: 1,
                    fontSize: 14,
                    color : "#D4AF37"
                }}>Homestay</Text>
            </Text>
          </View>
          <View>
            <Text style={{
                marginVertical : 12,
               }}>
                <Text style={{
                    fontWeight: "700",
                    opacity: 1,
                    fontSize: 14,
                    marginBottom: "2%",
                }}>Property Area : </Text>
                <Text style={{
                    fontWeight: "500",
                    opacity: 1,
                    fontSize: 14,
                    color : "#D4AF37"
                }}>3000 sqft</Text>
            </Text>
          </View>
          <View>
            <Text style={{
                    fontWeight: "700",
                    opacity: 1,
                    fontSize: 14,
                    marginBottom: "2%",
                }}>Available </Text>
            <View style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                marginVertical : 12,
            }}>
                <Text style={{
                    fontWeight: "700",
                    opacity: 1,
                    fontSize: 14,
                    color : "#D4AF37",
                    backgroundColor: "#D4AF371A",
                    padding: "2%",
                    marginRight: "2%",
                    borderRadius: 5,
                }}>2 BHK</Text>
                <Text style={{
                    fontWeight: "700",
                    opacity: 1,
                    fontSize: 14,
                    color : "#D4AF37",
                    backgroundColor: "#D4AF371A",
                    padding: "2%",
                    marginRight: "2%",
                    borderRadius: 5,
                }}>1 RK</Text>
            </View>
          </View>
         <View style={{ flexDirection: "row" , alignItems : "center", marginTop : 5}}>
            
            <Text style={{ fontSize: 17, margin: "1%" , color : "#1A1C1D" , fontWeight : "600"}}>₹ 48000</Text>
            <Text style={{
                fontSize: 15,
                margin: "1%",
                color: "#9C9C9C",
                fontWeight: "600",
                }}>Fixed Price</Text>
          </View>
          <View style={{ marginTop: "2%" }}>
            <Text
              style={{
                fontWeight: "700",
                opacity: 1,
                fontSize: 16,
                marginBottom: "2%",
              }}
            >
              About Product
            </Text>
            <Text style={{
                fontSize: 13,
                color: "#9C9C9C",
                fontWeight: "600",
                lineHeight: 20,
            }}>
              Lorem ipsum dolor sit amet. Est dicta minus est provident ratione
              est recusandae unde? At perferendis optio sit laudantium aspernatur
              vel ullam saepe a earum itaque vel suscipit nesciunt.
            </Text>
          </View>
          <View style={{
                marginTop: "5%",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                paddingBottom : "3%",
          }}>
            <MaterialIcons name="location-on" size={20} color="#D4AF37" />
            <Text style={{
                fontSize: 13.5,
                margin: "1%",
                color: "#9C9C9C",
                fontWeight: "600",
                width: "90%",

            }}>Kakori Bazar , Andheri East , Mumbai, Maharashtra </Text>
          </View>
          <Divider/>
          <View style={{
                marginTop: "2%",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",

          }}>
            <Text style={{
                fontSize: 17, 
                margin: "1%",
                color: "#1A1C1D",
                fontWeight: "600",
                width: "90%",

            }}>Rakesh Kaneria</Text>
          </View>
          <View style={{
                marginTop: "3%",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
          }}>
            <MaterialIcons name="mail" size={20} color="#D4AF37" />
            <Text style={{
                fontSize: 13.5,
                margin: "1%",
                color: "#9C9C9C",
                fontWeight: "600",
                width: "90%",

            }}>rakesh.76@gmail.com </Text>
          </View>
          <View style={{
                marginTop: "3%",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
          }}>
            <MaterialIcons name="location-on" size={20} color="#D4AF37" />
            <Text style={{
                fontSize: 13.5,
                margin: "1%",
                color: "#9C9C9C",
                fontWeight: "600",
                width: "90%",

            }}>Kakori Bazar , Andheri East , Mumbai, Maharashtra </Text>
          </View>
         
         
          {/* </View> */}
        </View>
        </ScrollView>
  
        <Pressable style={styles.footer}>
          <View style={styles.eachJewelleryCardFooter}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
              Call
            </Text>
          </View>
        </Pressable>
      </Container>
    );
  };
  
  export default ProductDetails;
  
  const styles = StyleSheet.create({
    footer: {
      position: "absolute",
      height: 50,
      left: 0,
      bottom: -2,
      width: WINDOW_WIDTH,
    },
    oldPrice: {
      textDecorationLine: "line-through",
      textDecorationStyle: "solid",
      opacity: 0.9,
      fontSize: 13,
      color: "#D4AF37",
      margin: "1%",
    },
    qq: {
      margin: "3%",
      backgroundColor: "#f7f1d5",
      padding: "2%",
      borderRadius: 9,
    },
    qqtxt: {
      fontSize: 12,
      color: "#D4AF37",
    },
    eachJewelleryCardFooter: {
      backgroundColor: "#D4AF37",
      opacity: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: "3%",
    },
  });
  