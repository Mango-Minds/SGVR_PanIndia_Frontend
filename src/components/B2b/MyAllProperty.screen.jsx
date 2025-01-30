import React from 'react';
import { View , Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView, FlatList, ActivityIndicator, Alert , SafeAreaView} from 'react-native';
import Sofa from '../../assets/images/B2b/sofa.png';
import { Divider, IconButton } from "react-native-paper";
import { TopText} from '../../styles/social.styles'
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Prop1 from '../../assets/images/B2b/prop1.png';
import Prop2 from '../../assets/images/B2b/prop2.png';
import Prop3 from '../../assets/images/B2b/prop3.png';
import Prop4 from '../../assets/images/B2b/prop4.png';
import PropertyCard from './PropertyCard';


const MyAllProperty = () => {
    const navigation = useNavigation();
    const proparty = [
        {
            Name: "Omax City I",
            Image: Prop1,
            id : 1,
            city : "Bangalore",
            price : "₹1,00,000",
            propertytype : "Apartment",
        },
        {
            Name: "Omax City II",
            Image: Prop2,
            id : 2,
            city : "Bangalore",
            price : "₹1,00,000",
            propertytype : "Apartment",
        },
        {
            Name: "Omax City III",
            Image: Prop3,
            id : 3,
            city : "Bangalore",
            price : "₹1,00,000",
            propertytype : "Apartment",
        },
        {
            Name: "Omax City IV",
            Image: Prop4,
            id : 4,
            city : "Bangalore",
            price : "₹1,00,000",
            propertytype : "Apartment",
        },
        {
          Name: "Omax City IV",
          Image: Prop4,
          id : 5,
          city : "Bangalore",
          price : "₹1,00,000",
          propertytype : "Apartment",
      },

    ]
    return (
        <SafeAreaView style={{
            backgroundColor : "white",
             flex : 1,
         }}>
        <View style={{
            paddingHorizontal : 15,
            paddingVertical : 10,
        }}>
       <View style={{
              flexDirection : "row",
                justifyContent : "space-between",
       }}>
        <View style={{ alignItems: "center" , flexDirection : "row"}}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
            <Text style={{
                fontSize : 18,
                fontWeight : "600",
                marginLeft : 2,

            }}>
              My Property
              </Text>
          </View>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <TouchableOpacity onPress={() => navigation.navigate("AddProperty")}>
            <MaterialCommunityIcons name="plus" size={25} color="black" style={{marginRight : 10}}/>
            </TouchableOpacity>
            
            <IconButton
            icon="bell-outline"
            style={{ marginLeft: "auto" }}
          ></IconButton>
          </View>
          
       </View>
       <Divider style={{
        marginVertical : 10,
       }}/>
        <FlatList 

        data={proparty}
        renderItem={({item}) => (
            <PropertyCard  items={item}/>
    )}
        keyExtractor={item => item.id.toString()}
    />
</View>
        </SafeAreaView>
       
    );
}


export default MyAllProperty;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        marginVertical: 5,
        borderRadius: 5,
        backgroundColor: '#fff',
        shadowColor: '#0000001A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
        paddingHorizontal: 5,
        paddingTop: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        width: "100%",
        
    },
   image: {
        width: "100%",
        height: 100,
        
        },
    infoContainer: {
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    name: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1C1D',
    },
    price: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1C1D',
        marginTop: 5,
    },
    description: {
        fontSize: 12,
        color: '#D4AF37',
        marginTop: 10,
        fontWeight: '600',
    }
});