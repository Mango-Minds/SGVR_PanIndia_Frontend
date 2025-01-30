import React , {useState} from "react";
import { Text , View , TouchableOpacity , ScrollView , Image , StyleSheet , SafeAreaView , Dimensions , FlatList} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Divider, IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import Banglow from '../../assets/images/B2b/download.jpeg'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";

const MyProfile = () => {
    const navigation = useNavigation();
    const [Screen , setScreen] = useState("My Product");
    return(
        <SafeAreaView style={{flex:1 , backgroundColor : "white"}}>
             <View style={styles.container}>
        <View style={{ alignItems: "center" , flexDirection : "row"}}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
            <TopText
              style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
            >
              My Profile
            </TopText>
          </View>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}>
           <IconButton
            icon="bell-outline"
            style={{ marginLeft: "auto" }}
          ></IconButton>
          </View>
          
       </View>
       <ScrollView style={{
              paddingHorizontal: 20,
       }}>
        <View>
        <Text style={styles.ownerdetails}>
                <Text style={styles.ownerName}> Ritika Rastogi</Text>
            </Text>
            <Image source={Banglow} style={styles.ImageStyle}/>
           
           
            <View style={styles.contactDetails}>
            <MaterialIcon name="email" size={18} color="#D4AF37" />
            <Text style={styles.contact}>Ritika.Rastogi@gmail.com</Text>
            </View>
            <View style={styles.contactDetails}>
            <MaterialIcon name="phone" size={18} color="#D4AF37" />
            <Text style={styles.contact}>+91-7656465743</Text>
            </View>
            <View style={styles.contactDetails}>
            <MaterialIcon name="location-on" size={18} color="#D4AF37" />
            <Text style={styles.contact}>Omax Garden City, Bangalore Highway , Bangalore , Karnataka - 560102</Text>
            </View>
            <Divider style={{
                marginVertical: 15,
            }}/>
           <View style={{
                marginTop : 0,
            }}>
                <View style={{
                    flexDirection : "row",
                    alignItems : "center",
                    justifyContent : "space-between",
                }}>
                    <TouchableOpacity onPress={() => setScreen("My Product")}>
                        <View style={{
                    borderBottomColor : Screen === "My Product" ? "#D4AF37" : "white",
                    borderBottomWidth : 2,
                    padding : 10,
                    marginBottom : 10,
                    marginTop : 10,
                }}> 
                        <Text style={{
                    fontSize : 15,
                    fontWeight : "600",
                    color : Screen === "My Product" ? "#D4AF37" : "#9C9C9C",

                  }}>My Product</Text>
                        </View>
                        
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setScreen("My Property")}>
                        <View style={{
                    borderBottomColor : Screen === "My Property" ? "#D4AF37" : "white",
                    borderBottomWidth : 2,
                    padding : 10,
                    marginBottom : 10,
                    marginTop : 10,
                }}> 
                        <Text style={{
                    fontSize : 15,
                    fontWeight : "600",
                    color : Screen === "My Property" ? "#D4AF37" : "#9C9C9C",

                  }}>My Property</Text>
                        </View>
                        
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setScreen("Looking for")}>
                        <View style={{
                    borderBottomColor : Screen === "Looking for" ? "#D4AF37" : "white",
                    borderBottomWidth : 2,
                    padding : 10,
                    marginBottom : 10,
                    marginTop : 10,
                }}> 
                        <Text style={{
                    fontSize : 15,
                    fontWeight : "600",
                    color : Screen === "Looking for" ? "#D4AF37" : "#9C9C9C",

                  }}>Looking For</Text>
                        </View>
                        
                    </TouchableOpacity>
                </View>
            </View>
            {
                Screen === "My Product" ? (
                    <View>
                        <TouchableOpacity onPress={() => navigation.navigate("MyAllProduct")}>
                            <Text style={{
                                textAlign : "center",
                                textDecorationLine : "underline",
                            }}>View More</Text>
                        </TouchableOpacity>
                    </View>
                ) 
                : Screen === "My Property" ? (
                   
                             <TouchableOpacity onPress={() =>navigation.navigate("MyAllProperty")}>
                            <View>
                            <Text style={{
                                textAlign : "center",
                            }}>View More</Text>
                            </View>
                           
                        </TouchableOpacity>
                      
                )
                : Screen === "Looking for" ? (
                   
                             <TouchableOpacity onPress={() =>navigation.navigate("MyAllLookingfor")}>
                            <View>
                            <Text style={{
                                textAlign : "center",
                            }}>View More</Text>
                            </View>
                           
                        </TouchableOpacity>
                      
                )
                : null
            }
        </View>
        </ScrollView>
        </SafeAreaView>
    )
}


export default MyProfile;

const styles = StyleSheet.create({
    container : {
        paddingHorizontal: 10,
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ProfileHeading : {
        fontSize: 20,
        fontWeight: "600",
        marginTop: 10,
        marginBottom: 15,
        color : "#141414",
        letterSpacing : 0.3,
    },
    ImageStyle  : {
        width: "100%",
        height: 250,
        borderRadius: 10,
    },
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
    ownerdetails : {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 15,
        marginBottom: 15,
    },
    ownerhead : {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 20,
        marginBottom: 5,
        color : "#D4AF37",
    },
    ownerName : {
        fontSize: 18,
        fontWeight: "500",
        marginTop: 20,
        marginBottom: 5,
        color : "#1A1C1D",
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
    },
    EditButton : {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor : "#D4AF3733",
        borderRadius : 10,
        width : "100%",
        padding : "3%",
    },
    EditButtonText : {
        color : "#D4AF37",
        fontSize : 16,
        fontWeight : "500",
         letterSpacing : 0.5,
    },
})

