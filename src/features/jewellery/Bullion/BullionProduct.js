import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    Pressable,
    Dimensions,
    TouchableOpacity,
  } from "react-native";
  import React from "react";
  import { Row } from "../../../styles/dashboard.styles";
  import { Divider, IconButton } from "react-native-paper";
  import { TopText } from "../../../styles/social.styles";
  import { useNavigation } from "@react-navigation/native";
  import { Container, RowBetween, SearchField } from "../../../styles/common.styles";
  const WINDOW_WIDTH = Dimensions.get("window").width;
  const WINDOW_HEIGHT = Dimensions.get("window").height;
  
  const GemstoneProduct = ({ route }) => {
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
              Bullion
            </TopText>
          </View>
          <IconButton
            icon="bell-outline"
            style={{ marginLeft: "auto" }}
          ></IconButton>
        </RowBetween>
        <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: "4%" }}>
          <Text style={{ fontWeight: "700", fontSize: 22, opacity: 0.8 }}>
            Gold Necklace
          </Text>
          <Image
            style={{
              width: "100%",
              height: 240,
              marginTop: "4%",
              borderRadius: 5,
            }}
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQq1IkSrb16qU9WEDTasSrvxivdkmKo14IkhPdddU4ngzkvdZOJ3fsZ3apV5cGoy8hkbyQ&usqp=CAU",
            }}
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
              Bullion Pictures
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
                  source={{
                    uri: "https://i.pinimg.com/originals/6d/67/ea/6d67ea1f533c6fd08d355ea854c0b7f2.jpg",
                  }}
                />
              </View>
            ))}
          </ScrollView>
          {/* </View> */}
          <View style={{ marginTop: "2%" }}>
            <Text
              style={{
                fontWeight: "700",
                opacity: 1,
                fontSize: 16,
                marginBottom: "2%",
              }}
            >
              About Bullion
            </Text>
            <Text style={{
                fontSize: 14,
                color : "#7E7E7E",
                lineHeight: 20,
                fontWeight: "500",
            }}>
              Lorem ipsum dolor sit amet. Est dicta minus est provident ratione
              est recusandae unde? At perferendis optio sit laudantium aspernatur
              vel ullam saepe a earum itaque vel suscipit nesciunt.
            </Text>
          </View>
         <View style={{ flexDirection: "row" , marginTop : "5%" }}>
            <Text style={{ fontSize: 15 , fontWeight : "500"}}>Gold Available : </Text>
            <Text style={{ fontSize: 15, color: "#D4AF37", fontWeight : "600" }}>99.5</Text>
            <Text style={{ fontSize: 15, color: "#D4AF37", fontWeight : "600" }}>  ₹500/-</Text>
          </View>
         
          {/* </View> */}
        </View>
        <TouchableOpacity style={{
            backgroundColor: "#D4AF3733",
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
            marginTop: "5%",
            marginBottom: "5%",
            marginHorizontal: "5%",
            paddingVertical: "3%",
        }} onPress={() => navigation.navigate("EditBullion")}>
            <Text style={{
                color: "#D4AF37",
                fontSize: 16,
                fontWeight: "500",
            }}>Edit Product</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{
            backgroundColor: "#D80808",
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
            marginTop: "0%",
            marginBottom: "5%",
            marginHorizontal: "5%",
            paddingVertical: "3%",
        }}>
            <Text style={{
                color: "white",
                fontSize: 16,
                fontWeight: "500",

            }}>Delete Product</Text>
        </TouchableOpacity>
        </ScrollView>
        
  
       
      </Container>
    );
  };
  
  export default GemstoneProduct;
  
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
      marginTop: "3%",
      backgroundColor: "#f7f1d5",
      padding: "2%",
      borderRadius: 9,
      marginRight: "2%",
    },
    qqtxt: {
      fontSize: 15,
      color: "#D4AF37",
      fontWeight: "600",
      letterSpacing: 0.3,
    },
    eachJewelleryCardFooter: {
      backgroundColor: "#D4AF37",
      opacity: 0.8,
      justifyContent: "center",
      alignItems: "center",
      padding: "3%",
    },
  });
  