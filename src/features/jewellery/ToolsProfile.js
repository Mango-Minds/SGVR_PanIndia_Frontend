import React from 'react';
import { View , Text , Image , StyleSheet , TouchableOpacity , ScrollView , Dimensions , SafeAreaView} from 'react-native';
import MyJewelleryProfile from '../../components/Jewellery/MyProfile';
import ProfileHeader from '../../components/Jewellery/Header';
import { useNavigation } from '@react-navigation/native';


const ToolsProfile = () => {
    const navigation = useNavigation();
    return(
        <>
        <SafeAreaView style={{flex : 1 , backgroundColor : "white"}}>
        <ProfileHeader />
        <ScrollView >
        <MyJewelleryProfile />
        <View style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
         }}> 
            <Text style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#D4AF37",

            }}>Stock For Sale</Text>
            <View>
                <TouchableOpacity onPress={() => navigation.navigate("MyAllToolsProduct")}>
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

export default ToolsProfile;