import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import Furiniture from "../../assets/images/B2b/furniture.png";
import Electronics from "../../assets/images/B2b/Electronics.png";
import f1 from "../../assets/images/B2b/f1.png";
import HomeDecor from "../../assets/images/B2b/homedecor.png";
import { ScrollView } from "react-native-gesture-handler";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import WestsideImage from "../../assets/images/B2b/westside.png";
import LifestyleImage from "../../assets/images/B2b/lifestyle.png";
import { Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "react-query";
import { getProductCategories } from "../../services/B2B.services";

const ProductHome = () => {
  const navigation = useNavigation();
  const ProductCatagory = [
    {
      name: "Furniture",
      image: Furiniture,
      route: "CatagoryInner",
    },
    {
      name: "Electronics",
      image: Electronics,
      route: "Electronics",
    },
    {
      name: "Fashion",
      image: f1,
      route: "Fashion",
    },
    {
      name: "Home Decor",
      image: HomeDecor,
      route: "HomeDecor",
    },
  ];

  // useQuery("getProductsCategories", getProductCategories,{
  //   onSuccess:async (data) =>{
  //     console.log(data);
  //   }
  // });

  const Fashion = [
    {
      name: "Westside",
      image: WestsideImage,
      route: "Western",
      city: "Bangalore",
      Area: "Koramangala",
    },
    {
      name: "Lifestyle",
      image: LifestyleImage,
      route: "Lifestyle",
      city: "Bangalore",
      Area: "Indiranagar , Phase 2",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            paddingHorizontal: 15,
            paddingVertical: 15,
          }}
        >
          <Text style={styles.CatagoryHeading}>Catagories</Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={styles.catagoryContainer}>
              {ProductCatagory.map((item, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.CatagoryTumbnail}
                    onPress={() => navigation.navigate(item.route)}
                  >
                    <Image
                      source={item.image}
                      style={{ width: 80, height: 80 }}
                    />
                    <Text style={styles.CatagoryText}>{item.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
        <View
          style={{
            marginBottom: 25,
          }}
        >
          <View
            style={{
              paddingHorizontal: 15,
              paddingVertical: 5,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.CatagoryHeading}>Exclusive Fashion Stores</Text>
            <Pressable>
              <MaterialIcon
                name="arrow-forward-ios"
                size={20}
                color="#D4AF37"
              />
            </Pressable>
          </View>
          {Fashion.map((item, index) => {
            return (
              <>
                <Pressable key={index}>
                  <View style={styles.StoreCards}>
                    <Image source={item.image} style={styles.StoreImage} />
                    <View>
                      <Text style={styles.StoreName}>{item.name}</Text>
                      <View style={styles.LocationDiv}>
                        <MaterialIcon
                          name="location-on"
                          size={18}
                          color="#D4AF37"
                        />
                        <Text style={styles.Cityname}>{item.city}</Text>
                      </View>
                      <Text style={styles.AreaName}>{item.Area}</Text>
                    </View>
                  </View>
                </Pressable>
                <Divider />
              </>
            );
          })}
        </View>
        <View
          style={{
            marginBottom: 25,
          }}
        >
          <View
            style={{
              paddingHorizontal: 15,
              paddingVertical: 5,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.CatagoryHeading}>
              Exclusive Furniture Stores
            </Text>
            <Pressable>
              <MaterialIcon
                name="arrow-forward-ios"
                size={20}
                color="#D4AF37"
              />
            </Pressable>
          </View>
          {Fashion.map((item, index) => {
            return (
              <>
                <Pressable key={index}>
                  <View style={styles.StoreCards}>
                    <Image source={item.image} style={styles.StoreImage} />
                    <View>
                      <Text style={styles.StoreName}>{item.name}</Text>
                      <View style={styles.LocationDiv}>
                        <MaterialIcon
                          name="location-on"
                          size={18}
                          color="#D4AF37"
                        />
                        <Text style={styles.Cityname}>{item.city}</Text>
                      </View>
                      <Text style={styles.AreaName}>{item.Area}</Text>
                    </View>
                  </View>
                </Pressable>
                <Divider />
              </>
            );
          })}
        </View>
        <View
          style={{
            marginBottom: 25,
          }}
        >
          <View
            style={{
              paddingHorizontal: 15,
              paddingVertical: 5,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.CatagoryHeading}>
              Exclusive Electronics Stores
            </Text>
            <Pressable>
              <MaterialIcon
                name="arrow-forward-ios"
                size={20}
                color="#D4AF37"
              />
            </Pressable>
          </View>
          {Fashion.map((item, index) => {
            return (
              <>
                <Pressable key={index}>
                  <View style={styles.StoreCards}>
                    <Image source={item.image} style={styles.StoreImage} />
                    <View>
                      <Text style={styles.StoreName}>{item.name}</Text>
                      <View style={styles.LocationDiv}>
                        <MaterialIcon
                          name="location-on"
                          size={18}
                          color="#D4AF37"
                        />
                        <Text style={styles.Cityname}>{item.city}</Text>
                      </View>
                      <Text style={styles.AreaName}>{item.Area}</Text>
                    </View>
                  </View>
                </Pressable>
                <Divider />
              </>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductHome;

const styles = StyleSheet.create({
  catagoryContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 15,
  },
  CatagoryTumbnail: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  CatagoryHeading: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
    textAlign: "left",
    marginLeft: 10,
  },
  CatagoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9C9C9C",
    marginTop: 10,
  },
  StoreCards: {
    paddingHorizontal: 25,
    paddingVertical: 5,
    flexDirection: "row",
    marginVertical: 10,
  },
  StoreImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  StoreName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#D4AF37",
    marginBottom: 5,
  },
  LocationDiv: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 10,
  },
  Cityname: {
    fontSize: 13,
    fontWeight: "400",
    color: "#D4AF37",
    marginLeft: 5,
  },
  AreaName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#A0A0A0",
    marginTop: 5,
  },
});
