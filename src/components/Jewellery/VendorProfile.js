import React , {useState} from "react";
import { Text , View , TouchableOpacity , ScrollView , Image , StyleSheet , SafeAreaView , Dimensions , FlatList} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Divider, IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import Banglow from '../../assets/images/B2b/download.jpeg'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const VendorProfile = () => {
    const navigation = useNavigation();
    return(
        <>
            
     <View style={{
              paddingHorizontal: 20,
       }}>
        <Text style={styles.ownerdetails}>
                <Text style={styles.ownerName}>Store Name</Text>
            </Text>
            <Image source={Banglow} style={styles.ImageStyle}/>
            <View style={{
                flexDirection : "column",
                marginTop : 20,
                marginBottom : 10,
            }}>
                <Text style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#D4AF37",

                }}>About Us :</Text>
            <Text style={styles.description}>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,</Text>
            </View>
           <Divider />
            <View style={styles.contactDetails}>
                <Text style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#D4AF37",

                }}>Owner Details :</Text>
            <Text style={styles.contact}>Owner Name</Text>
            </View>
            <View style={styles.contactDetails}>
            <MaterialIcon name="email" size={18} color="#D4AF37" />
            <Text style={styles.contact}>Ritika.Rastogi@gmail.com</Text>
            </View>
            <View style={styles.contactDetails}>
            <MaterialIcon name="phone" size={18} color="#D4AF37" />
            <Text style={styles.contact}>+91-7656465743</Text>
            </View>
            <View style={[styles.contactDetails,{marginBottom : "5%"} ]}>
            <MaterialIcon name="location-on" size={18} color="#D4AF37" />
            <Text style={styles.contact}>Omax Garden City, Bangalore Highway , Bangalore , Karnataka - 560102</Text>
            </View>
            <Divider />
        </View>
        
       </>
    )
}


export default VendorProfile;

const styles = StyleSheet.create({
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
        lineHeight : 20,
    },
    EditButton : {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor : "#D4AF3733",
        borderRadius : 10,
        width : "100%",
        padding : "3%",
        marginVertical : 10,
    },
    EditButtonText : {
        color : "#D4AF37",
        fontSize : 16,
        fontWeight : "500",
         letterSpacing : 0.5,
    },
})

