import React from 'react';
import { View , Image , Text , TouchableOpacity , StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { Divider } from 'react-native-paper';



const PropertyCard = ({items}) => {
    // console.log(items , 'items');
    const navigation = useNavigation();
    return (
        <>
        <TouchableOpacity onPress={() => navigation.navigate("MyPropertyDetails")} >
        <View style={styles.container}>
            <Image source={items.Image} style={styles.PropertyImage}/>
            <View>
                <Text style={styles.PropertyName}>{items.Name}</Text>
                <Text style={styles.PropertyType}>{items.propertytype}</Text>
                <Text style={styles.PropertyPrice}>{items.price}</Text>
                <View style={styles.PropertyLocation}>
                <MaterialIcon name="location-on" size={18} color="#D4AF37" />
                <Text style={styles.PropertyCity}>{items.city}</Text>
                </View>
            </View>

</View>
        </TouchableOpacity>
        <Divider />
        </>
    );
}


export default PropertyCard;

const styles = StyleSheet.create({
    container : {
        flexDirection : 'row',
        justifyContent : 'flex-start',
        alignItems : 'center',
        paddingVertical : 15,
        paddingHorizontal : 0,
        marginVertical : 5,
       },
       PropertyImage : {
        width : '40%',
        height : 100,
        resizeMode : 'contain',
        borderRadius : 10,
    },
    PropertyName : {
        fontSize : 17,
        fontWeight : '500',
        color : "#141414",
        textAlign : 'left',
        marginBottom : 5,
    },
    PropertyType : {
        fontSize : 13,
        fontWeight : '600',
        color : "#A0A0A0",
        textAlign : 'left',
        marginBottom : 5,
    },
    PropertyPrice : {
        fontSize : 13,
        fontWeight : '600',
        color : "#1A1C1D",
        textAlign : 'left',
        marginBottom : 10,
    },
    PropertyLocation : {
        flexDirection : 'row',
        justifyContent : 'flex-start',
        alignItems : 'center',
    },
    PropertyCity : {
        fontSize : 13,
        fontWeight : '600',
        color : "#A0A0A0",
        textAlign : 'left',
        marginLeft : 5,
    }
})
