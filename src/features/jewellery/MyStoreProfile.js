import React from 'react';
import { View , Text , Image , StyleSheet , TouchableOpacity , ScrollView , Pressable , SafeAreaView} from 'react-native';
import MyJewelleryProfile from '../../components/Jewellery/MyProfile';
import ProfileHeader from '../../components/Jewellery/Header';
import { useNavigation } from '@react-navigation/native';


const MyStoreProfile = () => {
    const navigation = useNavigation();
    const [screen , setScreen] = React.useState('Product');
    return(
        <>
        <SafeAreaView style={{flex : 1 , backgroundColor : "white"}}>
        <ProfileHeader title="My Profile"/>
        <ScrollView >
        <MyJewelleryProfile />
        {/* <View style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
         }}> 
            <Text style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#D4AF37",

            }}>Stock For Sale</Text>
            <View>
                <TouchableOpacity onPress={() => navigation.navigate("MyAllStoreProduct")}>
                <Text style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#D4AF37",
                    textAlign: "center",
                    textDecorationLine: "underline",
                    textDecorationStyle: "solid",
                    lineHeight: 20,
                }}>View More</Text>
                </TouchableOpacity>
            </View>
         </View> */}
         <View style={{
                paddingHorizontal: 15,
            }}>
           <View style={{
                flexDirection : "row",
                justifyContent : "space-between",
                marginTop : 10,
                marginBottom : 10,
                alignItems : "center",
               
            }}>
              <TouchableOpacity style={{
                  borderBottomColor : screen === "Product" ? "#D4AF37" : "transparent",
                  borderBottomWidth : screen === "Product" ? 2 : 0,
                  paddingVertical : 10,
                  width : "50%",
              }} onPress={() => setScreen("Product")}>
               <Text style={{
                  textAlign : "center",
                  fontSize : 16,
                  fontWeight : "600",
                  letterSpacing : 0.5,
                  color : screen === "Product" ? "#D4AF37" : "#C5C5C5",
                }}>Product</Text>
                </TouchableOpacity>
              <TouchableOpacity style={{
                 borderBottomColor : screen === "Stock" ? "#D4AF37" : "transparent",
                 borderBottomWidth : screen === "Stock" ? 2 : 0,
                  paddingVertical : 10,
                  width : "50%",
              }} onPress={() => setScreen("Stock")}>
                <Text style={{
                 textAlign : "center",
                 fontSize : 16,
                 fontWeight : "600",
                 letterSpacing : 0.5,
                 color : screen === "Stock" ? "#D4AF37" : "#C5C5C5",
                }}>Stock for Sale</Text>
              </TouchableOpacity>
            </View>
            

            
            {
              screen === "Product" ? (
                <View style={{ marginTop: "0%" }}>
               <View style={styles.eachJewelleryCardContainer}>
                <Pressable
                    onPress={() =>
                      navigation.navigate("EachProduct")
                    }
                  >
                    <View style={[styles.shadowProp, styles.eachJewelleryCardi]}>
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{
                          uri: "https://cdn0.weddingwire.in/vendor/7377/3_2/960/jpg/52498680-10157051016053491-5369689626673938432-n-15-197011-1553579689_15_167377-1553583793.jpeg",
                        }}
                      ></Image>
                      <View style={{ marginLeft: "2%" , marginTop: "5%"}}>
                        <Text style={{ fontWeight: "700" , fontSize : 14 }}>
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
                        <Text style={{ color: "#b58904" , marginTop : 10 }}>View Details</Text>
                      </View>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      navigation.navigate("EachProduct")
                    }
                  >
                    <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{
                          uri: "https://cdn0.weddingwire.in/vendor/7377/3_2/960/jpg/52498680-10157051016053491-5369689626673938432-n-15-197011-1553579689_15_167377-1553583793.jpeg",
                        }}
                      ></Image>
                      <View style={{ marginLeft: "2%" , marginTop: "5%"}}>
                        <Text style={{ fontWeight: "700" , fontSize : 14 }}>
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
                        <Text style={{ color: "#b58904" , marginTop : 10 }}>View Details</Text>
                      </View>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      navigation.navigate("EachProduct")
                    }
                  >
                    <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{
                          uri: "https://cdn0.weddingwire.in/vendor/7377/3_2/960/jpg/52498680-10157051016053491-5369689626673938432-n-15-197011-1553579689_15_167377-1553583793.jpeg",
                        }}
                      ></Image>
                      <View style={{ marginLeft: "2%" , marginTop: "5%"}}>
                        <Text style={{ fontWeight: "700" , fontSize : 14 }}>
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
                        <Text style={{ color: "#b58904" , marginTop : 10 }}>View Details</Text>
                      </View>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      navigation.navigate("EachProduct")
                    }
                  >
                    <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{
                          uri: "https://cdn0.weddingwire.in/vendor/7377/3_2/960/jpg/52498680-10157051016053491-5369689626673938432-n-15-197011-1553579689_15_167377-1553583793.jpeg",
                        }}
                      ></Image>
                      <View style={{ marginLeft: "2%" , marginTop: "5%"}}>
                        <Text style={{ fontWeight: "700" , fontSize : 14 }}>
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
                        <Text style={{ color: "#b58904" , marginTop : 10 }}>View Details</Text>
                      </View>
                    </View>
                  </Pressable>

                  <TouchableOpacity style={{
                    alignItems : "center",
                    justifyContent : "center",
                    marginTop : "5%",
                    width : "100%",
                    marginBottom : "15%",
                  }} onPress={
                    () => navigation.navigate("MyAllStoreProduct")
                  }>
                    <Text style={{
                      fontSize : 16,
                      fontWeight : "600",
                      letterSpacing : 0.5,
                      color : "#D4AF37",
                      textAlign : "center",
                      textDecorationLine : "underline",
                    }}>View More Products</Text>
                  </TouchableOpacity>
                 
                </View>
              </View>
              ) 
              : screen === "Stock" ? (
                <View style={{ marginTop: "0%" }}>
               <View style={styles.eachJewelleryCardContainer}>
                <Pressable
                    onPress={() =>
                      navigation.navigate("EachProduct")
                    }
                  >
                    <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{
                          uri: "https://cdn0.weddingwire.in/vendor/7377/3_2/960/jpg/52498680-10157051016053491-5369689626673938432-n-15-197011-1553579689_15_167377-1553583793.jpeg",
                        }}
                      ></Image>
                      <View style={{ marginLeft: "2%" , marginTop: "5%"}}>
                        <Text style={{ fontWeight: "700" , fontSize : 14 }}>
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
                        <Text style={{ color: "#b58904" , marginTop : 10 }}>View Details</Text>
                      </View>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      navigation.navigate("EachProduct")
                    }
                  >
                    <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{
                          uri: "https://cdn0.weddingwire.in/vendor/7377/3_2/960/jpg/52498680-10157051016053491-5369689626673938432-n-15-197011-1553579689_15_167377-1553583793.jpeg",
                        }}
                      ></Image>
                      <View style={{ marginLeft: "2%" , marginTop: "5%"}}>
                        <Text style={{ fontWeight: "700" , fontSize : 14 }}>
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
                        <Text style={{ color: "#b58904" , marginTop : 10 }}>View Details</Text>
                      </View>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      navigation.navigate("EachProduct")
                    }
                  >
                    <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{
                          uri: "https://cdn0.weddingwire.in/vendor/7377/3_2/960/jpg/52498680-10157051016053491-5369689626673938432-n-15-197011-1553579689_15_167377-1553583793.jpeg",
                        }}
                      ></Image>
                      <View style={{ marginLeft: "2%" , marginTop: "5%"}}>
                        <Text style={{ fontWeight: "700" , fontSize : 14 }}>
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
                        <Text style={{ color: "#b58904" , marginTop : 10 }}>View Details</Text>
                      </View>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      navigation.navigate("EachProduct")
                    }
                  >
                    <View style={[styles.shadowProp, styles.eachJewelleryCard]}>
                      <Image
                        style={styles.eachJewelleryCardImg}
                        source={{
                          uri: "https://cdn0.weddingwire.in/vendor/7377/3_2/960/jpg/52498680-10157051016053491-5369689626673938432-n-15-197011-1553579689_15_167377-1553583793.jpeg",
                        }}
                      ></Image>
                      <View style={{ marginLeft: "2%" , marginTop: "5%"}}>
                        <Text style={{ fontWeight: "700" , fontSize : 14 }}>
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
                        <Text style={{ color: "#b58904" , marginTop : 10 }}>View Details</Text>
                      </View>
                    </View>
                  </Pressable>

                  <TouchableOpacity style={{
                    alignItems : "center",
                    justifyContent : "center",
                    marginTop : "5%",
                    width : "100%",
                    marginBottom : "15%",
                  }} onPress={() => navigation.navigate("MyAllStoreStockProduct")}>
                    <Text style={{
                      fontSize : 16,
                      fontWeight : "600",
                      letterSpacing : 0.5,
                      color : "#D4AF37",
                      textAlign : "center",
                      textDecorationLine : "underline",
                      }}>View More in Stocks</Text>
                  </TouchableOpacity>
                 
                </View>
              </View>
              ) : null
            }
            </View>
        
        </ScrollView>
        </SafeAreaView>
        
        </>
      
       
    )
}

export default MyStoreProfile;

const styles = StyleSheet.create({
    Aboutus : {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 15,
      marginBottom: 5,
      color : "#141414",
  },
  description : {
      fontSize: 14,
      fontWeight: "400",
      marginTop: 5,
      marginBottom: 5,
      color : "#7E7E7E",
      letterSpacing : 0.3,
      lineHeight : 20,
  },
  contactDetails : {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 15,
  },
  contact : {
    fontSize: 13,
    fontWeight: "400",
    color : "#1C1C1C",
    marginLeft: 10,
    lineHeight : 20,
    width : "95%",
  },
  eachJewelleryCard: {
    width: 185,
    marginRight: "1%",
    padding: "4%",
    marginBottom: "3%",
  },
  eachJewelleryCardImg: {
    width: 170,
    height: 110,
    borderRadius: 4,
  },
  eachJewelleryCardFooter: {
    backgroundColor: "#D4AF37",
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    padding: "3%",
  },
  eachJewelleryCardContainer: {
    marginTop: "4%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",},
    shadowProp: {
        backgroundColor: "white",
        borderRadius: 6,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 1.41,
        elevation: 2,
      },
  });