import React from 'react';
import { View , Text , Image , StyleSheet , TouchableOpacity , ScrollView , Dimensions , SafeAreaView} from 'react-native';
import VendorProfile from '../../components/Jewellery/VendorProfile';
import ProfileHeader from '../../components/Jewellery/Header';
import { useNavigation } from '@react-navigation/native';


const OtherVendorProfile = () => {
    const navigation = useNavigation();
    return(
        <>
        <SafeAreaView style={{flex : 1 , backgroundColor : "white"}}>
        <ProfileHeader title="Vendor Profile" />
        <ScrollView >
        <VendorProfile />
        <View style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
         }}> 
            <Text style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#D4AF37",

            }}>More Products</Text>
            <View>
                <TouchableOpacity onPress={() => navigation.navigate("OtherVendorAllStoreProduct")}>
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
         </View>
        
        </ScrollView>
        </SafeAreaView>
        
        </>
      
       
    )
}

export default OtherVendorProfile;